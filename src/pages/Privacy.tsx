import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { privacyContent } from '@/i18n/legalContent/privacy';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/i18n/LanguageContext';
import { seoTranslations } from '@/i18n/seoTranslations';

const Privacy = () => {
  const { language } = useLanguage();
  const seo = seoTranslations[language].privacy;
  return (
    <>
      <SEO title={seo.title} description={seo.description} canonical="https://zigno.lovable.app/privacy" />
      <LegalPageLayout content={privacyContent} />
    </>
  );
};
export default Privacy;
