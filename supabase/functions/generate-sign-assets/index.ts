import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { jsPDF } from "npm:jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PUBLISHED_URL = "https://scan-to-sell-hq.lovable.app";

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
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    const user = authData.user;
    if (!user) throw new Error("User not authenticated");

    const { sign_id } = await req.json();
    if (!sign_id) throw new Error("sign_id is required");

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

    // Verify ownership
    if (listing.owner_user_id !== user.id) {
      // Check admin role
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Unauthorized");
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

    // --- 2. Generate PDF sign ---
    const isA3 = sign.size === "A3";
    const isLandscape = sign.orientation === "landscape";

    // jsPDF dimensions in mm
    const pageW = isA3 ? (isLandscape ? 420 : 297) : (isLandscape ? 297 : 210);
    const pageH = isA3 ? (isLandscape ? 297 : 420) : (isLandscape ? 210 : 297);

    const doc = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: isA3 ? "a3" : "a4",
    });

    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = margin;

    // Colors
    const navy = [11, 31, 58]; // #0B1F3A
    const red = [215, 38, 61]; // #D7263D
    const gray = [100, 100, 100];
    const white = [255, 255, 255];

    // --- Background ---
    doc.setFillColor(247, 247, 245); // #F7F7F5
    doc.rect(0, 0, pageW, pageH, "F");

    // --- Top accent bar ---
    doc.setFillColor(...red);
    doc.rect(0, 0, pageW, 8, "F");
    y = 18;

    // --- Headline / Badge (SE VENDE, SE ALQUILA, etc.) ---
    if (sign.show_sale_rent_badge && sign.headline_text) {
      doc.setFillColor(...navy);
      const badgeH = 14;
      doc.roundedRect(margin, y, contentW, badgeH, 3, 3, "F");
      doc.setTextColor(...white);
      doc.setFontSize(isA3 ? 28 : 22);
      doc.setFont("helvetica", "bold");
      doc.text(sign.headline_text.toUpperCase(), pageW / 2, y + badgeH / 2 + 1, {
        align: "center",
        baseline: "middle",
      });
      y += badgeH + 10;
    } else {
      y += 5;
    }

    // --- QR Code ---
    // Convert QR PNG to base64 data URL for jsPDF
    const qrBase64 = btoa(String.fromCharCode(...qrBuffer));
    const qrDataUrl = `data:image/png;base64,${qrBase64}`;
    const qrSize = Math.min(contentW * 0.55, pageH * 0.35);
    const qrX = (pageW - qrSize) / 2;
    doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
    y += qrSize + 6;

    // --- Short URL ---
    doc.setTextColor(...navy);
    doc.setFontSize(isA3 ? 14 : 11);
    doc.setFont("helvetica", "normal");
    doc.text(publicUrl.replace("https://", ""), pageW / 2, y, { align: "center" });
    y += 10;

    // --- Contact info ---
    if (sign.show_phone && listing.contact_phone) {
      doc.setFontSize(isA3 ? 20 : 16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text(`☎ ${listing.contact_phone}`, pageW / 2, y, { align: "center" });
      y += isA3 ? 12 : 9;
    }

    if (sign.show_email && listing.contact_email) {
      doc.setFontSize(isA3 ? 14 : 11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      doc.text(`✉ ${listing.contact_email}`, pageW / 2, y, { align: "center" });
      y += isA3 ? 10 : 8;
    }

    if (sign.show_whatsapp && listing.contact_whatsapp) {
      doc.setFontSize(isA3 ? 14 : 11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(37, 211, 102); // WhatsApp green
      doc.text(`WhatsApp: ${listing.contact_whatsapp}`, pageW / 2, y, { align: "center" });
      y += isA3 ? 10 : 8;
    }

    // --- Property type icon text ---
    const showIcons = sign.show_icons as Record<string, boolean> | null;
    const iconParts: string[] = [];
    if (showIcons?.bed && listing.bedrooms) iconParts.push(`${listing.bedrooms} hab.`);
    if (showIcons?.bath && listing.bathrooms) iconParts.push(`${listing.bathrooms} baños`);
    if (showIcons?.m2 && listing.built_area_m2) iconParts.push(`${listing.built_area_m2} m²`);
    if (showIcons?.parking && listing.parking) iconParts.push("Parking");

    if (iconParts.length > 0) {
      y += 4;
      doc.setFontSize(isA3 ? 14 : 11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      doc.text(iconParts.join("  ·  "), pageW / 2, y, { align: "center" });
      y += 8;
    }

    // --- Price ---
    if (sign.show_price) {
      const price = listing.operation_type === "rent" ? listing.price_rent : listing.price_sale;
      if (price) {
        y += 2;
        const formatted = new Intl.NumberFormat("es", {
          style: "currency",
          currency: listing.currency || "EUR",
          maximumFractionDigits: 0,
        }).format(price);
        doc.setFontSize(isA3 ? 24 : 18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...red);
        doc.text(formatted, pageW / 2, y, { align: "center" });
        y += 10;
      }
    }

    // --- Bottom branding ---
    doc.setFillColor(...navy);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setTextColor(...white);
    doc.setFontSize(isA3 ? 12 : 9);
    doc.setFont("helvetica", "bold");
    doc.text("ZIGNO", pageW / 2, pageH - 4, { align: "center" });

    // --- Export PDF ---
    const pdfArrayBuffer = doc.output("arraybuffer");
    const pdfBuffer = new Uint8Array(pdfArrayBuffer);

    const pdfPath = `signs/${sign.id}/sign.pdf`;
    const { error: pdfUploadError } = await supabaseAdmin.storage
      .from("generated-assets")
      .upload(pdfPath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (pdfUploadError) throw new Error(`PDF upload failed: ${pdfUploadError.message}`);

    // --- 3. Update sign record with paths ---
    const { error: updateError } = await supabaseAdmin
      .from("signs")
      .update({
        qr_image_path: qrPath,
        sign_pdf_path: pdfPath,
        public_url: publicUrl,
      })
      .eq("id", sign.id);

    if (updateError) throw new Error(`Sign update failed: ${updateError.message}`);

    // Build public URLs for the assets
    const { data: qrPublicUrl } = supabaseAdmin.storage
      .from("generated-assets")
      .getPublicUrl(qrPath);

    const { data: pdfPublicUrl } = supabaseAdmin.storage
      .from("generated-assets")
      .getPublicUrl(pdfPath);

    return new Response(
      JSON.stringify({
        success: true,
        qr_url: qrPublicUrl.publicUrl,
        pdf_url: pdfPublicUrl.publicUrl,
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
