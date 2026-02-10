import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

export const Demo = () => {
  const { t } = useLanguage();
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
                className="w-full aspect-square bg-white rounded-xl border-4 border-primary/10 p-4 hover:border-primary/30 transition-colors cursor-pointer qr-shimmer group"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* QR Pattern */}
                  <svg viewBox="0 0 200 200" className="w-3/4 h-3/4 text-primary">
                    <rect x="10" y="10" width="50" height="50" fill="currentColor" />
                    <rect x="140" y="10" width="50" height="50" fill="currentColor" />
                    <rect x="10" y="140" width="50" height="50" fill="currentColor" />
                    <rect x="20" y="20" width="30" height="30" fill="white" />
                    <rect x="150" y="20" width="30" height="30" fill="white" />
                    <rect x="20" y="150" width="30" height="30" fill="white" />
                    <rect x="30" y="30" width="10" height="10" fill="currentColor" />
                    <rect x="160" y="30" width="10" height="10" fill="currentColor" />
                    <rect x="30" y="160" width="10" height="10" fill="currentColor" />
                    <rect x="70" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="90" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="110" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="70" y="30" width="10" height="10" fill="currentColor" />
                    <rect x="90" y="40" width="10" height="10" fill="currentColor" />
                    <rect x="70" y="50" width="10" height="10" fill="currentColor" />
                    <rect x="100" y="50" width="10" height="10" fill="currentColor" />
                    <rect x="120" y="30" width="10" height="10" fill="currentColor" />
                    <rect x="80" y="70" width="10" height="10" fill="currentColor" />
                    <rect x="100" y="70" width="10" height="10" fill="currentColor" />
                    <rect x="120" y="70" width="10" height="10" fill="currentColor" />
                    <rect x="70" y="90" width="10" height="10" fill="currentColor" />
                    <rect x="90" y="90" width="10" height="10" fill="currentColor" />
                    <rect x="110" y="90" width="10" height="10" fill="currentColor" />
                    <rect x="80" y="110" width="10" height="10" fill="currentColor" />
                    <rect x="100" y="110" width="10" height="10" fill="currentColor" />
                    <rect x="120" y="110" width="10" height="10" fill="currentColor" />
                    <rect x="140" y="70" width="10" height="10" fill="currentColor" />
                    <rect x="160" y="90" width="10" height="10" fill="currentColor" />
                    <rect x="180" y="70" width="10" height="10" fill="currentColor" />
                    <rect x="140" y="100" width="10" height="10" fill="currentColor" />
                    <rect x="160" y="120" width="10" height="10" fill="currentColor" />
                    <rect x="180" y="110" width="10" height="10" fill="currentColor" />
                    <rect x="10" y="70" width="10" height="10" fill="currentColor" />
                    <rect x="30" y="90" width="10" height="10" fill="currentColor" />
                    <rect x="50" y="70" width="10" height="10" fill="currentColor" />
                    <rect x="10" y="100" width="10" height="10" fill="currentColor" />
                    <rect x="30" y="120" width="10" height="10" fill="currentColor" />
                    <rect x="50" y="110" width="10" height="10" fill="currentColor" />
                    <rect x="140" y="140" width="20" height="20" fill="currentColor" />
                    <rect x="170" y="140" width="20" height="20" fill="currentColor" />
                    <rect x="140" y="170" width="20" height="20" fill="currentColor" />
                    <rect x="170" y="170" width="20" height="20" fill="currentColor" />
                  </svg>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                      {t.demo.scanMe} →
                    </span>
                  </div>
                </div>
              </button>

              {/* Scan instruction */}
              <p className="text-center text-muted-foreground mt-4 text-sm">
                {t.demo.scanMe} ☝️
              </p>

              {/* Footer branding */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded bg-primary" />
                <span>Zigno.eu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
