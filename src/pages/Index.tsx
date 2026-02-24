import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Demo } from '@/components/landing/Demo';
import { PosterGallery } from '@/components/landing/PosterGallery';
import { PrintingOptions } from '@/components/landing/PrintingOptions';
import { Pricing } from '@/components/landing/Pricing';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/i18n/LanguageContext';
import { seoTranslations } from '@/i18n/seoTranslations';

const Index = () => {
  const { language } = useLanguage();
  const seo = seoTranslations[language].home;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={seo.title} description={seo.description} canonical="https://zigno.lovable.app/" />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Demo />
        <PosterGallery />
        <PrintingOptions />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
