import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const labels: Record<string, Record<string, string>> = {
  sectionLabel: { en: 'Simple Pricing', es: 'Precio Simple', fr: 'Tarif Simple', de: 'Einfache Preise', it: 'Prezzo Semplice', pt: 'Preço Simples', pl: 'Prosty Cennik' },
  title: { en: 'Simple pricing, per listing', es: 'Precio simple, por anuncio', fr: 'Tarif simple, par annonce', de: 'Einfache Preise, pro Inserat', it: 'Prezzo semplice, per annuncio', pt: 'Preço simples, por anúncio', pl: 'Prosta cena, za ogłoszenie' },
  subtitle: { en: 'One listing = one QR code = one print-ready poster. Choose the duration that fits your needs.', es: 'Un anuncio = un código QR = un cartel listo para imprimir. Elige la duración que necesites.', fr: 'Une annonce = un QR code = une affiche prête à imprimer. Choisissez la durée adaptée.', de: 'Ein Inserat = ein QR-Code = ein druckfertiges Plakat. Wählen Sie die passende Dauer.', it: 'Un annuncio = un QR code = un poster pronto per la stampa. Scegli la durata giusta.', pt: 'Um anúncio = um QR code = um cartaz pronto. Escolha a duração ideal.', pl: 'Jedno ogłoszenie = jeden kod QR = jeden gotowy plakat. Wybierz odpowiedni czas.' },
  months: { en: 'months', es: 'meses', fr: 'mois', de: 'Monate', it: 'mesi', pt: 'meses', pl: 'miesięcy' },
  cta: { en: 'Create my listing', es: 'Crear mi anuncio', fr: 'Créer mon annonce', de: 'Mein Inserat erstellen', it: 'Crea il mio annuncio', pt: 'Criar meu anúncio', pl: 'Utwórz ogłoszenie' },
  popular: { en: 'Best value', es: 'Mejor precio', fr: 'Meilleur prix', de: 'Bester Preis', it: 'Miglior prezzo', pt: 'Melhor preço', pl: 'Najlepsza cena' },
  includedTitle: { en: 'Every plan includes', es: 'Todos los planes incluyen', fr: 'Chaque plan inclut', de: 'Jeder Plan enthält', it: 'Ogni piano include', pt: 'Todos os planos incluem', pl: 'Każdy plan zawiera' },
  loginFirst: { en: 'Please log in first', es: 'Inicia sesión primero', fr: 'Connectez-vous d\'abord', de: 'Bitte zuerst anmelden', it: 'Accedi prima', pt: 'Faça login primeiro', pl: 'Zaloguj się najpierw' },
};

const features: Record<string, Record<string, string>> = {
  f1: { en: 'Professional public landing page', es: 'Landing pública profesional', fr: 'Page publique professionnelle', de: 'Professionelle Landingpage', it: 'Landing page professionale', pt: 'Página pública profissional', pl: 'Profesjonalna strona publiczna' },
  f2: { en: 'Unique QR code (PNG)', es: 'Código QR único (PNG)', fr: 'QR code unique (PNG)', de: 'Einzigartiger QR-Code (PNG)', it: 'Codice QR unico (PNG)', pt: 'QR code único (PNG)', pl: 'Unikalny kod QR (PNG)' },
  f3: { en: 'Print-ready poster (PDF)', es: 'Cartel listo para imprimir (PDF)', fr: 'Affiche prête à imprimer (PDF)', de: 'Druckfertiges Plakat (PDF)', it: 'Poster pronto per la stampa (PDF)', pt: 'Cartaz pronto (PDF)', pl: 'Plakat gotowy do druku (PDF)' },
  f4: { en: 'Up to 30 photos + video', es: 'Hasta 30 fotos + vídeo', fr: 'Jusqu\'à 30 photos + vidéo', de: 'Bis zu 30 Fotos + Video', it: 'Fino a 30 foto + video', pt: 'Até 30 fotos + vídeo', pl: 'Do 30 zdjęć + wideo' },
  f5: { en: 'Lead capture form', es: 'Formulario de captación de leads', fr: 'Formulaire de capture de leads', de: 'Lead-Erfassungsformular', it: 'Modulo acquisizione lead', pt: 'Formulário de captação', pl: 'Formularz kontaktowy' },
  f6: { en: 'Basic scan analytics', es: 'Analíticas básicas de escaneos', fr: 'Analytiques de scans', de: 'Scan-Analysen', it: 'Analisi scansioni', pt: 'Análises de scans', pl: 'Analityka skanów' },
};

const plans = [
  { id: '3m', months: 3, price: 49, popular: false },
  { id: '6m', months: 6, price: 64, popular: true },
  { id: '12m', months: 12, price: 94, popular: false },
];

export const Pricing = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  

  const t = (key: string, dict: Record<string, Record<string, string>> = labels) =>
    dict[key]?.[language] || dict[key]?.en || key;

  const handleCheckout = async (packageId: string) => {
    if (!user) {
      toast({ title: t('loginFirst'), variant: 'destructive' });
      navigate('/auth?redirect=/#pricing');
      return;
    }

    // Navigate to embedded checkout page (no listing_id from landing)
    navigate(`/checkout?package_id=${packageId}`);
  };

  return (
    <section id="pricing" className="section-padding bg-secondary/30">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t('sectionLabel')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-card shadow-xl border-2 border-primary scale-105 z-10'
                  : 'bg-card shadow-md border border-border hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                    {t('popular')}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <p className="text-5xl font-display font-bold text-foreground mb-1">
                  {plan.months}
                </p>
                <p className="text-muted-foreground font-medium">{t('months')}</p>
              </div>

              <div className="text-center mb-8">
                <span className="text-4xl font-display font-bold text-foreground">€{plan.price}</span>
              </div>

              <Button
                variant={plan.popular ? 'hero' : 'default'}
                size="lg"
                className="w-full"
                onClick={() => handleCheckout(plan.id)}
              >
                {t('cta')}
              </Button>
            </div>
          ))}
        </div>

        {/* Included features */}
        <div className="max-w-2xl mx-auto">
          <h3 className="font-display text-xl font-bold text-foreground text-center mb-6">
            {t('includedTitle')}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.keys(features).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-muted-foreground">{t(key, features)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
