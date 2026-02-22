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
    if (!user?.id) throw new Error("User not authenticated");

    const { purchase_id, auto_renew } = await req.json();
    if (!purchase_id) throw new Error("purchase_id is required");
    if (typeof auto_renew !== "boolean") throw new Error("auto_renew must be a boolean");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the purchase and verify ownership
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .select("stripe_subscription_id, user_id, listing_id")
      .eq("id", purchase_id)
      .single();

    if (purchaseError || !purchase) throw new Error("Purchase not found");
    if (purchase.user_id !== user.id) throw new Error("Not authorized");
    if (!purchase.stripe_subscription_id) throw new Error("No subscription found for this purchase");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Toggle cancel_at_period_end on the Stripe subscription
    await stripe.subscriptions.update(purchase.stripe_subscription_id, {
      cancel_at_period_end: !auto_renew,
    });

    console.log(`Subscription ${purchase.stripe_subscription_id} auto_renew set to ${auto_renew}`);

    // Update listing auto_renew flag
    if (purchase.listing_id) {
      await supabaseAdmin
        .from("listings")
        .update({ auto_renew })
        .eq("id", purchase.listing_id);
    }

    return new Response(
      JSON.stringify({ success: true, auto_renew }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Toggle auto-renew error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
