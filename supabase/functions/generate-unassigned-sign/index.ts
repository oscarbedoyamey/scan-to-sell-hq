import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const N8N_WEBHOOK_URL = "https://obminversion.app.n8n.cloud/webhook/43dc4fb9-fc7a-4af6-b06c-0fecc7dee9f9";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { signId, batchId, token, qrUrl, language, type, propertyType, phone } = await req.json();

    console.log(`Generating sign for token: ${token}`);

    // Call n8n webhook
    const webhookResp = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrUrl, language, type, propertyType, phone, token }),
    });

    if (!webhookResp.ok) {
      const errText = await webhookResp.text();
      console.error(`Webhook returned ${webhookResp.status}: ${errText}`);
      return new Response(JSON.stringify({ error: `Webhook error: ${webhookResp.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = webhookResp.headers.get("content-type") || "";
    const filePath = `signs/${batchId}/${token}.png`;
    let uploaded = false;

    if (contentType.includes("image") || contentType.includes("octet-stream")) {
      const blob = await webhookResp.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const { error: uploadErr } = await supabase.storage
        .from("sign-assets")
        .upload(filePath, new Uint8Array(arrayBuffer), { contentType: "image/png", upsert: true });
      if (uploadErr) console.error("Upload error:", uploadErr);
      else uploaded = true;
    } else {
      const json = await webhookResp.json();
      console.log("Webhook JSON response:", JSON.stringify(json));
      if (json.url) {
        const imgResp = await fetch(json.url);
        const blob = await imgResp.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const { error: uploadErr } = await supabase.storage
          .from("sign-assets")
          .upload(filePath, new Uint8Array(arrayBuffer), { contentType: "image/png", upsert: true });
        if (uploadErr) console.error("Upload error:", uploadErr);
        else uploaded = true;
      }
    }

    if (uploaded) {
      await supabase
        .from("unassigned_signs")
        .update({ png_filename: filePath })
        .eq("id", signId);

      const { data: publicUrlData } = supabase.storage.from("sign-assets").getPublicUrl(filePath);

      return new Response(JSON.stringify({ success: true, filePath, publicUrl: publicUrlData.publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Could not process webhook response" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
