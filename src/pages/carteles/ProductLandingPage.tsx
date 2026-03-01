import { useParams, Link, Navigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { Footer } from '@/components/landing/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, ChevronRight } from 'lucide-react';
import { OrderConfigurator } from '@/components/carteles/OrderConfigurator';
import { CartelesHowItWorks } from '@/components/carteles/CartelesHowItWorks';
import { CartelesMaterialSpecs } from '@/components/carteles/CartelesMaterialSpecs';
import { CartelesFAQ } from '@/components/carteles/CartelesFAQ';
import { CartelesFinalCTA } from '@/components/carteles/CartelesFinalCTA';
import { TYPE_DATA, PROPERTIES, getProductSEO, getProductHeroContent } from './cartelesData';

const ProductLandingPage = () => {
  const { type, property } = useParams<{ type: string; property: string }>();
  const td = type ? TYPE_DATA[type] : null;
  const prop = property ? PROPERTIES.find(p => p.slug === property) : null;
  if (!td || !prop) return <Navigate to="/carteles" replace />;

  const seo = getProductSEO(td.typeSlug, prop.slug);
  const hero = getProductHeroContent(td.typeSlug, prop.slug);
  if (!hero) return <Navigate to="/carteles" replace />;

  // Related products: same type, different property
  const related = PROPERTIES.filter(p => p.slug !== prop.slug).slice(0, 3);

  return (
    <>
      <SEO title={seo.title} description={seo.description} canonical={`https://zignoqr.com/carteles/${td.typeSlug}/${prop.slug}`} />
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container-wide">
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
                <Link to="/carteles" className="hover:text-foreground transition-colors">Carteles</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to={`/carteles/${td.typeSlug}`} className="hover:text-foreground transition-colors capitalize">
                  {td.type.charAt(0) + td.type.slice(1).toLowerCase()}
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{prop.name}</span>
              </nav>

              <span className="inline-block text-xs font-semibold tracking-wide bg-accent/10 text-accent px-3 py-1 rounded-full mb-6">
                Cartel {td.type} {prop.name.toUpperCase()}
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
                {hero.headline}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">{hero.sub}</p>
              <Button asChild variant="hero" size="xl">
                <a href="#configurator">{hero.cta}</a>
              </Button>
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

        {/* Configurator */}
        <section id="configurator" className="py-20 bg-muted">
          <div className="container-wide max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-8">Configura tu cartel</h2>
            <OrderConfigurator type={`${td.type} ${prop.name.toUpperCase()}`} />
          </div>
        </section>

        {/* Condensed how it works */}
        <section className="py-16 bg-card">
          <div className="container-wide">
            <h2 className="font-display text-2xl font-extrabold text-foreground mb-8">Así de fácil</h2>
            <CartelesHowItWorks condensed />
          </div>
        </section>

        <CartelesMaterialSpecs />

        {/* Related products */}
        <section className="py-20 bg-muted">
          <div className="container-wide">
            <h2 className="font-display text-3xl font-extrabold text-foreground mb-8">También te puede interesar</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link
                  key={r.slug}
                  to={`/carteles/${td.typeSlug}/${r.slug}`}
                  className="group rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 mb-3">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground mb-1">
                    {td.type} {r.name}
                  </h3>
                  <span className="text-xs font-medium text-primary group-hover:underline">Ver cartel →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CartelesFAQ />
        <CartelesFinalCTA ctaText={hero.cta} ctaLink={`/carteles/${td.typeSlug}/${prop.slug}#configurator`} />
      </main>
      <TrustStrip />
      <Footer />
    </>
  );
};

export default ProductLandingPage;
