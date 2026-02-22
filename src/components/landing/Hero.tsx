import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const heroPosterByLang: Record<string, string> = {
  en: '/hero_en.png',
  es: '/hero_es.png',
  fr: '/hero_fr.png',
  de: '/hero_de.png',
  it: '/hero_it.png',
  pt: '/hero_pt.png',
  pl: '/hero_pl.png',
};

export const Hero = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const loginFirstLabel: Record<string, string> = {
    en: 'Please log in first', es: 'Inicia sesión primero', fr: 'Connectez-vous d\'abord',
    de: 'Bitte zuerst anmelden', it: 'Accedi prima', pt: 'Faça login primeiro', pl: 'Zaloguj się najpierw',
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: loginFirstLabel[language] || loginFirstLabel.en, variant: 'destructive' });
      navigate('/auth?redirect=/#pricing');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { package_id: '6m' },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section className="relative min-h-screen bg-hero-gradient pt-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-5rem)] py-12">
          {/* Content */}
          <div className="text-center lg:text-left stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t.hero.badge}
            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              {t.hero.title}{' '}
              <span className="text-gradient">{t.hero.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button variant="hero" size="xl" className="group" onClick={handleCheckout} disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    {t.hero.cta}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              <Button variant="heroOutline" size="xl" className="group" onClick={scrollToHowItWorks}>
                <Play className="h-5 w-5" />
                {t.hero.ctaSecondary}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {['🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇵🇹'].map((flag, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-lg border-2 border-white">
                    {flag}
                  </div>
                ))}
              </div>
              <div>
                <span className="text-foreground font-medium">{t.hero.trustedBy}</span>{' '}
                {t.hero.countries}
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:order-last animate-fade-in-up">
            <div className="relative">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden shadow-hero animate-float">
                <img
                  src={heroPoster}
                  alt="Zigno QR Code Poster"
                  className="w-full h-auto"
                />
              </div>

              {/* Floating elements */}
              <div className="absolute -bottom-4 -left-4 md:-left-8 bg-white rounded-xl shadow-xl p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">247 scans</p>
                    <p className="text-sm text-muted-foreground">This week</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 md:-right-8 bg-white rounded-xl shadow-xl p-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">12 leads</p>
                    <p className="text-sm text-muted-foreground">Captured</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};
