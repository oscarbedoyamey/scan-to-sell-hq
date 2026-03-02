import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { SEO } from '@/components/SEO';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CartelesOrderConfirmed = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <>
      <SEO title="Pedido confirmado | Zigno" description="Tu pedido de cartel ha sido confirmado." />
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-background">
          <div className="container-wide max-w-lg text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              ¡Pedido confirmado!
            </h1>
            <p className="text-muted-foreground mb-6">
              Hemos recibido tu pedido. Recibirás un email de confirmación con los detalles del envío.
            </p>
            <div className="bg-card rounded-lg border border-border p-6 mb-8 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Próximos pasos</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Preparamos tu cartel con impresión profesional</li>
                <li>Te lo enviamos en 48-72h laborables</li>
                <li>Activa tu QR en zignoqr.com cuando lo recibas</li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="hero">
                <Link to="/carteles">
                  Ver más carteles <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Ir al inicio</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CartelesOrderConfirmed;
