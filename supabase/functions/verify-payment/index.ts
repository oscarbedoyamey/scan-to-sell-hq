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
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { session_id, purchase_id } = await req.json();
    if (!session_id || !purchase_id) throw new Error("session_id and purchase_id are required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (session.payment_status === "paid") {
      // Get package duration
      const { data: purchase } = await supabaseAdmin
        .from("purchases")
        .select("package_id")
        .eq("id", purchase_id)
        .single();

      const { data: pkg } = await supabaseAdmin
        .from("packages")
        .select("duration_months")
        .eq("id", purchase?.package_id)
        .single();

      const now = new Date();
      const endAt = new Date(now);
      endAt.setMonth(endAt.getMonth() + (pkg?.duration_months || 3));

      await supabaseAdmin
        .from("purchases")
        .update({
          status: "paid",
          stripe_payment_intent_id: session.payment_intent as string,
          start_at: now.toISOString(),
          end_at: endAt.toISOString(),
        })
        .eq("id", purchase_id);

      return new Response(JSON.stringify({ verified: true, status: "paid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ verified: false, status: session.payment_status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
