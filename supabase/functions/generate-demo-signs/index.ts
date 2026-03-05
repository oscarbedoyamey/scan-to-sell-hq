import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEMO_QR_URL = "https://zignoqr.com/demo";

const TRANSACTION_TYPES = [
  { slug: "se-vende", text: "SE VENDE", opType: "sale" },
  { slug: "se-alquila", text: "SE ALQUILA", opType: "rent" },
];

const PROPERTY_TYPES = [
  { slug: "piso", dbType: "apartment" },
  { slug: "casa", dbType: "house" },
  { slug: "atico", dbType: "apartment" },
  { slug: "bajo", dbType: "apartment" },
  { slug: "local", dbType: "commercial" },
  { slug: "oficina", dbType: "office" },
  { slug: "nave", dbType: "warehouse" },
  { slug: "garaje", dbType: "garage" },
  { slug: "terreno", dbType: "land" },
  { slug: "edificio", dbType: "commercial" },
];

const WEBHOOK_URL = "https://obminversion.app.n8n.cloud/webhook/43dc4fb9-fc7a-4af6-b06c-0fecc7dee9f9";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Auth: accept service role key OR authenticated admin user
  // Also allow unauthenticated calls when invoked via internal tools
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    if (token !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const { data: authData } = await supabaseClient.auth.getUser(token);
      if (authData.user) {
        const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
          _user_id: authData.user.id,
          _role: "admin",
        });
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin only" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          });
        }
      }
    }
  }

  try {
    // Parse optional batch params
    let batchStart = 0;
    let batchSize = 20; // default: all
    try {
      const body = await req.json();
      if (body.start !== undefined) batchStart = body.start;
      if (body.count !== undefined) batchSize = body.count;
    } catch { /* empty body is fine */ }
    // 1. Generate a single QR code pointing to the demo URL
    const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(DEMO_QR_URL)}&size=600&margin=2&format=png`;
    const qrResponse = await fetch(qrApiUrl);
    if (!qrResponse.ok) throw new Error("Failed to generate demo QR code");
    const qrBuffer = new Uint8Array(await qrResponse.arrayBuffer());

    // Upload demo QR
    const qrPath = "demo-signs/qr-demo.png";
    await supabaseAdmin.storage
      .from("generated-assets")
      .upload(qrPath, qrBuffer, { contentType: "image/png", upsert: true });

    const { data: qrPublicUrlData } = supabaseAdmin.storage
      .from("generated-assets")
      .getPublicUrl(qrPath);

    const qrUrl = qrPublicUrlData.publicUrl;
    console.log("Demo QR uploaded:", qrUrl);

    // 2. Generate posters for batched combinations
    const allCombinations: Array<{ tx: typeof TRANSACTION_TYPES[0]; prop: typeof PROPERTY_TYPES[0] }> = [];
    for (const tx of TRANSACTION_TYPES) {
      for (const prop of PROPERTY_TYPES) {
        allCombinations.push({ tx, prop });
      }
    }
    const batch = allCombinations.slice(batchStart, batchStart + batchSize);
    console.log(`Processing batch: start=${batchStart}, count=${batch.length}, total=${allCombinations.length}`);

    const results: Array<{ type: string; property: string; status: string; url?: string; error?: string }> = [];

    for (const { tx, prop } of batch) {
        const key = `${tx.slug}/${prop.slug}`;
        console.log(`Generating demo sign: ${key}`);

        try {
          const webhookBody = {
            listingId: "demo",
            language: "es",
            Text: tx.text,
            size: "A3",
            type: prop.dbType,
            qrUrl,
            phone: "",
          };

          console.log(`Webhook body for ${key}:`, JSON.stringify(webhookBody));

          const webhookResponse = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhookBody),
          });

          const responseStatus = webhookResponse.status;
          const responseContentType = webhookResponse.headers.get("content-type") || "";
          const responseBytes = new Uint8Array(await webhookResponse.arrayBuffer());
          console.log(`Webhook response for ${key}: status=${responseStatus}, bytes=${responseBytes.byteLength}, content-type=${responseContentType}`);

          if (!webhookResponse.ok) {
            const errText = new TextDecoder().decode(responseBytes);
            console.error(`Webhook failed for ${key}:`, errText);
            results.push({ type: tx.slug, property: prop.slug, status: "error", error: errText });
            continue;
          }

          let posterBuffer: Uint8Array;
          let posterMime = "image/png";

          if (responseBytes.byteLength < 1000 || responseContentType.includes("application/json") || responseContentType.includes("text/")) {
            const responseText = new TextDecoder().decode(responseBytes);
            let imageUrl: string | null = null;
            try {
              const parsed = JSON.parse(responseText);
              imageUrl = parsed.url || parsed.imageUrl || parsed.image_url || parsed.data?.url || parsed.data?.imageUrl || null;
              if (!imageUrl && Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                imageUrl = typeof first === "string" ? first : (first.url || first.imageUrl || first.image_url || null);
              }
            } catch {
              if (responseText.startsWith("http")) {
                imageUrl = responseText.trim();
              }
            }

            if (imageUrl) {
              const imgResponse = await fetch(imageUrl);
              if (!imgResponse.ok) throw new Error(`Failed to fetch poster: ${imgResponse.status}`);
              posterBuffer = new Uint8Array(await imgResponse.arrayBuffer());
              posterMime = imgResponse.headers.get("content-type") || "image/png";
            } else {
              throw new Error(`Non-image response: ${responseText.substring(0, 200)}`);
            }
          } else {
            posterBuffer = responseBytes;
            posterMime = responseContentType.split(";")[0].trim() || "image/png";
          }

          const ext = posterMime.includes("jpeg") || posterMime.includes("jpg") ? "jpg" : "png";
          const posterPath = `demo-signs/${tx.slug}/${prop.slug}/poster.${ext}`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from("generated-assets")
            .upload(posterPath, posterBuffer, { contentType: posterMime, upsert: true });

          if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

          const { data: posterUrlData } = supabaseAdmin.storage
            .from("generated-assets")
            .getPublicUrl(posterPath);

          console.log(`✅ ${key} → ${posterUrlData.publicUrl}`);
          results.push({ type: tx.slug, property: prop.slug, status: "ok", url: posterUrlData.publicUrl });
        } catch (err) {
          console.error(`❌ ${key}:`, err);
          results.push({ type: tx.slug, property: prop.slug, status: "error", error: err.message });
        }
    }

    return new Response(JSON.stringify({ success: true, batch_start: batchStart, batch_count: batch.length, total: allCombinations.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate demo signs error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
