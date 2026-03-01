import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PUBLISHED_URL = "https://zignoqr.com";

function generateSignCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { session_id, purchase_id } = await req.json();
    if (!session_id || !purchase_id) throw new Error("session_id and purchase_id are required");

    // Get user from auth header if available, otherwise from purchase record
    let userId: string | null = null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const userToken = authHeader.replace("Bearer ", "");
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const { data } = await supabaseClient.auth.getUser(userToken);
      userId = data.user?.id ?? null;
    }

    if (!userId) {
      const { data: purchaseRow } = await supabaseAdmin
        .from("purchases")
        .select("user_id")
        .eq("id", purchase_id)
        .single();
      userId = purchaseRow?.user_id ?? null;
    }

    if (!userId) throw new Error("Could not determine user");

    console.log("Verifying payment", { session_id, purchase_id, userId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // Get purchase with package info
      const { data: purchase } = await supabaseAdmin
        .from("purchases")
        .select("package_id, listing_id")
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

      // Get subscription ID from session (subscription mode)
      const subscriptionId = session.subscription as string | null;

      await supabaseAdmin
        .from("purchases")
        .update({
          status: "paid",
          stripe_payment_intent_id: session.payment_intent as string || null,
          stripe_subscription_id: subscriptionId,
          start_at: now.toISOString(),
          end_at: endAt.toISOString(),
        })
        .eq("id", purchase_id);

      const listingId = purchase?.listing_id;

      if (listingId) {
        // Activate the listing
        await supabaseAdmin
          .from("listings")
          .update({ status: "active" })
          .eq("id", listingId);

        // Check if a sign already exists for this listing
        const { data: existingSigns } = await supabaseAdmin
          .from("signs")
          .select("id")
          .eq("listing_id", listingId)
          .limit(1);

        let signId: string | null = existingSigns?.[0]?.id || null;

        // Get listing data
        const { data: listing } = await supabaseAdmin
          .from("listings")
          .select("operation_type, base_language")
          .eq("id", listingId)
          .single();

        if (!signId) {
          let signCode = generateSignCode();
          let attempts = 0;
          while (attempts < 10) {
            const { data: existing } = await supabaseAdmin
              .from("signs")
              .select("id")
              .eq("sign_code", signCode)
              .maybeSingle();
            if (!existing) break;
            signCode = generateSignCode();
            attempts++;
          }

          const headlineMap: Record<string, Record<string, string>> = {
            sale: { es: "SE VENDE", en: "FOR SALE", fr: "À VENDRE", de: "ZU VERKAUFEN", it: "IN VENDITA", pt: "VENDE-SE", pl: "NA SPRZEDAŻ" },
            rent: { es: "SE ALQUILA", en: "FOR RENT", fr: "À LOUER", de: "ZU VERMIETEN", it: "IN AFFITTO", pt: "ALUGA-SE", pl: "DO WYNAJĘCIA" },
          };
          const lang = listing?.base_language || "es";
          const opType = listing?.operation_type || "sale";
          const headline = headlineMap[opType]?.[lang] || headlineMap[opType]?.en || "FOR SALE";

          const publicUrl = `${PUBLISHED_URL}/s/${signCode}`;

          const { data: newSign, error: signError } = await supabaseAdmin
            .from("signs")
            .insert({
              listing_id: listingId,
              sign_code: signCode,
              language: lang,
              headline_text: headline,
              show_sale_rent_badge: true,
              show_phone: true,
              show_price: true,
              public_url: publicUrl,
            })
            .select("id")
            .single();

          if (signError) {
            console.error("Error creating sign:", signError);
          } else {
            signId = newSign.id;
            await supabaseAdmin
              .from("sign_assignments")
              .insert({
                sign_id: newSign.id,
                listing_id: listingId,
                assigned_by: userId,
              });
          }
        }

        // Auto-generate assets
        if (signId) {
          const functionsUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".supabase.co/functions/v1");
          const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
          fetch(`${functionsUrl}/generate-sign-assets`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({ sign_id: signId, fallback_language: listing?.base_language || "es" }),
          }).catch((genErr) => {
            console.error("Asset generation error:", genErr);
          });
        }
      }

      return new Response(JSON.stringify({ verified: true, status: "paid", listing_id: listingId }), {
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
