import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const N8N_WEBHOOK_URL = "https://obminversion.app.n8n.cloud/webhook-test/43dc4fb9-fc7a-4af6-b06c-0fecc7dee9f9";

const SIGN_TEXT: Record<string, { sale: string; rent: string }> = {
  en: { sale: "FOR SALE", rent: "FOR RENT" },
  es: { sale: "SE VENDE", rent: "SE ALQUILA" },
  fr: { sale: "À VENDRE", rent: "À LOUER" },
  pt: { sale: "VENDE-SE", rent: "ALUGA-SE" },
  it: { sale: "VENDESI", rent: "Affittasi" },
  de: { sale: "ZU VERKAUFEN", rent: "ZU VERMIETEN" },
  pl: { sale: "NA SPRZEDAŻ", rent: "DO WYNAJĘCIA" },
};

const getSignText = (lang: string, opType: string): string => {
  const l = SIGN_TEXT[lang] || SIGN_TEXT["en"];
  return opType === "rent" ? l.rent : l.sale;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { signId, batchId, token, language, type, propertyType, phone } = await req.json();

    console.log(`Generating sign for token: ${token}`);

    // 1. Generate QR code image pointing to the activation URL
    const activationUrl = `https://zignoqr.com/activate/${token}`;
    const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(activationUrl)}&size=600&margin=2&format=png`;
    const qrResponse = await fetch(qrApiUrl);
    if (!qrResponse.ok) throw new Error("Failed to generate QR code");
    const qrBuffer = new Uint8Array(await qrResponse.arrayBuffer());

    // 2. Upload QR to storage
    const qrPath = `signs/${batchId}/${token}_qr.png`;
    const { error: qrUploadError } = await supabase.storage
      .from("sign-assets")
      .upload(qrPath, qrBuffer, { contentType: "image/png", upsert: true });

    if (qrUploadError) {
      console.error("QR upload error:", qrUploadError);
      throw new Error(`QR upload failed: ${qrUploadError.message}`);
    }

    // 3. Get public URL of the uploaded QR
    const { data: qrPublicUrlData } = supabase.storage.from("sign-assets").getPublicUrl(qrPath);
    const qrPublicUrl = qrPublicUrlData.publicUrl;
    console.log("QR uploaded, public URL:", qrPublicUrl);

    // 4. Map transaction type to localized display text
    const lang = language || "es";
    const textValue = getSignText(lang, type);

    // 5. Call n8n webhook with correct parameter names
    const webhookBody = {
      qrUrl: qrPublicUrl,
      language: language || "es",
      Text: textValue,
      size: "A4",
      type: propertyType || "apartment",
      phone: phone ? "" : "",
    };

    console.log("Calling n8n webhook:", JSON.stringify(webhookBody));
    const webhookResp = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookBody),
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
      // Try to parse as JSON with a URL
      const responseBytes = new Uint8Array(await webhookResp.arrayBuffer());
      const responseText = new TextDecoder().decode(responseBytes);
      console.log("Webhook response body:", responseText);

      let imageUrl: string | null = null;
      try {
        const parsed = JSON.parse(responseText);
        imageUrl = parsed.url || parsed.imageUrl || parsed.image_url || parsed.data?.url || null;
        if (!imageUrl && Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          imageUrl = typeof first === "string" ? first : (first.url || first.imageUrl || null);
        }
      } catch {
        if (responseText.startsWith("http")) {
          imageUrl = responseText.trim();
        }
      }

      if (imageUrl) {
        console.log("Fetching poster from URL:", imageUrl);
        const imgResp = await fetch(imageUrl);
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
