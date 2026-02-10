import { Printer, Building2 } from 'lucide-react';
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
];

export const PrintingOptions = () => {
  const { t } = useLanguage();

  const optionTranslations = [
    t.printing.option1,
    t.printing.option2,
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
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
          {options.map((option, index) => {
            const Icon = option.icon;
            const content = optionTranslations[index];
            return (
              <div
                key={index}
                className="relative rounded-2xl p-8 transition-all duration-300 bg-card border border-border hover:shadow-lg"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3 text-foreground">
                  {content.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {content.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
