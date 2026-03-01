import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: '¿Qué necesito hacer cuando recibo el cartel?',
    a: 'Al recibir tu cartel, entra en zignoqr.com y activa tu código QR. En pocos minutos puedes subir fotos, precio, descripción y datos de contacto del inmueble. Los compradores o inquilinos que escaneen el QR desde la calle verán toda esa información en una landing page profesional.',
  },
  {
    q: '¿Cuánto tarda en llegar el cartel?',
    a: 'El plazo de entrega habitual es 48-72 horas laborables a toda España. Para pedidos grandes o urgentes, contacta con nosotros.',
  },
  {
    q: '¿Puedo reutilizar el cartel en otro inmueble?',
    a: 'Sí. Cuando vendas o alquiles el inmueble, puedes desactivar el QR y volver a activarlo con un nuevo inmueble desde zignoqr.com.',
  },
  {
    q: '¿Qué diferencia hay entre los carteles con y sin perforaciones?',
    a: 'Los carteles sin perforaciones son lisos, ideales para pegar con cinta adhesiva o velcro. Los de 4 ojales tienen agujeros en las 4 esquinas para colgar con bridas o alambre. Los de 10 ojales tienen agujeros por todo el perímetro para fijación reforzada en vallas o grandes superficies.',
  },
  {
    q: '¿Los precios incluyen el IVA?',
    a: 'Sí, todos los precios mostrados incluyen IVA (21%).',
  },
];

export const CartelesFAQ = () => (
  <section id="faq-carteles" className="py-20 bg-card">
    <div className="container-wide max-w-3xl">
      <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-8">
        Preguntas frecuentes
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
