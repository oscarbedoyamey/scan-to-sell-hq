import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Lang = "es" | "en" | "fr" | "de" | "it" | "pt" | "pl";
const SUPPORTED_LANGS: Lang[] = ["es", "en", "fr", "de", "it", "pt", "pl"];

function getSafeLang(lang?: string): Lang {
  if (lang && SUPPORTED_LANGS.includes(lang as Lang)) return lang as Lang;
  return "en";
}

const subjects: Record<Lang, string> = {
  es: "🔑 Tu enlace de acceso a Zigno",
  en: "🔑 Your Zigno login link",
  fr: "🔑 Votre lien de connexion Zigno",
  de: "🔑 Ihr Zigno-Anmeldelink",
  it: "🔑 Il tuo link di accesso a Zigno",
  pt: "🔑 Seu link de acesso ao Zigno",
  pl: "🔑 Twój link logowania do Zigno",
};

function magicLinkHtml(lang: Lang, link: string): string {
  const labels: Record<Lang, { greeting: string; body: string; cta: string; expire: string; ignore: string; footer: string }> = {
    es: { greeting: "¡Hola!", body: "Haz clic en el botón para acceder a tu cuenta de Zigno.", cta: "Acceder a Zigno", expire: "Este enlace caduca en 1 hora.", ignore: "Si no solicitaste este email, puedes ignorarlo.", footer: "Zigno — Carteles inteligentes para inmobiliarias" },
    en: { greeting: "Hello!", body: "Click the button below to sign in to your Zigno account.", cta: "Sign in to Zigno", expire: "This link expires in 1 hour.", ignore: "If you didn't request this email, you can safely ignore it.", footer: "Zigno — Smart signs for real estate" },
    fr: { greeting: "Bonjour !", body: "Cliquez sur le bouton ci-dessous pour vous connecter à Zigno.", cta: "Se connecter à Zigno", expire: "Ce lien expire dans 1 heure.", ignore: "Si vous n'avez pas demandé cet email, ignorez-le.", footer: "Zigno — Panneaux intelligents pour l'immobilier" },
    de: { greeting: "Hallo!", body: "Klicken Sie auf die Schaltfläche unten, um sich bei Zigno anzumelden.", cta: "Bei Zigno anmelden", expire: "Dieser Link läuft in 1 Stunde ab.", ignore: "Falls Sie diese E-Mail nicht angefordert haben, ignorieren Sie sie.", footer: "Zigno — Intelligente Schilder für Immobilien" },
    it: { greeting: "Ciao!", body: "Clicca il pulsante qui sotto per accedere al tuo account Zigno.", cta: "Accedi a Zigno", expire: "Questo link scade tra 1 ora.", ignore: "Se non hai richiesto questa email, puoi ignorarla.", footer: "Zigno — Cartelli intelligenti per il settore immobiliare" },
    pt: { greeting: "Olá!", body: "Clique no botão abaixo para acessar sua conta Zigno.", cta: "Entrar no Zigno", expire: "Este link expira em 1 hora.", ignore: "Se você não solicitou este email, pode ignorá-lo.", footer: "Zigno — Placas inteligentes para imobiliárias" },
    pl: { greeting: "Cześć!", body: "Kliknij poniższy przycisk, aby zalogować się do Zigno.", cta: "Zaloguj się do Zigno", expire: "Ten link wygasa za 1 godzinę.", ignore: "Jeśli nie prosiłeś o ten email, zignoruj go.", footer: "Zigno — Inteligentne szyldy dla nieruchomości" },
  };

  const l = labels[lang];

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
    <p style="margin:0 0 28px;color:#52525b;font-size:15px;line-height:1.6;">${l.body}</p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${link}" style="display:inline-block;background:#18181b;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">${l.cta}</a>
    </div>
    <p style="margin:0 0 4px;color:#a1a1aa;font-size:13px;">${l.expire}</p>
    <p style="margin:0;color:#a1a1aa;font-size:13px;">${l.ignore}</p>
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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { email, locale, redirectTo } = await req.json() as {
      email: string;
      locale?: string;
      redirectTo?: string;
    };

    if (!email) throw new Error("email is required");

    const lang = getSafeLang(locale);

    // Generate magic link using admin API
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: redirectTo || `${SUPABASE_URL.replace('.supabase.co', '')}/auth/callback`,
      },
    });

    if (linkError) throw linkError;

    const magicLink = linkData?.properties?.action_link;
    if (!magicLink) throw new Error("Failed to generate magic link");

    // Send localized email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Zigno <noreply@zignoqr.com>",
        to: [email],
        subject: subjects[lang],
        html: magicLinkHtml(lang, magicLink),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      throw new Error(`Resend API error: ${JSON.stringify(result)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Send magic link error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
