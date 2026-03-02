import { QrCode, Globe, Clock, Users, BarChart3, Shield, Smartphone, Sparkles } from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    title: 'Landing profesional multiidioma',
    desc: 'Página web de tu inmueble con fotos, descripción, precio y datos de contacto. Traducida automáticamente a 7 idiomas para captar también a compradores internacionales.',
  },
  {
    icon: Clock,
    title: 'Vende o alquila 24/7',
    desc: 'Cualquier persona que pase por tu inmueble puede escanear el QR y ver toda la información al instante, sin llamadas ni esperas.',
  },
  {
    icon: Users,
    title: 'Capta interesados de forma automática',
    desc: 'Los visitantes pueden dejarte sus datos de contacto directamente desde la landing. Tú recibes un email y gestionas las visitas a tu ritmo.',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas en tiempo real',
    desc: 'Consulta cuántas personas han escaneado tu cartel, desde qué ciudad y en qué momento. Datos para tomar mejores decisiones.',
  },
  {
    icon: Shield,
    title: 'Privacidad total',
    desc: 'Decide qué datos mostrar: teléfono, email, WhatsApp… Evita contactos no deseados y mantén el control de tu información.',
  },
  {
    icon: Smartphone,
    title: 'Gestión desde el móvil',
    desc: 'Actualiza precio, fotos o descripción en cualquier momento desde tu panel. Los cambios se reflejan al instante en el QR.',
  },
];

interface CartelesQRBenefitsProps {
  compact?: boolean;
}

export const CartelesQRBenefits = ({ compact }: CartelesQRBenefitsProps) => {
  const displayBenefits = compact ? benefits.slice(0, 4) : benefits;

  return (
    <section className="py-20 bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10">
              <QrCode className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-semibold tracking-widest text-accent uppercase">Más que un cartel</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Tu cartel incluye un <span className="text-accent">QR inteligente</span> que trabaja por ti
          </h2>
          <p className="text-lg text-muted-foreground">
            Cada cartel lleva un código QR único que enlaza a una landing profesional de tu inmueble. Actívalo en minutos y empieza a recibir contactos de interesados de forma automática.
          </p>
        </div>

        {/* Benefits grid */}
        <div className={`grid md:grid-cols-2 ${compact ? '' : 'lg:grid-cols-3'} gap-6 mb-12`}>
          {displayBenefits.map((b, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 mb-4">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Subscription callout */}
        <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-accent/10 shrink-0">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                Cartel + Suscripción digital
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Al pedir tu cartel, también activas la <strong className="text-foreground">suscripción a Zigno</strong> que incluye: landing profesional, traducción automática a 7 idiomas, formulario de captación de interesados, estadísticas de escaneos y gestión completa desde tu panel.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-card border border-border rounded-full px-3 py-1.5">
                  📦 Cartel físico · desde 14,99 €
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-card border border-border rounded-full px-3 py-1.5">
                  🌐 Suscripción digital · desde 49 €/trimestre
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                La suscripción se gestiona por separado una vez actives tu QR. Sin permanencia: cancela cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
