import { Link } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { Footer } from '@/components/landing/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { SIZES } from '@/components/carteles/OrderConfigurator';
import { CartelesHowItWorks } from '@/components/carteles/CartelesHowItWorks';
import { CartelesMaterialSpecs } from '@/components/carteles/CartelesMaterialSpecs';
import { CartelesFAQ } from '@/components/carteles/CartelesFAQ';
import { CartelesFinalCTA } from '@/components/carteles/CartelesFinalCTA';
import { Check, Home, Building2 } from 'lucide-react';

const HubPage = () => (
  <>
    <SEO
      title="Carteles SE VENDE y SE ALQUILA con QR | Zigno"
      description="Carteles inmobiliarios con QR impreso. Señalización profesional en polipropileno. Activa tu QR en zignoqr.com. Envío a toda España."
      canonical="https://zignoqr.com/carteles"
    />
    <Header />
    <main className="pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold tracking-wide bg-accent/10 text-accent px-3 py-1 rounded-full mb-6">
              Carteles para inmobiliarias · España
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              Carteles <span className="text-accent">SE VENDE</span> y <span className="text-accent">SE ALQUILA</span> con QR inteligente
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Señalización profesional impresa en polipropileno resistente al exterior. Activa tu QR en zignoqr.com y crea tu landing en minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button asChild variant="hero" size="xl">
                <Link to="/carteles/se-vende">Ver carteles Se Vende</Link>
              </Button>
              <Button asChild variant="heroOutline" size="xl">
                <Link to="/carteles/se-alquila">Ver carteles Se Alquila</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['Impresión profesional', 'Entrega en 48-72h', 'QR activable incluido', 'Resistente exterior 3 años'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-20 bg-card">
        <div className="container-wide">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-3">Nuestros carteles</p>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-10">Elige tu cartel</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            {[
              { title: 'SE VENDE', desc: 'Para propietarios que quieren vender su inmueble.', icon: Home, slug: 'se-vende' },
              { title: 'SE ALQUILA', desc: 'Para propietarios que quieren alquilar su inmueble.', icon: Building2, slug: 'se-alquila' },
            ].map(c => (
              <Link
                key={c.slug}
                to={`/carteles/${c.slug}`}
                className="group rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{c.desc}</p>
                <span className="text-sm font-semibold text-primary group-hover:underline">Ver carteles →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Size selector */}
      <section className="py-20 bg-muted">
        <div className="container-wide">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-10">Elige el tamaño</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SIZES.map(s => (
              <div
                key={s.code}
                className="relative rounded-lg border border-border bg-card p-4 text-center shadow-sm"
              >
                {s.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                    Más popular
                  </span>
                )}
                <span className="block font-display text-2xl font-extrabold text-foreground">{s.code}</span>
                <span className="block text-xs text-muted-foreground mt-1">{s.dims}</span>
                <span className="block text-xs text-muted-foreground">{s.use}</span>
                <span className="block text-base font-bold text-primary mt-2">desde {s.price.toFixed(2).replace('.', ',')} €</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CartelesHowItWorks />
      <CartelesMaterialSpecs />
      <CartelesFAQ />
      <CartelesFinalCTA />
    </main>
    <TrustStrip />
    <Footer />
  </>
);

export default HubPage;
