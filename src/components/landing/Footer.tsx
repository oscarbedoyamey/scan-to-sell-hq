import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-foreground" fill="currentColor">
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z"/>
                </svg>
              </div>
              <span className="font-display font-bold text-xl">ScanToSell</span>
            </div>
            <p className="text-background/70 mb-6 max-w-sm">{t.footer.description}</p>
            <div className="flex gap-2">
              <Input placeholder={t.footer.newsletter.placeholder} className="bg-white/10 border-white/20 text-background placeholder:text-background/50" />
              <Button variant="hero" size="default">{t.footer.newsletter.cta}</Button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.product}</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.links.features}</a></li>
              <li><a href="#pricing" className="hover:text-background transition-colors">{t.footer.links.pricing}</a></li>
              <li><a href="#examples" className="hover:text-background transition-colors">{t.footer.links.examples}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.company}</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.links.about}</a></li>
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.links.blog}</a></li>
              <li><a href="#" className="hover:text-background transition-colors">{t.footer.links.careers}</a></li>
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
