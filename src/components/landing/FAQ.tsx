import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

export const FAQ = () => {
  const { t } = useLanguage();

  return (
    <section id="faq" className="section-padding bg-secondary/30">
      <div className="container-tight">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t.faq.sectionLabel}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
            {t.faq.title}
          </h2>
          <p className="text-lg text-muted-foreground">{t.faq.subtitle}</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {t.faq.items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-xl border border-border px-6">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">{t.faq.contact}</p>
          <Button variant="outline">{t.faq.contactCta}</Button>
        </div>
      </div>
    </section>
  );
};
