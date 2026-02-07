import { Printer, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

const options = [
  {
    icon: Printer,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Sparkles,
    gradient: 'from-accent to-orange-500',
    featured: true,
  },
];

export const PrintingOptions = () => {
  const { t } = useLanguage();

  const optionTranslations = [
    t.printing.option1,
    t.printing.option2,
    t.printing.option3,
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t.printing.sectionLabel}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t.printing.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.printing.subtitle}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {options.map((option, index) => {
            const Icon = option.icon;
            const content = optionTranslations[index];
            return (
              <div
                key={index}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  option.featured
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-primary-foreground shadow-hero'
                    : 'bg-card border border-border hover:shadow-lg'
                }`}
              >
                {option.featured && (
                  <div className="absolute -top-3 right-6">
                    <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {t.printing.option3.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-6 ${option.featured ? 'bg-white/20' : ''}`}>
                  <Icon className={`w-7 h-7 ${option.featured ? 'text-white' : 'text-white'}`} />
                </div>

                {/* Content */}
                <h3 className={`font-display text-xl font-bold mb-3 ${option.featured ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {content.title}
                </h3>
                <p className={`leading-relaxed ${option.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {content.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="hero" size="lg" className="group">
            <Sparkles className="w-5 h-5" />
            {t.printing.cta}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};
