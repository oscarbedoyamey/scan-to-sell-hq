import { useLanguage } from '@/i18n/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/landing/Footer';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import zignoLogo from '@/assets/zigno-logo.png';

interface LegalPageLayoutProps {
  content: Record<string, string>;
}

export const LegalPageLayout = ({ content }: LegalPageLayoutProps) => {
  const { language, setLanguage } = useLanguage();
  const html = content[language] || content.en || '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={zignoLogo} alt="ZIGNO" className="h-8 w-auto" />
          </Link>
          <LanguageSwitcher
            current={language}
            onChange={(c) => setLanguage(c as any)}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="container-tight py-12 md:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'es' ? 'Volver al inicio' :
             language === 'fr' ? 'Retour à l\'accueil' :
             language === 'de' ? 'Zurück zur Startseite' :
             language === 'it' ? 'Torna alla home' :
             language === 'pt' ? 'Voltar ao início' :
             language === 'pl' ? 'Powrót do strony głównej' :
             'Back to home'}
          </Link>
          <article
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6 prose-h1:text-foreground
              prose-h2:text-xl prose-h2:md:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-foreground
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-a:text-primary prose-a:underline
              prose-table:text-sm
              prose-th:bg-secondary prose-th:text-foreground prose-th:p-3 prose-th:text-left
              prose-td:p-3 prose-td:border-b prose-td:border-border prose-td:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>

      <TrustStrip />
      <Footer />
    </div>
  );
};
