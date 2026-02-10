import { useLanguage } from '@/i18n/LanguageContext';
import zignoLogoDark from '@/assets/zigno-logo-dark.png';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <img src={zignoLogoDark} alt="ZIGNO" className="h-10 w-auto" />
            </div>
            <p className="text-background/70 mb-6 max-w-sm">{t.footer.description}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.product}</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.links.features}</a></li>
              <li><a href="#pricing" className="hover:text-background transition-colors">{t.footer.links.pricing}</a></li>
              <li><a href="#examples" className="hover:text-background transition-colors">{t.footer.links.examples}</a></li>
              <li><a href="mailto:info@qrzigno.com" className="hover:text-background transition-colors">{t.footer.links.contact}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.links.privacy}</a></li>
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.links.terms}</a></li>
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.links.cookies}</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60">
          <p>{t.footer.copyright}</p>
          <p>{t.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
};
