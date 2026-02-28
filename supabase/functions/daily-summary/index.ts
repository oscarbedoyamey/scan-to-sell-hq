import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RECIPIENT = "oscarbedoyamey@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Fetch last 24h data in parallel
    const [
      { count: newUsers },
      { count: newListings },
      { data: newPurchases },
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", yesterday),
      supabase.from("listings").select("id", { count: "exact", head: true }).gte("created_at", yesterday),
      supabase.from("purchases").select("id, package_id, amount_eur").eq("status", "paid").gte("created_at", yesterday),
    ]);

    const paidCount = newPurchases?.length || 0;
    const totalRevenue = (newPurchases || []).reduce((sum: number, p: any) => sum + (p.amount_eur || 0), 0);

    const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; padding: 32px 16px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">
    <div style="background: #18181b; padding: 24px 32px;">
      <h1 style="color: #ffffff; font-size: 20px; margin: 0;">ZIGNO Daily Summary</h1>
      <p style="color: #a1a1aa; font-size: 13px; margin: 6px 0 0;">${dateStr}</p>
    </div>
    <div style="padding: 28px 32px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5;">
            <span style="color: #71717a; font-size: 13px;">New Users</span>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5; text-align: right;">
            <span style="font-size: 22px; font-weight: 700; color: #18181b;">${newUsers || 0}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5;">
            <span style="color: #71717a; font-size: 13px;">New Listings</span>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5; text-align: right;">
            <span style="font-size: 22px; font-weight: 700; color: #18181b;">${newListings || 0}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5;">
            <span style="color: #71717a; font-size: 13px;">Subscriptions Paid</span>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5; text-align: right;">
            <span style="font-size: 22px; font-weight: 700; color: #18181b;">${paidCount}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 0;">
            <span style="color: #71717a; font-size: 13px;">Revenue (24h)</span>
          </td>
          <td style="padding: 14px 0; text-align: right;">
            <span style="font-size: 22px; font-weight: 700; color: #18181b;">€${totalRevenue}</span>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding: 16px 32px; background: #fafafa; border-top: 1px solid #f4f4f5;">
      <p style="color: #a1a1aa; font-size: 11px; margin: 0; text-align: center;">Automated daily report from ZIGNO admin</p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ZIGNO <onboarding@resend.dev>",
        to: [RECIPIENT],
        subject: `ZIGNO Daily — ${paidCount} subs, ${newListings || 0} listings, ${newUsers || 0} users`,
        html,
      }),
    });

    const result = await res.json();
    console.log("[DAILY-SUMMARY] Email sent:", JSON.stringify(result));

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[DAILY-SUMMARY] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
