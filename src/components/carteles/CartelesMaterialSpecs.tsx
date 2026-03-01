import { Layers, Paintbrush, Sun, Ruler, Wrench, Smartphone } from 'lucide-react';

const specs = [
  { icon: Layers, title: 'Polipropileno celular 2,5-3,5mm', desc: 'Rígido pero ligero. Mismo material que los carteles de agencias inmobiliarias.' },
  { icon: Paintbrush, title: 'Impresión UV CMYK directa', desc: 'Tintas UV de alta definición. Colores vibrantes que no se destiñen.' },
  { icon: Sun, title: 'Resistente al exterior', desc: 'Agua, lluvia, sol y viento. Duración estimada: 3 años en exterior.' },
  { icon: Ruler, title: '6 tamaños disponibles', desc: 'De A3 (29,7×42cm) a B1 (70,7×100cm). Elige el que mejor se ve desde la calle.' },
  { icon: Wrench, title: 'Con o sin perforaciones', desc: 'Sin perforaciones, con 4 ojales en esquinas, o con 10 ojales perimetrales.' },
  { icon: Smartphone, title: 'QR dinámico incluido', desc: 'Cada cartel lleva su propio QR único. Actívalo cuando quieras en zignoqr.com.' },
];

export const CartelesMaterialSpecs = () => (
  <section className="py-20 bg-muted">
    <div className="container-wide">
      <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-12">
        Material profesional, resistencia garantizada
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {specs.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
