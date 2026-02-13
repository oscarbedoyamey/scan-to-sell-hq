import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type EmailType = "payment_confirmation" | "magic_link";
type Lang = "es" | "en" | "fr" | "de" | "it" | "pt" | "pl";

const SUPPORTED_LANGS: Lang[] = ["es", "en", "fr", "de", "it", "pt", "pl"];

function getSafeLang(lang?: string): Lang {
  if (lang && SUPPORTED_LANGS.includes(lang as Lang)) return lang as Lang;
  return "en";
}

// --- Payment confirmation templates ---
const paymentSubjects: Record<Lang, string> = {
  es: "✅ Pago confirmado — Tu cartel está listo",
  en: "✅ Payment confirmed — Your sign is ready",
  fr: "✅ Paiement confirmé — Votre panneau est prêt",
  de: "✅ Zahlung bestätigt — Ihr Schild ist bereit",
  it: "✅ Pagamento confermato — Il tuo cartello è pronto",
  pt: "✅ Pagamento confirmado — Seu cartaz está pronto",
  pl: "✅ Płatność potwierdzona — Twój szyld jest gotowy",
};

function paymentHtml(lang: Lang, data: { listingTitle?: string; amount?: string; endDate?: string }): string {
  const labels: Record<Lang, { greeting: string; body: string; listing: string; amount: string; activeUntil: string; cta: string; footer: string }> = {
    es: { greeting: "¡Hola!", body: "Tu pago ha sido procesado correctamente. Tu cartel ya está activo.", listing: "Inmueble", amount: "Importe", activeUntil: "Activo hasta", cta: "Ver mi panel", footer: "Gracias por usar Zigno." },
    en: { greeting: "Hello!", body: "Your payment has been processed successfully. Your sign is now active.", listing: "Listing", amount: "Amount", activeUntil: "Active until", cta: "Go to dashboard", footer: "Thank you for using Zigno." },
    fr: { greeting: "Bonjour !", body: "Votre paiement a été traité avec succès. Votre panneau est maintenant actif.", listing: "Annonce", amount: "Montant", activeUntil: "Actif jusqu'au", cta: "Voir mon tableau de bord", footer: "Merci d'utiliser Zigno." },
    de: { greeting: "Hallo!", body: "Ihre Zahlung wurde erfolgreich verarbeitet. Ihr Schild ist jetzt aktiv.", listing: "Inserat", amount: "Betrag", activeUntil: "Aktiv bis", cta: "Zum Dashboard", footer: "Vielen Dank für die Nutzung von Zigno." },
    it: { greeting: "Ciao!", body: "Il tuo pagamento è stato elaborato con successo. Il tuo cartello è ora attivo.", listing: "Annuncio", amount: "Importo", activeUntil: "Attivo fino al", cta: "Vai alla dashboard", footer: "Grazie per usare Zigno." },
    pt: { greeting: "Olá!", body: "O seu pagamento foi processado com sucesso. O seu cartaz está agora ativo.", listing: "Anúncio", amount: "Valor", activeUntil: "Ativo até", cta: "Ir para o painel", footer: "Obrigado por usar o Zigno." },
    pl: { greeting: "Cześć!", body: "Twoja płatność została przetworzona pomyślnie. Twój szyld jest teraz aktywny.", listing: "Ogłoszenie", amount: "Kwota", activeUntil: "Aktywny do", cta: "Przejdź do panelu", footer: "Dziękujemy za korzystanie z Zigno." },
  };

  const l = labels[lang];
  const dashboardUrl = "https://scan-to-sell-hq.lovable.app/app";

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <tr><td style="background:#18181b;padding:24px;text-align:center;">
    <span style="color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">ZIGNO</span>
  </td></tr>
  <tr><td style="padding:32px 28px;">
    <h1 style="margin:0 0 8px;font-size:22px;color:#18181b;">${l.greeting}</h1>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">${l.body}</p>
    <table width="100%" style="background:#f4f4f5;border-radius:12px;padding:16px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">${l.listing}</td><td style="padding:8px 16px;color:#18181b;font-size:14px;font-weight:600;text-align:right;">${data.listingTitle || "—"}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">${l.amount}</td><td style="padding:8px 16px;color:#18181b;font-size:14px;font-weight:600;text-align:right;">${data.amount || "—"}</td></tr>
      <tr><td style="padding:8px 16px;color:#71717a;font-size:13px;">${l.activeUntil}</td><td style="padding:8px 16px;color:#18181b;font-size:14px;font-weight:600;text-align:right;">${data.endDate || "—"}</td></tr>
    </table>
    <a href="${dashboardUrl}" style="display:inline-block;background:#18181b;color:#fff;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">${l.cta}</a>
  </td></tr>
  <tr><td style="padding:16px 28px 24px;text-align:center;color:#a1a1aa;font-size:12px;">${l.footer}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const { type, to, locale, data } = await req.json() as {
      type: EmailType;
      to: string;
      locale?: string;
      data?: Record<string, string>;
    };

    if (!type || !to) throw new Error("type and to are required");

    const lang = getSafeLang(locale);
    let subject: string;
    let html: string;

    switch (type) {
      case "payment_confirmation":
        subject = paymentSubjects[lang];
        html = paymentHtml(lang, data || {});
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Zigno <noreply@zignoqr.com>",
        to: [to],
        subject,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      throw new Error(`Resend API error: ${JSON.stringify(result)}`);
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Send email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
