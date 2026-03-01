import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  ctaText?: string;
  ctaLink?: string;
}

export const CartelesFinalCTA = ({
  ctaText = 'Ver todos los carteles',
  ctaLink = '/carteles',
}: Props) => (
  <section className="py-20 bg-primary">
    <div className="container-wide text-center">
      <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">
        Empieza hoy mismo
      </h2>
      <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
        Pide tu cartel, activa el QR y capta compradores desde el primer día.
      </p>
      <Button asChild variant="hero" size="xl">
        <Link to={ctaLink}>{ctaText}</Link>
      </Button>
    </div>
  </section>
);
