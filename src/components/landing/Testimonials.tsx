import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import testimonial1 from '@/assets/testimonial-1.jpg';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';

const testimonials = [
  { image: testimonial1, name: 'Marco García', role: 'Property Owner', location: 'Madrid, Spain', rating: 5, text: 'Zigno helped me sell my apartment in just 3 weeks. The QR code got over 200 scans!' },
  { image: testimonial2, name: 'Sophie Müller', role: 'Real Estate Agent', location: 'Munich, Germany', rating: 5, text: 'My clients love the modern approach. It sets my listings apart from the competition.' },
  { image: testimonial3, name: 'Pierre Dubois', role: 'Agency Director', location: 'Paris, France', rating: 5, text: 'We use Zigno for all our 50+ listings. The analytics are invaluable.' },
];

export const Testimonials = () => {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t.testimonials.sectionLabel}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t.testimonials.title} <span className="text-gradient">{t.testimonials.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t.testimonials.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-md border border-border/50 hover:shadow-lg transition-shadow">
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-muted-foreground mb-6">{item.text}</p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(item.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role} • {item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
