import { PartyPopper, Image, DollarSign, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const OnboardingOverlay = ({ open, onClose }: Props) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent className="sm:max-w-md text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <PartyPopper className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2">
        ¡Tu cartel ya está conectado! 🎉
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Ahora añade los datos de tu inmueble. Cuando publiques, cualquier persona que escanee tu
        cartel verá esta información al instante.
      </p>

      <div className="space-y-3 text-left mb-6">
        {[
          { icon: Image, label: 'Fotos del inmueble' },
          { icon: DollarSign, label: 'Precio y descripción' },
          { icon: Mail, label: 'Tu contacto (email o WhatsApp)' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-foreground">{label}</span>
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full h-12 text-base" onClick={onClose}>
        Empezar →
      </Button>
      <p className="text-xs text-muted-foreground mt-2">Solo tarda unos 3 minutos.</p>
    </DialogContent>
  </Dialog>
);
