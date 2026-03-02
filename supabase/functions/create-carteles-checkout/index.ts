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
      shipping_address_collection: { allowed_countries: ["ES"] },
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
