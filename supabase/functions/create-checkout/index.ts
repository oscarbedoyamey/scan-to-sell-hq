import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map package duration to Stripe recurring interval
const intervalMap: Record<number, { interval: string; interval_count: number }> = {
  3: { interval: "month", interval_count: 3 },
  6: { interval: "month", interval_count: 6 },
  12: { interval: "year", interval_count: 1 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { package_id, listing_id } = await req.json();
    if (!package_id) throw new Error("package_id is required");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch user locale for Stripe preferred_locales
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("locale")
      .eq("id", user.id)
      .maybeSingle();
    const userLocale = profile?.locale || "en";

    const { data: pkg, error: pkgError } = await supabaseAdmin
      .from("packages")
      .select("*")
      .eq("id", package_id)
      .eq("active", true)
      .maybeSingle();

    if (pkgError || !pkg) throw new Error("Package not found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Ensure we have a recurring price for this package
    let recurringPriceId = pkg.stripe_price_id;

    // Check if existing price is recurring; if not, create a recurring one
    if (recurringPriceId) {
      try {
        const existingPrice = await stripe.prices.retrieve(recurringPriceId);
        if (!existingPrice.recurring) {
          console.log(`Price ${recurringPriceId} is one-time, need to create recurring price`);
          recurringPriceId = null;
        }
      } catch {
        recurringPriceId = null;
      }
    }

    if (!recurringPriceId) {
      // Create a new recurring price for this package
      const intervalConfig = intervalMap[pkg.duration_months] || { interval: "month", interval_count: pkg.duration_months };
      
      // Find or create a product
      let productId: string;
      const existingProducts = await stripe.products.search({
        query: `name~"ZIGNO" AND name~"${pkg.duration_months}"`,
        limit: 1,
      });
      
      if (existingProducts.data.length > 0) {
        productId = existingProducts.data[0].id;
      } else {
        const product = await stripe.products.create({
          name: `ZIGNO – ${pkg.duration_months} months`,
          description: `Property listing with QR poster - ${pkg.duration_months} month subscription`,
        });
        productId = product.id;
      }

      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: pkg.price_eur * 100,
        currency: "eur",
        recurring: {
          interval: intervalConfig.interval as any,
          interval_count: intervalConfig.interval_count,
        },
      });

      recurringPriceId = newPrice.id;

      // Store back in DB for future use
      await supabaseAdmin
        .from("packages")
        .update({ stripe_price_id: recurringPriceId })
        .eq("id", pkg.id);

      console.log(`Created recurring price ${recurringPriceId} for package ${pkg.id}`);
    }

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      await stripe.customers.update(customerId, { preferred_locales: [userLocale] });
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        preferred_locales: [userLocale],
        metadata: { supabase_user_id: user.id },
      });
      customerId = newCustomer.id;
    }

    // Create a purchase record (pending), linked to listing if provided
    const purchasePayload: Record<string, any> = {
      user_id: user.id,
      package_id: pkg.id,
      amount_eur: pkg.price_eur,
      status: "pending",
    };
    if (listing_id) {
      purchasePayload.listing_id = listing_id;
    }

    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert(purchasePayload)
      .select("id")
      .single();

    if (purchaseError) throw new Error("Failed to create purchase record");

    const origin = req.headers.get("origin") || "https://scan-to-sell-hq.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: recurringPriceId, quantity: 1 }],
      mode: "subscription",
      locale: userLocale as any,
      success_url: `${origin}/payment-success?purchase_id=${purchase.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app/listings/${listing_id || ""}`,
      metadata: {
        purchase_id: purchase.id,
        package_id: pkg.id,
        user_id: user.id,
        listing_id: listing_id || "",
      },
      subscription_data: {
        metadata: {
          purchase_id: purchase.id,
          package_id: pkg.id,
          user_id: user.id,
          listing_id: listing_id || "",
        },
      },
    });

    await supabaseAdmin
      .from("purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", purchase.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
