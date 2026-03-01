import { useParams, Link, Navigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { Footer } from '@/components/landing/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import { OrderConfigurator } from '@/components/carteles/OrderConfigurator';
import { CartelesHowItWorks } from '@/components/carteles/CartelesHowItWorks';
import { CartelesMaterialSpecs } from '@/components/carteles/CartelesMaterialSpecs';
import { CartelesFAQ } from '@/components/carteles/CartelesFAQ';
import { CartelesFinalCTA } from '@/components/carteles/CartelesFinalCTA';
import { TYPE_DATA, PROPERTIES, getProductSEO } from './cartelesData';

const TypePage = () => {
  const { type } = useParams<{ type: string }>();
  const td = type ? TYPE_DATA[type] : null;
  if (!td) return <Navigate to="/carteles" replace />;

  const seo = getProductSEO(td.typeSlug);

  return (
    <>
      <SEO title={seo.title} description={seo.description} canonical={`https://zignoqr.com/carteles/${td.typeSlug}`} />
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container-wide">
            <div className="max-w-3xl">
              <span className="inline-block text-xs font-semibold tracking-wide bg-accent/10 text-accent px-3 py-1 rounded-full mb-6">
                Cartel {td.type} · España
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
                {td.heroHeadline}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">{td.heroSub}</p>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button asChild variant="hero" size="xl">
                  <a href="#configurator">{td.heroCTA}</a>
                </Button>
              </div>
              <Link to="/carteles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3 w-3" /> Ver todos los carteles
              </Link>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-6">
                {['Impresión profesional', 'Entrega en 48-72h', 'QR activable incluido', 'Resistente exterior 3 años'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-success" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Property type grid */}
        <section className="py-20 bg-card">
          <div className="container-wide">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-10">
              ¿Qué tipo de inmueble quieres {td.verb}?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {PROPERTIES.map(p => (
                <Link
                  key={p.slug}
                  to={`/carteles/${td.typeSlug}/${p.slug}`}
                  className="group rounded-lg border border-border bg-card p-4 text-center shadow-sm hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 mx-auto mb-3">
                    <p.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{p.name}</h3>
                  <span className="text-xs font-medium text-primary group-hover:underline">Ver cartel →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Configurator */}
        <section id="configurator" className="py-20 bg-muted">
          <div className="container-wide max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-8">Configura tu cartel</h2>
            <OrderConfigurator type={td.type} />
          </div>
        </section>

        <CartelesHowItWorks />
        <CartelesMaterialSpecs />
        <CartelesFAQ />
        <CartelesFinalCTA ctaText={td.heroCTA} ctaLink={`/carteles/${td.typeSlug}#configurator`} />
      </main>
      <TrustStrip />
      <Footer />
    </>
  );
};

export default TypePage;
