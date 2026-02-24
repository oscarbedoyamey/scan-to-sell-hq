import { Calendar, XCircle, Headphones, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const trustItems = {
  en: [
    { icon: Calendar, text: '14-day free trial' },
    { icon: XCircle, text: 'Cancel anytime' },
    { icon: Headphones, text: 'Support in your language' },
    { icon: ShieldCheck, text: 'Secure data — hosted in Europe' },
  ],
  es: [
    { icon: Calendar, text: '14 días gratis' },
    { icon: XCircle, text: 'Cancela en cualquier momento' },
    { icon: Headphones, text: 'Soporte en español' },
    { icon: ShieldCheck, text: 'Datos seguros — alojamiento en Europa' },
  ],
  fr: [
    { icon: Calendar, text: '14 jours gratuits' },
    { icon: XCircle, text: 'Annulez à tout moment' },
    { icon: Headphones, text: 'Support en français' },
    { icon: ShieldCheck, text: 'Données sécurisées — hébergement en Europe' },
  ],
  de: [
    { icon: Calendar, text: '14 Tage kostenlos' },
    { icon: XCircle, text: 'Jederzeit kündbar' },
    { icon: Headphones, text: 'Support auf Deutsch' },
    { icon: ShieldCheck, text: 'Sichere Daten — Hosting in Europa' },
  ],
  it: [
    { icon: Calendar, text: '14 giorni gratis' },
    { icon: XCircle, text: 'Cancella in qualsiasi momento' },
    { icon: Headphones, text: 'Supporto in italiano' },
    { icon: ShieldCheck, text: 'Dati sicuri — hosting in Europa' },
  ],
  pt: [
    { icon: Calendar, text: '14 dias grátis' },
    { icon: XCircle, text: 'Cancele a qualquer momento' },
    { icon: Headphones, text: 'Suporte em português' },
    { icon: ShieldCheck, text: 'Dados seguros — alojamento na Europa' },
  ],
  pl: [
    { icon: Calendar, text: '14 dni za darmo' },
    { icon: XCircle, text: 'Anuluj w dowolnym momencie' },
    { icon: Headphones, text: 'Wsparcie po polsku' },
    { icon: ShieldCheck, text: 'Bezpieczne dane — hosting w Europie' },
  ],
};

export const TrustStrip = () => {
  const { language } = useLanguage();
  const items = trustItems[language] || trustItems.en;

  return (
    <div className="border-t border-border/40 bg-muted/30">
      <div className="container-wide py-4">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="h-4 w-4 shrink-0 text-primary/70" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
