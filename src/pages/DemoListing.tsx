import { MapPin, Bed, Bath, Ruler, MessageCircle, Mail, Phone, Calendar, Zap, Car, ArrowUpFromDot, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import zignoLogo from '@/assets/zigno-logo.png';
import propertyMockup from '@/assets/property-listing-mockup.jpg';
import { useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';

const demoData = {
  title: { en: 'Modern Apartment in City Center', es: 'Apartamento Moderno en Centro Ciudad', fr: 'Appartement Moderne en Centre-Ville', de: 'Moderne Wohnung im Stadtzentrum', it: 'Appartamento Moderno in Centro Città', pt: 'Apartamento Moderno no Centro da Cidade', pl: 'Nowoczesne Mieszkanie w Centrum Miasta' },
  location: 'Barcelona, España',
  price: 385000,
  operation: 'sale' as const,
  propertyType: 'apartment' as const,
  condition: 'good' as const,
  bedrooms: 3,
  bathrooms: 2,
  builtArea: 120,
  yearBuilt: 2019,
  energy: 'B',
  elevator: true,
  parking: true,
  description: {
    en: 'Stunning renovated apartment with natural light, high ceilings, and a private terrace overlooking the park. Located in a quiet yet central neighborhood, steps from shops, restaurants, and public transport.\n\nThe apartment features an open-plan living area with floor-to-ceiling windows, a modern kitchen with premium appliances, and three spacious bedrooms each with built-in closets. The master suite includes an en-suite bathroom with rain shower.\n\nAdditional features include hardwood floors throughout, central air conditioning, a storage room, and a parking space in the building garage.',
    es: 'Impresionante apartamento renovado con luz natural, techos altos y terraza privada con vistas al parque. Ubicado en un barrio tranquilo pero céntrico, a pocos pasos de tiendas, restaurantes y transporte público.\n\nEl apartamento cuenta con un salón diáfano con ventanales del suelo al techo, una cocina moderna con electrodomésticos de gama alta y tres amplios dormitorios con armarios empotrados. La suite principal incluye baño en suite con ducha de lluvia.\n\nCaracterísticas adicionales: suelos de madera, aire acondicionado central, trastero y plaza de garaje en el edificio.',
    fr: "Superbe appartement rénové avec lumière naturelle, hauts plafonds et terrasse privée donnant sur le parc. Situé dans un quartier calme mais central, à quelques pas des commerces, restaurants et transports en commun.\n\nL'appartement dispose d'un séjour ouvert avec baies vitrées, d'une cuisine moderne avec appareils haut de gamme et de trois chambres spacieuses avec placards intégrés. La suite parentale comprend une salle de bain privative avec douche à l'italienne.\n\nAutres atouts : parquet, climatisation centralisée, cave et place de parking dans le garage de l'immeuble.",
    de: 'Atemberaubende renovierte Wohnung mit natürlichem Licht, hohen Decken und einer privaten Terrasse mit Blick auf den Park. In einer ruhigen, aber zentralen Nachbarschaft gelegen, nur wenige Schritte von Geschäften, Restaurants und öffentlichen Verkehrsmitteln entfernt.\n\nDie Wohnung verfügt über einen offenen Wohnbereich mit raumhohen Fenstern, eine moderne Küche mit hochwertigen Geräten und drei geräumige Schlafzimmer mit Einbauschränken. Die Master-Suite umfasst ein eigenes Bad mit Regendusche.\n\nWeitere Ausstattung: Parkettböden, zentrale Klimaanlage, Abstellraum und Stellplatz in der Tiefgarage.',
    it: "Splendido appartamento ristrutturato con luce naturale, soffitti alti e terrazza privata con vista sul parco. Situato in un quartiere tranquillo ma centrale, a pochi passi da negozi, ristoranti e trasporti pubblici.\n\nL'appartamento dispone di un soggiorno open space con finestre dal pavimento al soffitto, cucina moderna con elettrodomestici di alta gamma e tre ampie camere da letto con armadi a muro. La suite padronale include un bagno privato con doccia a pioggia.\n\nUlteriori caratteristiche: pavimenti in parquet, aria condizionata centralizzata, ripostiglio e posto auto nel garage condominiale.",
    pt: 'Impressionante apartamento renovado com luz natural, tetos altos e terraço privado com vista para o parque. Localizado num bairro tranquilo mas central, a poucos passos de lojas, restaurantes e transportes públicos.\n\nO apartamento conta com uma sala de estar em open space com janelas do chão ao teto, cozinha moderna com eletrodomésticos de gama alta e três quartos espaçosos com armários embutidos. A suite principal inclui casa de banho privativa com chuveiro de chuva.\n\nCaracterísticas adicionais: pavimento em madeira, ar condicionado central, arrecadação e lugar de estacionamento na garagem do edifício.',
    pl: 'Oszałamiające odnowione mieszkanie z naturalnym światłem, wysokimi sufitami i prywatnym tarasem z widokiem na park. Położone w spokojnej, ale centralnej dzielnicy, w pobliżu sklepów, restauracji i komunikacji miejskiej.\n\nMieszkanie posiada otwarty salon z oknami od podłogi do sufitu, nowoczesną kuchnię z urządzeniami premium oraz trzy przestronne sypialnie z wbudowanymi szafami. Apartament główny obejmuje łazienkę z kabiną prysznicową z deszczownicą.\n\nDodatkowe udogodnienia: drewniane podłogi, centralna klimatyzacja, komórka lokatorska i miejsce parkingowe w garażu budynku.',
  },
  contact: { name: 'María López', agency: 'Barcelona Homes', phone: '+34 612 345 678', email: 'maria@barcelonahomes.es', whatsapp: '+34612345678' },
  ref: 'BCN-2024-0842',
};

const labels: Record<string, Record<string, string>> = {
  forSale: { en: 'For Sale', es: 'En venta', fr: 'À vendre', de: 'Zum Verkauf', it: 'In vendita', pt: 'À venda', pl: 'Na sprzedaż' },
  apartment: { en: 'Apartment', es: 'Piso', fr: 'Appartement', de: 'Wohnung', it: 'Appartamento', pt: 'Apartamento', pl: 'Mieszkanie' },
  good: { en: 'Good condition', es: 'Buen estado', fr: 'Bon état', de: 'Guter Zustand', it: 'Buone condizioni', pt: 'Bom estado', pl: 'Dobry stan' },
  bedrooms: { en: 'Bedrooms', es: 'Habitaciones', fr: 'Chambres', de: 'Schlafzimmer', it: 'Camere', pt: 'Quartos', pl: 'Sypialnie' },
  bathrooms: { en: 'Bathrooms', es: 'Baños', fr: 'Salles de bain', de: 'Bäder', it: 'Bagni', pt: 'Casas de banho', pl: 'Łazienki' },
  builtArea: { en: 'Built area', es: 'Superficie construida', fr: 'Surface construite', de: 'Wohnfläche', it: 'Superficie', pt: 'Área construída', pl: 'Pow. zabudowy' },
  yearBuilt: { en: 'Year built', es: 'Año construcción', fr: 'Année', de: 'Baujahr', it: 'Anno', pt: 'Ano', pl: 'Rok budowy' },
  energy: { en: 'Energy', es: 'Energía', fr: 'Énergie', de: 'Energie', it: 'Energia', pt: 'Energia', pl: 'Energia' },
  elevator: { en: 'Elevator', es: 'Ascensor', fr: 'Ascenseur', de: 'Aufzug', it: 'Ascensore', pt: 'Elevador', pl: 'Winda' },
  parking: { en: 'Parking', es: 'Parking', fr: 'Parking', de: 'Parkplatz', it: 'Parcheggio', pt: 'Estacionamento', pl: 'Parking' },
  yes: { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', pt: 'Sim', pl: 'Tak' },
  description: { en: 'Description', es: 'Descripción', fr: 'Description', de: 'Beschreibung', it: 'Descrizione', pt: 'Descrição', pl: 'Opis' },
  contactWhatsapp: { en: 'Contact via WhatsApp', es: 'Contactar por WhatsApp', fr: 'Contacter par WhatsApp', de: 'Über WhatsApp kontaktieren', it: 'Contatta via WhatsApp', pt: 'Contactar por WhatsApp', pl: 'Kontakt przez WhatsApp' },
  requestInfo: { en: 'Request information', es: 'Solicitar información', fr: 'Demander des informations', de: 'Informationen anfordern', it: 'Richiedi informazioni', pt: 'Solicitar informação', pl: 'Zapytaj o szczegóły' },
  demoBanner: { en: '✨ This is a demo listing — Create your own!', es: '✨ Este es un anuncio de ejemplo — ¡Crea el tuyo!', fr: '✨ Ceci est une annonce de démonstration — Créez la vôtre !', de: '✨ Dies ist ein Demo-Inserat — Erstellen Sie Ihr eigenes!', it: '✨ Questo è un annuncio demo — Crea il tuo!', pt: '✨ Este é um anúncio de demonstração — Crie o seu!', pl: '✨ To jest ogłoszenie demo — Stwórz własne!' },
  createMine: { en: 'Create my listing', es: 'Crear mi anuncio', fr: 'Créer mon annonce', de: 'Mein Inserat erstellen', it: 'Crea il mio annuncio', pt: 'Criar o meu anúncio', pl: 'Stwórz moje ogłoszenie' },
};

const DemoListing = () => {
  const { language } = useLanguage();
  const lang = language as string;
  const l = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const title = demoData.title[lang as keyof typeof demoData.title] || demoData.title.en;
  const desc = demoData.description[lang as keyof typeof demoData.description] || demoData.description.en;

  const price = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(demoData.price);

  const features = [
    { icon: <Bed className="w-4 h-4" />, label: l('bedrooms'), value: String(demoData.bedrooms) },
    { icon: <Bath className="w-4 h-4" />, label: l('bathrooms'), value: String(demoData.bathrooms) },
    { icon: <Ruler className="w-4 h-4" />, label: l('builtArea'), value: `${demoData.builtArea} m²` },
    { icon: <Calendar className="w-4 h-4" />, label: l('yearBuilt'), value: String(demoData.yearBuilt) },
    { icon: <Zap className="w-4 h-4" />, label: l('energy'), value: demoData.energy },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-accent text-accent-foreground text-center py-2.5 text-sm font-medium">
        {l('demoBanner')}{' '}
        <a href="/#pricing" className="underline underline-offset-2 font-bold hover:opacity-80">
          {l('createMine')} →
        </a>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <a href="/"><img src={zignoLogo} alt="ZIGNO" className="h-7 w-auto" /></a>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{demoData.contact.agency}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Hero image */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <img src={propertyMockup} alt={title} className="w-full h-64 sm:h-96 object-cover" />
          <div className="absolute top-4 left-4">
            <Badge className="bg-accent text-accent-foreground text-sm px-3 py-1">{price}</Badge>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="default" className="uppercase text-xs">{l('forSale')}</Badge>
                <Badge variant="outline" className="text-xs">{l('apartment')}</Badge>
                <Badge variant="outline" className="text-xs">{l('good')}</Badge>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
              <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4 shrink-0" /> {demoData.location}
              </p>
              <p className="font-display text-3xl font-bold text-accent mt-3">{price}</p>
            </div>

            {/* Features */}
            <Separator />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="text-muted-foreground">{f.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-semibold text-foreground">{f.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <ArrowUpFromDot className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{l('elevator')}</p>
                  <p className="font-semibold text-foreground">{l('yes')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Car className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{l('parking')}</p>
                  <p className="font-semibold text-foreground">{l('yes')}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <Separator />
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">{l('description')}</h2>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">{desc}</div>
            </div>

            <p className="text-xs text-muted-foreground">Ref: {demoData.ref}</p>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  M
                </div>
                <div>
                  <p className="font-semibold text-foreground">{demoData.contact.name}</p>
                  <p className="text-xs text-muted-foreground">{demoData.contact.agency}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {/* WhatsApp button */}
                <a
                  href={`https://wa.me/${demoData.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[hsl(142,70%,45%)] text-white font-medium text-sm hover:bg-[hsl(142,70%,38%)] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> {l('contactWhatsapp')}
                </a>
                <a
                  href={`tel:${demoData.contact.phone}`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-dark transition-colors"
                >
                  <Phone className="w-4 h-4" /> {demoData.contact.phone}
                </a>
                <a
                  href={`mailto:${demoData.contact.email}`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
                >
                  <Mail className="w-4 h-4" /> {demoData.contact.email}
                </a>
              </div>

              <Separator className="mb-4" />
              <h3 className="font-display font-bold text-foreground mb-3">{l('requestInfo')}</h3>
              <p className="text-sm text-muted-foreground italic">
                {lang === 'es' ? 'Formulario de contacto (solo disponible en anuncios reales)' : 'Contact form (only available on real listings)'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <a href="/"><img src={zignoLogo} alt="ZIGNO" className="h-5 w-auto opacity-60" /></a>
          <p className="text-xs text-muted-foreground">Powered by ZIGNO</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoListing;
