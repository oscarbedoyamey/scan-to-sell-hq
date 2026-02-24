import { useState, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Badge } from '@/components/ui/badge';

// Import poster examples (Spanish - legacy)
import posterExample1 from '@/assets/poster-example-1.jpg';
import posterExample2 from '@/assets/poster-example-2.jpg';
import posterExample3 from '@/assets/poster-example-3.jpg';
import posterExample4 from '@/assets/poster-example-4.jpg';
import posterExample5 from '@/assets/poster-example-5.jpg';

// Import language-specific office rent posters
import officeRentEn from '@/assets/office_rent_en.png';
import officeRentEs from '@/assets/office_rent_es.png';
import officeRentFr from '@/assets/office_rent_fr.png';
import officeRentDe from '@/assets/office_rent_de.png';
import officeRentIt from '@/assets/office_rent_it.png';
import officeRentPt from '@/assets/office_rent_pt.png';
import officeRentPl from '@/assets/office_rent_pl.png';

// Import language-specific apartment sale posters
import ventaPisoEn from '@/assets/venta_piso_en.png';
import ventaPisoEs from '@/assets/venta_piso_es.png';
import ventaPisoFr from '@/assets/venta_piso_fr.png';
import ventaPisoDe from '@/assets/venta_piso_de.png';
import ventaPisoIt from '@/assets/venta_piso_it.png';
import ventaPisoPt from '@/assets/venta_piso_pt.png';
import ventaPisoPl from '@/assets/venta_piso_pl.png';

interface PosterItem {
  id: number;
  image: string;
  type: 'rent' | 'sale';
  property: 'local' | 'parking' | 'housing' | 'office';
  format: 'banner' | 'sticker' | 'poster';
  color: string;
}

const officeRentByLang: Record<string, string> = {
  en: officeRentEn, es: officeRentEs, fr: officeRentFr,
  de: officeRentDe, it: officeRentIt, pt: officeRentPt, pl: officeRentPl,
};

const ventaPisoByLang: Record<string, string> = {
  en: ventaPisoEn, es: ventaPisoEs, fr: ventaPisoFr,
  de: ventaPisoDe, it: ventaPisoIt, pt: ventaPisoPt, pl: ventaPisoPl,
};

const getPostersForLang = (lang: string): PosterItem[] => {
  const officeImg = officeRentByLang[lang] || officeRentByLang.en;
  const aptImg = ventaPisoByLang[lang] || ventaPisoByLang.en;

  const posters: PosterItem[] = [
    { id: 1, image: officeImg, type: 'rent', property: 'office', format: 'poster', color: 'Naranja' },
    { id: 2, image: aptImg, type: 'sale', property: 'housing', format: 'poster', color: 'Naranja' },
  ];

  // Add extra Spanish-only posters
  if (lang === 'es') {
    posters.push(
      { id: 3, image: posterExample1, type: 'rent', property: 'local', format: 'poster', color: 'Azul corporativo' },
      { id: 4, image: posterExample2, type: 'rent', property: 'local', format: 'poster', color: 'Azul clásico' },
      { id: 5, image: posterExample3, type: 'rent', property: 'parking', format: 'poster', color: 'Verde' },
      { id: 6, image: posterExample4, type: 'rent', property: 'parking', format: 'banner', color: 'Naranja' },
      { id: 7, image: posterExample5, type: 'rent', property: 'parking', format: 'banner', color: 'Naranja profesional' },
    );
  }

  return posters;
};

const filterLabels = {
  all: { en: 'All', es: 'Todos', fr: 'Tous', de: 'Alle', it: 'Tutti', pt: 'Todos', pl: 'Wszystkie' },
  rent: { en: 'For Rent', es: 'Se Alquila', fr: 'À Louer', de: 'Zu Vermieten', it: 'In Affitto', pt: 'Para Alugar', pl: 'Do Wynajęcia' },
  sale: { en: 'For Sale', es: 'Se Vende', fr: 'À Vendre', de: 'Zu Verkaufen', it: 'In Vendita', pt: 'Para Venda', pl: 'Na Sprzedaż' },
  local: { en: 'Commercial', es: 'Local', fr: 'Local', de: 'Gewerbe', it: 'Locale', pt: 'Loja', pl: 'Lokal' },
  parking: { en: 'Parking', es: 'Parking', fr: 'Parking', de: 'Parkplatz', it: 'Parcheggio', pt: 'Estacionamento', pl: 'Parking' },
  housing: { en: 'Housing', es: 'Vivienda', fr: 'Logement', de: 'Wohnung', it: 'Abitazione', pt: 'Habitação', pl: 'Mieszkanie' },
  office: { en: 'Office', es: 'Oficina', fr: 'Bureau', de: 'Büro', it: 'Ufficio', pt: 'Escritório', pl: 'Biuro' },
  poster: { en: 'Poster', es: 'Cartel', fr: 'Affiche', de: 'Plakat', it: 'Poster', pt: 'Cartaz', pl: 'Plakat' },
  banner: { en: 'Banner', es: 'Lona', fr: 'Bâche', de: 'Banner', it: 'Striscione', pt: 'Faixa', pl: 'Baner' },
  sticker: { en: 'Sticker', es: 'Pegatina', fr: 'Autocollant', de: 'Aufkleber', it: 'Adesivo', pt: 'Autocolante', pl: 'Naklejka' },
  custom: { en: 'Custom', es: 'Personalizado', fr: 'Personnalisé', de: 'Individuell', it: 'Personalizzato', pt: 'Personalizado', pl: 'Niestandardowy' },
};

export const PosterGallery = () => {
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);

  const getLabel = (key: keyof typeof filterLabels) => {
    return filterLabels[key][language as keyof (typeof filterLabels)['all']] || filterLabels[key].en;
  };

  const posters = useMemo(() => getPostersForLang(language), [language]);

  const filteredPosters = activeFilter === 'all' 
    ? posters 
    : posters.filter(p => p.type === activeFilter || p.property === activeFilter || p.format === activeFilter);

  const filters = [
    { key: 'all', label: getLabel('all') },
    { key: 'rent', label: getLabel('rent') },
    { key: 'sale', label: getLabel('sale') },
    { key: 'custom', label: getLabel('custom') },
  ];

  return (
    <section id="gallery" className="section-padding bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t.posterGallery.sectionLabel}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t.posterGallery.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.posterGallery.subtitle}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Poster Grid */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {filteredPosters.map((poster) => (
            <div
              key={poster.id}
              onClick={() => setSelectedPoster(poster)}
              className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)]"
            >
              {/* Poster Image */}
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={poster.image}
                  alt={`${getLabel(poster.type)} ${getLabel(poster.property)}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Overlay with badges */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs bg-white/90 text-foreground">
                    {getLabel(poster.type)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-white/90 text-foreground">
                    {getLabel(poster.property)}
                  </Badge>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-white text-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  {t.posterGallery.viewDetails}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span>{t.posterGallery.formats.poster}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent" />
            <span>{t.posterGallery.formats.banner}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span>{t.posterGallery.formats.sticker}</span>
          </div>
        </div>

        {/* Modal for expanded view */}
        {selectedPoster && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedPoster(null)}
          >
            <div 
              className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full max-h-[90vh] animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPoster(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                ✕
              </button>
              
              <img
                src={selectedPoster.image}
                alt={`${getLabel(selectedPoster.type)} ${getLabel(selectedPoster.property)}`}
                className="w-full h-auto"
              />
              
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary text-primary-foreground">
                    {getLabel(selectedPoster.type)}
                  </Badge>
                  <Badge variant="outline">
                    {getLabel(selectedPoster.property)}
                  </Badge>
                  <Badge variant="outline">
                    {getLabel(selectedPoster.format)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t.posterGallery.colorLabel}: {selectedPoster.color}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
