import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import zignoLogo from '@/assets/zigno-logo.png';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const labels: Record<string, Record<string, string>> = {
  verifying: { en: 'Verifying your payment…', es: 'Verificando tu pago…', fr: 'Vérification du paiement…', de: 'Zahlung wird überprüft…', it: 'Verifica del pagamento…', pt: 'Verificando pagamento…', pl: 'Weryfikacja płatności…' },
  successTitle: { en: 'Payment confirmed!', es: '¡Pago confirmado!', fr: 'Paiement confirmé !', de: 'Zahlung bestätigt!', it: 'Pagamento confermato!', pt: 'Pagamento confirmado!', pl: 'Płatność potwierdzona!' },
  successDesc: { en: 'Your listing is now active. Your QR code and poster are being generated.', es: 'Tu anuncio está activo. Se están generando tu código QR y cartel.', fr: 'Votre annonce est active. Votre QR et affiche sont en cours de création.', de: 'Ihr Inserat ist aktiv. QR-Code und Plakat werden erstellt.', it: 'Il tuo annuncio è attivo. QR code e poster in generazione.', pt: 'Seu anúncio está ativo. QR code e cartaz sendo gerados.', pl: 'Ogłoszenie jest aktywne. QR code i plakat są generowane.' },
  viewListing: { en: 'View my listing', es: 'Ver mi anuncio', fr: 'Voir mon annonce', de: 'Mein Inserat ansehen', it: 'Vedi il mio annuncio', pt: 'Ver meu anúncio', pl: 'Zobacz ogłoszenie' },
  goHome: { en: 'Go to dashboard', es: 'Ir al panel', fr: 'Aller au tableau de bord', de: 'Zum Dashboard', it: 'Vai alla dashboard', pt: 'Ir ao painel', pl: 'Przejdź do panelu' },
  errorTitle: { en: 'Payment not confirmed', es: 'Pago no confirmado', fr: 'Paiement non confirmé', de: 'Zahlung nicht bestätigt', it: 'Pagamento non confermato', pt: 'Pagamento não confirmado', pl: 'Płatność niepotwierdzona' },
  errorDesc: { en: 'We could not verify your payment. Please contact support if you were charged.', es: 'No pudimos verificar tu pago. Contacta con soporte si se te cobró.', fr: 'Nous n\'avons pas pu vérifier votre paiement. Contactez le support si vous avez été débité.', de: 'Wir konnten Ihre Zahlung nicht bestätigen. Kontaktieren Sie den Support, falls Ihnen ein Betrag abgebucht wurde.', it: 'Non siamo riusciti a verificare il pagamento. Contatta l\'assistenza se sei stato addebitato.', pt: 'Não conseguimos verificar seu pagamento. Contacte o suporte se foi cobrado.', pl: 'Nie udało się zweryfikować płatności. Skontaktuj się z pomocą techniczną, jeśli pobrano opłatę.' },
  retry: { en: 'Try again', es: 'Intentar de nuevo', fr: 'Réessayer', de: 'Erneut versuchen', it: 'Riprova', pt: 'Tentar novamente', pl: 'Spróbuj ponownie' },
};

const DELAYS = [1000, 2000, 3000, 4000, 5000];
const MAX_ATTEMPTS = 6;

const PaymentSuccess = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [listingId, setListingId] = useState<string | null>(null);

  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id');
  const purchaseId = searchParams.get('purchase_id');

  const runVerification = useCallback(async () => {
    if (!sessionId || !purchaseId) {
      setStatus('error');
      return;
    }

    setStatus('verifying');
    let attempt = 0;

    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
          },
          body: JSON.stringify({ session_id: sessionId, purchase_id: purchaseId }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data?.verified) {
          setStatus('success');
          const lid = data.listing_id || null;
          setListingId(lid);
          setTimeout(() => {
            navigate(lid ? `/app/listings/${lid}` : '/app/signs', { replace: true });
          }, 2000);
          return;
        }

        if (attempt < MAX_ATTEMPTS) {
          const delay = DELAYS[attempt - 1] || 5000;
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        setStatus('error');
        return;
      } catch (err) {
        console.error(`[PaymentSuccess] Attempt ${attempt} failed:`, err);
        if (attempt < MAX_ATTEMPTS) {
          const delay = DELAYS[attempt - 1] || 5000;
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        setStatus('error');
        return;
      }
    }
  }, [sessionId, purchaseId, navigate]);

  useEffect(() => {
    const timer = setTimeout(runVerification, 500);
    return () => clearTimeout(timer);
  }, [runVerification]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center h-16">
          <Link to="/">
            <img src={zignoLogo} alt="ZIGNO" className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
              <h1 className="font-display text-2xl font-bold text-foreground">{t('verifying')}</h1>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <CheckCircle2 className="w-20 h-20 text-success mx-auto" />
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">{t('successTitle')}</h1>
                <p className="text-muted-foreground">{t('successDesc')}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to={listingId ? `/app/listings/${listingId}` : '/app/listings'}>
                    {t('viewListing')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/app">{t('goHome')}</Link>
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <XCircle className="w-20 h-20 text-destructive mx-auto" />
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">{t('errorTitle')}</h1>
                <p className="text-muted-foreground">{t('errorDesc')}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button variant="default" size="lg" onClick={runVerification}>
                  {t('retry')}
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/app">{t('goHome')}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
