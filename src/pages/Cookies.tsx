import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { cookiesContent } from '@/i18n/legalContent/cookies';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/i18n/LanguageContext';
import { seoTranslations } from '@/i18n/seoTranslations';

const Cookies = () => {
  const { language } = useLanguage();
  const seo = seoTranslations[language].cookies;
  return (
    <>
      <SEO title={seo.title} description={seo.description} canonical="https://zigno.lovable.app/cookies" />
      <LegalPageLayout content={cookiesContent} />
    </>
  );
};
export default Cookies;
