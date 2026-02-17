import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const { data: pkg, error: pkgError } = await supabaseAdmin
      .from("packages")
      .select("*")
      .eq("id", package_id)
      .eq("active", true)
      .maybeSingle();

    if (pkgError || !pkg) throw new Error("Package not found");
    if (!pkg.stripe_price_id) throw new Error("Package has no Stripe price configured");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
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

    // Use embedded mode — returns client_secret instead of url
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: pkg.stripe_price_id, quantity: 1 }],
      mode: "payment",
      ui_mode: "embedded",
      return_url: `${origin}/payment-success?purchase_id=${purchase.id}&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        purchase_id: purchase.id,
        package_id: pkg.id,
        user_id: user.id,
        listing_id: listing_id || "",
      },
    });

    await supabaseAdmin
      .from("purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", purchase.id);

    return new Response(
      JSON.stringify({ client_secret: session.client_secret }),
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
