import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      size_code,
      size_label,
      perforation_id,
      perforation_label,
      phone_space,
      total_price_cents,
      sign_type,
      // Shipping info
      shipping_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_postal_code,
      shipping_province,
    } = await req.json();

    if (!size_code || !total_price_cents || !sign_type || !shipping_email) {
      throw new Error("Missing required fields");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Build product description
    const description = [
      `Cartel ${sign_type}`,
      `Tamaño: ${size_code} (${size_label})`,
      `Perforaciones: ${perforation_label}`,
      phone_space ? "Con espacio teléfono" : "Sin espacio teléfono",
    ].join(" · ");

    // Find or create Stripe customer
    const customers = await stripe.customers.list({
      email: shipping_email,
      limit: 1,
    });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      await stripe.customers.update(customerId, {
        name: shipping_name,
        phone: shipping_phone,
        address: {
          line1: shipping_address,
          city: shipping_city,
          postal_code: shipping_postal_code,
          state: shipping_province,
          country: "ES",
        },
      });
    } else {
      const newCustomer = await stripe.customers.create({
        email: shipping_email,
        name: shipping_name,
        phone: shipping_phone,
        address: {
          line1: shipping_address,
          city: shipping_city,
          postal_code: shipping_postal_code,
          state: shipping_province,
          country: "ES",
        },
        metadata: { source: "carteles" },
      });
      customerId = newCustomer.id;
    }

    const origin = req.headers.get("origin") || "https://zignoqr.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: total_price_cents,
            product_data: {
              name: `Cartel ${sign_type} — ${size_code}`,
              description,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      allow_promotion_codes: true,
      locale: "es",
      
      success_url: `${origin}/carteles/pedido-confirmado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carteles`,
      metadata: {
        order_type: "cartel",
        sign_type,
        size_code,
        perforation_id,
        phone_space: String(phone_space),
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        shipping_province,
      },
    });

    // Send team notification email (fire-and-forget)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const totalEur = (total_price_cents / 100).toFixed(2).replace(".", ",");
      const notifHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <tr><td style="background:#18181b;padding:24px;text-align:center;">
    <span style="color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">ZIGNO</span>
  </td></tr>
  <tr><td style="padding:32px 28px;">
    <h1 style="margin:0 0 8px;font-size:22px;color:#18181b;">📦 Nuevo pedido de cartel</h1>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">Se ha iniciado un nuevo pedido. El cliente será redirigido a Stripe para completar el pago.</p>
    <table width="100%" style="background:#f4f4f5;border-radius:12px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Producto</td><td style="padding:8px 16px;color:#18181b;font-size:14px;font-weight:600;text-align:right;">Cartel ${sign_type} — ${size_code}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Tamaño</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${size_label}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Perforaciones</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${perforation_label}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Espacio teléfono</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${phone_space ? "Sí" : "No"}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Precio</td><td style="padding:8px 16px;color:#18181b;font-size:14px;font-weight:600;text-align:right;">${totalEur} €</td></tr>
    </table>
    <h2 style="margin:0 0 12px;font-size:16px;color:#18181b;">📬 Dirección de envío</h2>
    <table width="100%" style="background:#f4f4f5;border-radius:12px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Nombre</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${shipping_name}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Email</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${shipping_email}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Teléfono</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${shipping_phone || "—"}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Dirección</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${shipping_address}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Ciudad</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${shipping_postal_code} ${shipping_city}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">Provincia</td><td style="padding:8px 16px;color:#18181b;font-size:14px;text-align:right;">${shipping_province}</td></tr>
    </table>
    <a href="https://dashboard.stripe.com/payments" style="display:inline-block;background:#18181b;color:#fff;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">Ver en Stripe →</a>
  </td></tr>
  <tr><td style="padding:16px 28px 24px;text-align:center;color:#a1a1aa;font-size:12px;">Nota: Este email se envía al iniciar el checkout. Verifica el pago en Stripe antes de preparar el envío.</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Zigno <noreply@zignoqr.com>",
          to: ["hola@zignoqr.com"],
          subject: `📦 Nuevo pedido: Cartel ${sign_type} ${size_code} — ${totalEur} €`,
          html: notifHtml,
        }),
      }).then(r => r.text()).catch(e => console.error("Email notification error:", e));
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Carteles checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
