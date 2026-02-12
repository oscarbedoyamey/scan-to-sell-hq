import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PUBLISHED_URL = "https://scan-to-sell-hq.lovable.app";

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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

      await supabaseAdmin
        .from("purchases")
        .update({
          status: "paid",
          stripe_payment_intent_id: session.payment_intent as string,
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

        if (!signId) {
          // Get listing data for sign defaults
          const { data: listing } = await supabaseAdmin
            .from("listings")
            .select("operation_type, base_language")
            .eq("id", listingId)
            .single();

          // Generate a unique sign_code
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

          // Determine headline based on operation type and language
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

            // Record assignment in sign_assignments history
            await supabaseAdmin
              .from("sign_assignments")
              .insert({
                sign_id: newSign.id,
                listing_id: listingId,
                assigned_by: user.id,
              });
          }
        }

        // Auto-generate assets if we have a sign
        if (signId) {
          try {
            const functionsUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".supabase.co/functions/v1");
            const response = await fetch(`${functionsUrl}/generate-sign-assets`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ sign_id: signId }),
            });

            if (!response.ok) {
              const errText = await response.text();
              console.error("Asset generation failed:", errText);
            }
          } catch (genErr) {
            console.error("Asset generation error:", genErr);
            // Non-blocking: payment is still verified even if asset gen fails
          }
        }
      }

      // Send payment confirmation email
      try {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email, locale")
          .eq("id", user.id)
          .single();

        const { data: listing } = await supabaseAdmin
          .from("listings")
          .select("title, city")
          .eq("id", listingId)
          .single();

        if (profile?.email) {
          const { data: pkgInfo } = await supabaseAdmin
            .from("packages")
            .select("price_eur")
            .eq("id", purchase?.package_id)
            .single();

          const functionsUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".supabase.co/functions/v1");
          await fetch(`${functionsUrl}/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              type: "payment_confirmation",
              to: profile.email,
              locale: profile.locale || "en",
              data: {
                listingTitle: listing?.title || listing?.city || "—",
                amount: pkgInfo ? `${pkgInfo.price_eur} €` : "—",
                endDate: endAt.toLocaleDateString(profile.locale || "en", { year: "numeric", month: "long", day: "numeric" }),
              },
            }),
          });
        }
      } catch (emailErr) {
        console.error("Payment confirmation email error:", emailErr);
        // Non-blocking
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
