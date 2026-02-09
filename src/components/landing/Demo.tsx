import { useState } from 'react';
import { MapPin, BedDouble, Bath, Square, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import propertyMockup from '@/assets/property-listing-mockup.jpg';

export const Demo = () => {
  const { t } = useLanguage();
  const [showListing, setShowListing] = useState(false);

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

        {/* Demo Area */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Poster mockup */}
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
                onClick={() => setShowListing(true)}
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
                      Click to preview
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

          {/* Property listing preview */}
          <div className={`transition-all duration-500 ${showListing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {showListing ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
                {/* Property image */}
                <div className="relative h-56 bg-gradient-to-br from-primary/10 to-primary/5">
                  <img
                    src={propertyMockup}
                    alt="Property"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                    {t.demo.propertyCard.price}
                  </div>
                </div>

                {/* Property details */}
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {t.demo.propertyCard.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{t.demo.propertyCard.location}</span>
                  </div>

                  {/* Features */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <BedDouble className="w-4 h-4" />
                      <span>{t.demo.propertyCard.beds}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Bath className="w-4 h-4" />
                      <span>{t.demo.propertyCard.baths}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Square className="w-4 h-4" />
                      <span>{t.demo.propertyCard.size}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-6">
                    {t.demo.propertyCard.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="hero" className="flex-1">
                      <Phone className="w-4 h-4" />
                      {t.demo.propertyCard.contact}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4" />
                      {t.demo.propertyCard.viewMore}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/50 rounded-2xl p-12 text-center border-2 border-dashed border-border">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Click the QR code to see the property listing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
