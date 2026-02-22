import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const qrByLang: Record<string, string> = {
  en: '/qr_zignoqr_demo_en.png',
  es: '/qr_zignoqr_demo_es.png',
  fr: '/qr_zignoqr_demo_fr.png',
  de: '/qr_zignoqr_demo_de.png',
  it: '/qr_zignoqr_demo_it.png',
  pt: '/qr_zignoqr_demo_pt.png',
  pl: '/qr_zignoqr_demo_pl.png',
};

export const Demo = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section id="examples" className="section-padding bg-secondary/30">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t.demo.sectionLabel}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t.demo.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.demo.subtitle}
          </p>
        </div>

        {/* Demo Area — Centered QR */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-auto">
              {/* Poster header */}
              <div className="text-center mb-6">
                <h3 className="font-display text-3xl font-bold text-primary mb-2">
                  {t.demo.posterTitle}
                </h3>
                <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
              </div>

              {/* QR Code */}
              <button
                onClick={() => navigate('/demo')}
                className="w-full aspect-square bg-white rounded-xl border-4 border-primary/10 p-4 hover:border-primary/30 transition-colors cursor-pointer qr-shimmer group relative overflow-hidden"
              >
                <img
                  src={qrByLang[language] || qrByLang.en}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                    {t.demo.scanMe} →
                  </span>
                </div>
              </button>

              {/* Scan instruction */}
              <p className="text-center text-muted-foreground mt-4 text-sm">
                {t.demo.scanMe} ☝️
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
