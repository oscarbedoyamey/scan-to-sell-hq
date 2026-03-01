import { ShoppingBag, Package, QrCode, Users } from 'lucide-react';

const steps = [
  { icon: ShoppingBag, title: 'Elige tu cartel', desc: 'Selecciona tipo, tamaño y opciones de perforación.' },
  { icon: Package, title: 'Recibe en casa', desc: 'Enviamos tu cartel impreso en 48-72h a toda España.' },
  { icon: QrCode, title: 'Activa tu QR', desc: 'Entra en zignoqr.com/activar, sube fotos, precio y descripción.' },
  { icon: Users, title: 'Capta visitas 24/7', desc: 'Los interesados escanean el QR y ven tu inmueble al instante.' },
];

interface Props {
  condensed?: boolean;
}

export const CartelesHowItWorks = ({ condensed }: Props) => {
  if (condensed) {
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
        {[steps[0], steps[2], steps[3]].map((step, i) => (
          <div key={i} className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {i + 1}
            </div>
            <p className="text-sm text-foreground font-medium">{step.title}</p>
            {i < 2 && <div className="hidden md:block flex-1 border-t-2 border-dotted border-border mx-4" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-20 bg-card">
      <div className="container-wide">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-3">Proceso simple</p>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-12">
          Recibe tu cartel y empieza a captar visitas en 4 pasos
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  {i + 1}
                </div>
                {i < 3 && <div className="hidden md:block flex-1 border-t-2 border-dotted border-border" />}
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
