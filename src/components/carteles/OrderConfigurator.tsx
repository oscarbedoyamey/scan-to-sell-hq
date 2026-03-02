import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Truck, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';

const SIZES = [
  { code: 'A3', dims: '29,7 × 42 cm', use: 'Portales y ventanas', price: 14.99 },
  { code: 'B3', dims: '35,3 × 50 cm', use: 'Balcones estándar', price: 16.49 },
  { code: 'A2', dims: '42 × 59,4 cm', use: 'Balcones y escaparates', price: 17.99 },
  { code: 'B2', dims: '50 × 70,7 cm', use: 'Fachadas y locales', price: 21.99, popular: true },
  { code: 'A1', dims: '59,4 × 84,1 cm', use: 'Fachadas grandes', price: 27.99 },
  { code: 'B1', dims: '70,7 × 100 cm', use: 'Vallas y naves', price: 34.99 },
];

const PERFORATIONS = [
  { id: 'none', label: 'Sin perforaciones', desc: 'Para pegar con cinta o velcro', extra: 0 },
  { id: 'corners4', label: '4 ojales en esquinas', desc: 'Para colgar con bridas o alambre', extra: 2.00 },
  { id: 'perimeter10', label: '10 ojales perimetrales', desc: 'Para vallas y grandes superficies', extra: 3.50 },
];

interface OrderConfiguratorProps {
  type?: string;
}

export const OrderConfigurator = ({ type }: OrderConfiguratorProps) => {
  const [selectedSize, setSelectedSize] = useState('B2');
  const [selectedPerf, setSelectedPerf] = useState('none');
  const [phoneSpace, setPhoneSpace] = useState(false);
  const [loading, setLoading] = useState(false);

  const sizeObj = SIZES.find(s => s.code === selectedSize);
  const perfObj = PERFORATIONS.find(p => p.id === selectedPerf);
  const sizePrice = sizeObj?.price ?? 21.99;
  const perfExtra = perfObj?.extra ?? 0;
  const totalPrice = sizePrice + perfExtra;

  const handleOrder = async () => {
    // GA4 event: click on "Pedir cartel" CTA
    trackEvent('click_cta_pedido', {
      sign_type: type || 'SE VENDE',
      size_code: selectedSize,
      perforation_id: selectedPerf,
      phone_space: phoneSpace,
      value: totalPrice,
      currency: 'EUR',
    });

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-carteles-checkout', {
        body: {
          size_code: selectedSize,
          size_label: sizeObj?.dims,
          perforation_id: selectedPerf,
          perforation_label: perfObj?.label,
          phone_space: phoneSpace,
          total_price_cents: Math.round(totalPrice * 100),
          sign_type: type || 'SE VENDE',
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 md:p-8 shadow-sm">
      {/* Step 1: Size */}
      <div className="mb-8">
        <h3 className="font-display text-lg font-bold text-foreground mb-1">1. Elige el tamaño</h3>
        <p className="text-sm text-muted-foreground mb-4">Selecciona el formato que mejor se adapte a tu inmueble.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SIZES.map(s => (
            <button
              key={s.code}
              onClick={() => setSelectedSize(s.code)}
              className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                selectedSize === s.code
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {s.popular && (
                <span className="absolute -top-2.5 right-2 text-[10px] font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                  Más popular
                </span>
              )}
              <span className="block font-display text-base font-bold text-foreground">{s.code}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">{s.dims}</span>
              <span className="block text-xs text-muted-foreground">{s.use}</span>
              <span className="block text-sm font-semibold text-primary mt-1">{s.price.toFixed(2).replace('.', ',')} €</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Perforations */}
      <div className="mb-8">
        <h3 className="font-display text-lg font-bold text-foreground mb-1">2. Perforaciones</h3>
        <p className="text-sm text-muted-foreground mb-4">Elige cómo quieres fijar el cartel.</p>
        <div className="space-y-3">
          {PERFORATIONS.map(p => (
            <label
              key={p.id}
              className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selectedPerf === p.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                name="perforation"
                checked={selectedPerf === p.id}
                onChange={() => setSelectedPerf(p.id)}
                className="mt-1 accent-primary"
              />
              <div className="flex-1">
                <span className="font-semibold text-foreground text-sm">{p.label}</span>
                <span className="block text-xs text-muted-foreground">{p.desc}</span>
              </div>
              <span className="text-sm font-semibold text-primary whitespace-nowrap">
                {p.extra === 0 ? 'Incluido' : `+${p.extra.toFixed(2).replace('.', ',')} €`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Step 3: Phone space */}
      <div className="mb-8">
        <h3 className="font-display text-lg font-bold text-foreground mb-1">3. Espacio para teléfono</h3>
        <p className="text-sm text-muted-foreground mb-4">¿Quieres un espacio para escribir tu teléfono a mano?</p>
        <div className="flex gap-3">
          {[false, true].map(val => (
            <button
              key={String(val)}
              onClick={() => setPhoneSpace(val)}
              className={`flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-all ${
                phoneSpace === val
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {val ? 'Sí' : 'No'}
            </button>
          ))}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="border-t border-border pt-6">
        <div className="mb-4">
          <span className="text-sm text-muted-foreground">Precio del cartel</span>
          <p className="text-3xl font-display font-extrabold text-foreground">
            {totalPrice.toFixed(2).replace('.', ',')} €
          </p>
          <span className="text-xs text-muted-foreground">IVA incluido · Envío gratis</span>
        </div>

        {/* Subscription notice */}
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 mb-5">
          <p className="text-sm text-foreground font-semibold mb-1">
            🌐 Tu cartel incluye un QR inteligente
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Al activar el QR obtendrás una <strong className="text-foreground">landing profesional</strong> con fotos, descripción, formulario de contacto, traducción a 7 idiomas y estadísticas. La suscripción digital se contrata por separado (desde 49 €/trimestre) y se puede cancelar en cualquier momento.
          </p>
        </div>

        <Button
          variant="hero"
          size="xl"
          className="w-full text-base"
          onClick={handleOrder}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando…
            </span>
          ) : (
            `Pedir cartel — ${totalPrice.toFixed(2).replace('.', ',')} €`
          )}
        </Button>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Pago seguro</span>
          <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Envío 48-72h</span>
          <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Devolución garantizada</span>
        </div>
      </div>
    </div>
  );
};

export { SIZES };
