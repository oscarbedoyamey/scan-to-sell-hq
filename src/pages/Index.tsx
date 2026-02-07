import { LanguageProvider } from '@/i18n/LanguageContext';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Demo } from '@/components/landing/Demo';
import { PrintingOptions } from '@/components/landing/PrintingOptions';
import { Pricing } from '@/components/landing/Pricing';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <HowItWorks />
          <Demo />
          <PrintingOptions />
          <Pricing />
          <Testimonials />
          <FAQ />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
