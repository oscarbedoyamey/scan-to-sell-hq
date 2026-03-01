import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PUBLISHED_URL = "https://zignoqr.com";

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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Authenticate user
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { sign_id, fallback_language, phone: requestPhone } = await req.json();
    if (!sign_id) throw new Error("sign_id is required");

    // Optionally verify user ownership (skip if called with service role key)
    const authHeader = req.headers.get("Authorization");
    let isServiceRole = false;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      // Check if it's the service role key (internal call)
      if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
        isServiceRole = true;
      } else {
        const { data: authData } = await supabaseClient.auth.getUser(token);
        const user = authData.user;
        if (!user) throw new Error("User not authenticated");

        // Verify ownership below after fetching listing
        var authenticatedUserId = user.id;
      }
    } else {
      throw new Error("Authorization required");
    }

    // Fetch sign + listing
    const { data: sign, error: signError } = await supabaseAdmin
      .from("signs")
      .select("*")
      .eq("id", sign_id)
      .single();

    if (signError || !sign) throw new Error("Sign not found");

    const { data: listing, error: listingError } = await supabaseAdmin
      .from("listings")
      .select("*")
      .eq("id", sign.listing_id)
      .single();

    if (listingError || !listing) throw new Error("Listing not found");

    // Verify ownership (skip for service role calls)
    if (!isServiceRole && authenticatedUserId) {
      if (listing.owner_user_id !== authenticatedUserId) {
        const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
          _user_id: authenticatedUserId,
          _role: "admin",
        });
        if (!isAdmin) throw new Error("Unauthorized");
      }
    }

    const publicUrl = `${PUBLISHED_URL}/s/${sign.sign_code}`;

    // --- 1. Generate QR code via QuickChart ---
    const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(publicUrl)}&size=600&margin=2&format=png`;
    const qrResponse = await fetch(qrApiUrl);
    if (!qrResponse.ok) throw new Error("Failed to generate QR code");
    const qrBuffer = new Uint8Array(await qrResponse.arrayBuffer());

    // Upload QR to storage
    const qrPath = `signs/${sign.id}/qr.png`;
    const { error: qrUploadError } = await supabaseAdmin.storage
      .from("generated-assets")
      .upload(qrPath, qrBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (qrUploadError) throw new Error(`QR upload failed: ${qrUploadError.message}`);

    // --- 2. Call n8n webhook to generate the poster ---
    const { data: qrPublicUrlData } = supabaseAdmin.storage
      .from("generated-assets")
      .getPublicUrl(qrPath);

    const signLang = fallback_language || sign.language || listing.base_language || "es";
    const saleRentText = getSignText(signLang, listing.operation_type || "sale");

    const webhookUrl = "https://obminversion.app.n8n.cloud/webhook/43dc4fb9-fc7a-4af6-b06c-0fecc7dee9f9";
    const webhookBody = {
      listingId: listing.id,
      language: signLang,
      Text: saleRentText,
      size: sign.size || "A4",
      type: listing.property_type || "",
      qrUrl: qrPublicUrlData.publicUrl,
      phone: requestPhone || "",
    };

    console.log("Calling n8n webhook:", JSON.stringify(webhookBody));
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookBody),
    });

    if (!webhookResponse.ok) {
      const errText = await webhookResponse.text();
      console.error("n8n webhook error:", errText);
      throw new Error(`Webhook failed (${webhookResponse.status}): ${errText}`);
    }

    // --- 3. Save the returned poster to storage ---
    // n8n may return raw PNG bytes OR a JSON with a URL to the image
    const responseContentType = webhookResponse.headers.get("content-type") || "";
    const responseBytes = new Uint8Array(await webhookResponse.arrayBuffer());
    console.log(`Webhook response: ${responseBytes.byteLength} bytes, content-type: ${responseContentType}`);

    let posterBuffer: Uint8Array;

    // If response is small or not an image, it's likely JSON with a URL
    if (responseBytes.byteLength < 1000 || responseContentType.includes("application/json") || responseContentType.includes("text/")) {
      const responseText = new TextDecoder().decode(responseBytes);
      console.log("Webhook response body:", responseText);

      // Try to parse as JSON and extract an image URL
      let imageUrl: string | null = null;
      try {
        const parsed = JSON.parse(responseText);
        // Common patterns: { url: "..." }, { imageUrl: "..." }, { data: { url: "..." } }, or just a string URL
        imageUrl = parsed.url || parsed.imageUrl || parsed.image_url || parsed.data?.url || parsed.data?.imageUrl || null;
        // If parsed is an array, try first element
        if (!imageUrl && Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          imageUrl = typeof first === "string" ? first : (first.url || first.imageUrl || first.image_url || null);
        }
      } catch {
        // Maybe it's a plain URL string
        if (responseText.startsWith("http")) {
          imageUrl = responseText.trim();
        }
      }

      if (imageUrl) {
        console.log("Fetching poster image from URL:", imageUrl);
        const imgResponse = await fetch(imageUrl);
        if (!imgResponse.ok) throw new Error(`Failed to fetch poster image: ${imgResponse.status}`);
        posterBuffer = new Uint8Array(await imgResponse.arrayBuffer());
        console.log(`Downloaded poster: ${posterBuffer.byteLength} bytes`);
      } else {
        throw new Error(`Webhook returned non-image response (${responseBytes.byteLength} bytes): ${responseText.substring(0, 500)}`);
      }
    } else {
      posterBuffer = responseBytes;
      console.log(`Received poster PNG: ${posterBuffer.byteLength} bytes`);
    }

    const posterPath = `signs/${sign.id}/poster.png`;
    const { error: posterUploadError } = await supabaseAdmin.storage
      .from("generated-assets")
      .upload(posterPath, posterBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (posterUploadError) throw new Error(`Poster upload failed: ${posterUploadError.message}`);

    const { data: posterPublicUrlData } = supabaseAdmin.storage
      .from("generated-assets")
      .getPublicUrl(posterPath);

    // --- 4. Update sign record ---
    const { error: updateError } = await supabaseAdmin
      .from("signs")
      .update({
        qr_image_path: qrPath,
        sign_pdf_path: posterPath,
        public_url: publicUrl,
      })
      .eq("id", sign.id);

    if (updateError) throw new Error(`Sign update failed: ${updateError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        qr_url: qrPublicUrlData.publicUrl,
        poster_url: posterPublicUrlData.publicUrl,
        public_url: publicUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Generate sign assets error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
