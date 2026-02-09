import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import zignoLogo from '@/assets/zigno-logo.png';

const labels: Record<string, Record<string, string>> = {
  verifying: { en: 'Verifying your payment…', es: 'Verificando tu pago…', fr: 'Vérification du paiement…', de: 'Zahlung wird überprüft…', it: 'Verifica del pagamento…', pt: 'Verificando pagamento…', pl: 'Weryfikacja płatności…' },
  successTitle: { en: 'Payment confirmed!', es: '¡Pago confirmado!', fr: 'Paiement confirmé !', de: 'Zahlung bestätigt!', it: 'Pagamento confermato!', pt: 'Pagamento confirmado!', pl: 'Płatność potwierdzona!' },
  successDesc: { en: 'Your listing slot is ready. Start creating your property listing now.', es: 'Tu espacio está listo. Empieza a crear tu anuncio ahora.', fr: 'Votre emplacement est prêt. Créez votre annonce maintenant.', de: 'Ihr Platz ist bereit. Erstellen Sie jetzt Ihr Inserat.', it: 'Il tuo spazio è pronto. Crea il tuo annuncio ora.', pt: 'Seu espaço está pronto. Crie seu anúncio agora.', pl: 'Twoje miejsce jest gotowe. Utwórz ogłoszenie teraz.' },
  createListing: { en: 'Create my listing', es: 'Crear mi anuncio', fr: 'Créer mon annonce', de: 'Mein Inserat erstellen', it: 'Crea il mio annuncio', pt: 'Criar meu anúncio', pl: 'Utwórz ogłoszenie' },
  goHome: { en: 'Go to dashboard', es: 'Ir al panel', fr: 'Aller au tableau de bord', de: 'Zum Dashboard', it: 'Vai alla dashboard', pt: 'Ir ao painel', pl: 'Przejdź do panelu' },
  errorTitle: { en: 'Payment not confirmed', es: 'Pago no confirmado', fr: 'Paiement non confirmé', de: 'Zahlung nicht bestätigt', it: 'Pagamento non confermato', pt: 'Pagamento não confirmado', pl: 'Płatność niepotwierdzona' },
  errorDesc: { en: 'We could not verify your payment. Please contact support if you were charged.', es: 'No pudimos verificar tu pago. Contacta con soporte si se te cobró.', fr: 'Nous n\'avons pas pu vérifier votre paiement. Contactez le support si vous avez été débité.', de: 'Wir konnten Ihre Zahlung nicht bestätigen. Kontaktieren Sie den Support, falls Ihnen ein Betrag abgebucht wurde.', it: 'Non siamo riusciti a verificare il pagamento. Contatta l\'assistenza se sei stato addebitato.', pt: 'Não conseguimos verificar seu pagamento. Contacte o suporte se foi cobrado.', pl: 'Nie udało się zweryfikować płatności. Skontaktuj się z pomocą techniczną, jeśli pobrano opłatę.' },
  retry: { en: 'Try again', es: 'Intentar de nuevo', fr: 'Réessayer', de: 'Erneut versuchen', it: 'Riprova', pt: 'Tentar novamente', pl: 'Spróbuj ponownie' },
};

const PaymentSuccess = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const pId = searchParams.get('purchase_id');
    setPurchaseId(pId);

    if (!sessionId || !pId) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId, purchase_id: pId },
        });
        if (error) throw error;
        setStatus(data?.verified ? 'success' : 'error');
      } catch (err) {
        console.error('Payment verification failed:', err);
        setStatus('error');
      }
    };

    // Small delay to ensure Stripe has processed
    const timer = setTimeout(verify, 1500);
    return () => clearTimeout(timer);
  }, [searchParams]);

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
                  <Link to={`/app/listings/new${purchaseId ? `?purchase_id=${purchaseId}` : ''}`}>
                    {t('createListing')}
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
                <Button asChild variant="default" size="lg">
                  <Link to="/pricing">{t('retry')}</Link>
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
