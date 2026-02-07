import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

export const Pricing = () => {
  const { t } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      ...t.pricing.free,
      popular: false,
    },
    {
      ...t.pricing.pro,
      popular: true,
    },
    {
      ...t.pricing.agency,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="section-padding bg-secondary/30">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t.pricing.sectionLabel}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t.pricing.subtitle}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-secondary rounded-full">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly
                  ? 'bg-white shadow-md text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.pricing.monthly}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly
                  ? 'bg-white shadow-md text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.pricing.yearly}
              <span className="bg-success text-success-foreground text-xs px-2 py-0.5 rounded-full">
                {t.pricing.yearlyDiscount}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-white shadow-xl border-2 border-primary scale-105 z-10'
                  : 'bg-white shadow-md border border-border hover:shadow-lg'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && 'popular' in plan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                    {plan.popular}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-foreground">
                  {isYearly && 'priceYearly' in plan ? plan.priceYearly : plan.price}
                </span>
                <span className="text-muted-foreground">
                  {isYearly ? t.pricing.perYear : t.pricing.perMonth}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.popular ? 'hero' : 'outline'}
                className="w-full"
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
