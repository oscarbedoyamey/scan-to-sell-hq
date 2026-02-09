import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import zignoLogo from '@/assets/zigno-logo.png';

const labels: Record<string, Record<string, string>> = {
  title: { en: 'Welcome to Zigno', es: 'Bienvenido a Zigno', fr: 'Bienvenue sur Zigno', de: 'Willkommen bei Zigno', it: 'Benvenuto su Zigno', pt: 'Bem-vindo ao Zigno', pl: 'Witaj w Zigno' },
  subtitle: { en: 'Enter your email to receive a magic link', es: 'Introduce tu email para recibir un enlace mágico', fr: 'Entrez votre email pour recevoir un lien magique', de: 'Geben Sie Ihre E-Mail ein, um einen Magic Link zu erhalten', it: 'Inserisci la tua email per ricevere un link magico', pt: 'Insira seu email para receber um link mágico', pl: 'Wpisz swój email, aby otrzymać magiczny link' },
  placeholder: { en: 'your@email.com', es: 'tu@email.com', fr: 'votre@email.com', de: 'ihre@email.com', it: 'tua@email.com', pt: 'seu@email.com', pl: 'twoj@email.com' },
  cta: { en: 'Send magic link', es: 'Enviar enlace mágico', fr: 'Envoyer le lien magique', de: 'Magic Link senden', it: 'Invia link magico', pt: 'Enviar link mágico', pl: 'Wyślij magiczny link' },
  sent: { en: 'Check your email!', es: '¡Revisa tu email!', fr: 'Vérifiez votre email !', de: 'Überprüfen Sie Ihre E-Mail!', it: 'Controlla la tua email!', pt: 'Verifique seu email!', pl: 'Sprawdź swój email!' },
  sentDesc: { en: 'We sent a magic link to', es: 'Hemos enviado un enlace mágico a', fr: 'Nous avons envoyé un lien magique à', de: 'Wir haben einen Magic Link gesendet an', it: 'Abbiamo inviato un link magico a', pt: 'Enviamos um link mágico para', pl: 'Wysłaliśmy magiczny link do' },
  back: { en: '← Back to home', es: '← Volver al inicio', fr: '← Retour à l\'accueil', de: '← Zurück zur Startseite', it: '← Torna alla home', pt: '← Voltar ao início', pl: '← Wróć na stronę główną' },
  noPassword: { en: 'No password needed — just click the link in your email.', es: 'Sin contraseña — solo haz clic en el enlace de tu email.', fr: 'Pas de mot de passe — cliquez simplement sur le lien.', de: 'Kein Passwort nötig — klicken Sie einfach auf den Link.', it: 'Nessuna password — clicca sul link nella tua email.', pt: 'Sem senha — basta clicar no link.', pl: 'Bez hasła — kliknij link w emailu.' },
};

const Auth = () => {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  if (!isLoading && user) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError('');

    const { error: authError } = await (await import('@/contexts/AuthContext')).useAuth
      ? { error: null }
      : { error: null };

    // Use supabase directly
    const { supabase } = await import('@/integrations/supabase/client');
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSending(false);

    if (otpError) {
      setError(otpError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <img src={zignoLogo} alt="ZIGNO" className="h-10 w-auto mx-auto mb-6" />
          </a>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                {t('sent')}
              </h1>
              <p className="text-muted-foreground mb-1">{t('sentDesc')}</p>
              <p className="text-foreground font-medium">{email}</p>
              <p className="text-sm text-muted-foreground mt-4">{t('noPassword')}</p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground text-center mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                {t('subtitle')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t('placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('cta')
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                {t('noPassword')}
              </p>
            </>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('back')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
