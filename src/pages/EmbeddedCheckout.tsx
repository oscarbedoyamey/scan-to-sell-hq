import { useCallback, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout as StripeEmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import zignoLogo from '@/assets/zigno-logo.png';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const labels: Record<string, Record<string, string>> = {
  title: { en: 'Complete your payment', es: 'Completa tu pago', fr: 'Finalisez votre paiement', de: 'Zahlung abschließen', it: 'Completa il pagamento', pt: 'Complete seu pagamento', pl: 'Dokończ płatność' },
  back: { en: 'Back', es: 'Volver', fr: 'Retour', de: 'Zurück', it: 'Indietro', pt: 'Voltar', pl: 'Wstecz' },
  error: { en: 'Could not load checkout. Please try again.', es: 'No se pudo cargar el pago. Inténtalo de nuevo.', fr: 'Impossible de charger le paiement. Réessayez.', de: 'Checkout konnte nicht geladen werden. Bitte erneut versuchen.', it: 'Impossibile caricare il checkout. Riprova.', pt: 'Não foi possível carregar o pagamento. Tente novamente.', pl: 'Nie udało się załadować płatności. Spróbuj ponownie.' },
};

const EmbeddedCheckoutPage = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const packageId = searchParams.get('package_id');
  const listingId = searchParams.get('listing_id');

  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  const fetchClientSecret = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { package_id: packageId, listing_id: listingId },
      });
      if (fnError) throw fnError;
      if (!data?.client_secret) throw new Error('No client_secret returned');
      return data.client_secret;
    } catch (err: any) {
      console.error('Checkout init error:', err);
      setError(err.message);
      throw err;
    }
  }, [packageId, listingId]);

  if (!packageId) {
    navigate('/app/listings', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/">
            <img src={zignoLogo} alt="ZIGNO" className="h-8 w-auto" />
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('back')}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start p-6">
        <div className="w-full max-w-lg">
          <h1 className="font-display text-2xl font-bold text-foreground text-center mb-6">
            {t('title')}
          </h1>

          {error ? (
            <div className="text-center text-destructive">
              <p>{t('error')}</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                {t('back')}
              </Button>
            </div>
          ) : (
            <div id="checkout">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <StripeEmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmbeddedCheckoutPage;
