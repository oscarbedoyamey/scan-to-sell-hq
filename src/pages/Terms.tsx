import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { termsContent } from '@/i18n/legalContent/terms';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/i18n/LanguageContext';
import { seoTranslations } from '@/i18n/seoTranslations';

const Terms = () => {
  const { language } = useLanguage();
  const seo = seoTranslations[language].terms;
  return (
    <>
      <SEO title={seo.title} description={seo.description} canonical="https://zigno.lovable.app/terms" />
      <LegalPageLayout content={termsContent} />
    </>
  );
};
export default Terms;
