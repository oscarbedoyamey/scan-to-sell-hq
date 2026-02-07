import { FileText, QrCode, Printer } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const steps = [
  {
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: QrCode,
    gradient: 'from-primary to-cyan-400',
  },
  {
    icon: Printer,
    gradient: 'from-cyan-500 to-teal-500',
  },
];

export const HowItWorks = () => {
  const { t } = useLanguage();

  const stepTranslations = [
    t.howItWorks.step1,
    t.howItWorks.step2,
    t.howItWorks.step3,
  ];

  return (
    <section id="how-it-works" className="section-padding bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t.howItWorks.sectionLabel}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t.howItWorks.title}{' '}
            <span className="text-gradient">{t.howItWorks.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const content = stepTranslations[index];
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}

                <div className="bg-card rounded-2xl p-8 shadow-md hover:shadow-card-hover transition-all duration-300 border border-border/50 h-full">
                  {/* Step number */}
                  <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {content.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {content.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
