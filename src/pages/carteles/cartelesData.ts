import { Home, Building2, Castle, ArrowDown, Store, Briefcase, Warehouse, Car, Map, Building } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PropertyDef {
  name: string;
  slug: string;
  plural: string;
  icon: LucideIcon;
  keywords: string;
}

export const PROPERTIES: PropertyDef[] = [
  { name: 'Piso', slug: 'piso', plural: 'pisos', icon: Building2, keywords: 'vivienda, apartamento, piso' },
  { name: 'Casa / Chalet', slug: 'casa', plural: 'casas y chalets', icon: Home, keywords: 'chalet, villa, adosado' },
  { name: 'Ático', slug: 'atico', plural: 'áticos', icon: Castle, keywords: 'ático, penthouse' },
  { name: 'Bajo / Entreplanta', slug: 'bajo', plural: 'bajos y entreplantas', icon: ArrowDown, keywords: 'bajo, entreplanta' },
  { name: 'Local Comercial', slug: 'local', plural: 'locales comerciales', icon: Store, keywords: 'local, comercio, tienda' },
  { name: 'Oficina', slug: 'oficina', plural: 'oficinas', icon: Briefcase, keywords: 'oficina, despacho' },
  { name: 'Nave Industrial', slug: 'nave', plural: 'naves industriales', icon: Warehouse, keywords: 'nave, almacén, industrial' },
  { name: 'Garaje / Parking', slug: 'garaje', plural: 'garajes y parkings', icon: Car, keywords: 'garaje, parking, plaza' },
  { name: 'Terreno / Solar', slug: 'terreno', plural: 'terrenos y solares', icon: Map, keywords: 'terreno, solar, parcela' },
  { name: 'Edificio', slug: 'edificio', plural: 'edificios', icon: Building, keywords: 'edificio, inmueble completo' },
];

export interface TypeDef {
  type: string;
  typeSlug: string;
  verb: string;
  lead: string;
  leads: string;
  heroHeadline: string;
  heroSub: string;
  heroCTA: string;
}

export const TYPE_DATA: Record<string, TypeDef> = {
  'se-vende': {
    type: 'SE VENDE',
    typeSlug: 'se-vende',
    verb: 'vender',
    lead: 'comprador',
    leads: 'compradores',
    heroHeadline: 'Carteles SE VENDE con QR inteligente',
    heroSub: 'Capta compradores 24/7. Los interesados escanean el QR desde la calle y ven toda la información de tu inmueble al instante.',
    heroCTA: 'Pedir cartel Se Vende',
  },
  'se-alquila': {
    type: 'SE ALQUILA',
    typeSlug: 'se-alquila',
    verb: 'alquilar',
    lead: 'inquilino',
    leads: 'inquilinos',
    heroHeadline: 'Carteles SE ALQUILA con QR inteligente',
    heroSub: 'Capta inquilinos sin intermediarios. Los interesados escanean el QR desde la calle y ven fotos, precio y contacto al instante.',
    heroCTA: 'Pedir cartel Se Alquila',
  },
};

export function getProductSEO(typeSlug: string, propSlug?: string) {
  const td = TYPE_DATA[typeSlug];
  if (!td) return { title: 'Carteles con QR | Zigno', description: '' };

  const prop = propSlug ? PROPERTIES.find(p => p.slug === propSlug) : null;

  if (prop) {
    const name = prop.name.toUpperCase();
    return {
      title: `Cartel ${td.type} ${name} con QR | Zigno`,
      description: `Cartel '${td.type} ${prop.name}' con código QR inteligente. Polipropileno resistente exterior. Activa en zignoqr.com. Desde 14,99€.`,
    };
  }

  return {
    title: `Cartel ${td.type} con QR inteligente | Zigno`,
    description: `Carteles '${td.type}' con QR impreso. ${td.leads.charAt(0).toUpperCase() + td.leads.slice(1)} escanean y ven tu inmueble al instante. Desde 14,99€ IVA incluido.`,
  };
}

export function getProductHeroContent(typeSlug: string, propSlug: string) {
  const td = TYPE_DATA[typeSlug];
  const prop = PROPERTIES.find(p => p.slug === propSlug);
  if (!td || !prop) return null;

  const isVenta = typeSlug === 'se-vende';

  const headlines: Record<string, Record<string, { headline: string; sub: string }>> = {
    'se-vende': {
      piso: {
        headline: 'Cartel SE VENDE PISO con QR inteligente',
        sub: 'El cartel más eficaz para vender tu piso. Los compradores escanean el QR desde la calle y ven fotos, precio y tu contacto al instante — sin necesidad de llamar primero.',
      },
      casa: {
        headline: 'Cartel SE VENDE CASA con QR inteligente',
        sub: 'Vende tu chalet, villa o adosado de forma profesional. QR que lleva a una landing con todas las fotos y detalles.',
      },
      local: {
        headline: 'Cartel SE VENDE LOCAL COMERCIAL con QR',
        sub: 'Señaliza tu local con un cartel profesional. Los compradores escanean el QR y acceden a toda la información sin intermediarios.',
      },
    },
    'se-alquila': {
      piso: {
        headline: 'Cartel SE ALQUILA PISO con QR inteligente',
        sub: 'Alquila tu piso más rápido. Los inquilinos escanean el QR, ven las fotos y contactan directamente contigo.',
      },
      local: {
        headline: 'Cartel SE ALQUILA LOCAL COMERCIAL con QR',
        sub: 'Alquila tu local con un cartel que trabaja por ti 24/7. QR con toda la información del inmueble.',
      },
    },
  };

  const custom = headlines[typeSlug]?.[propSlug];

  return {
    headline: custom?.headline ?? `Cartel ${td.type} ${prop.name.toUpperCase()} con QR inteligente`,
    sub: custom?.sub ?? `${isVenta ? 'Vende' : 'Alquila'} tu ${prop.name.toLowerCase()} con un cartel profesional. Los ${td.leads} escanean el QR y ven toda la información al instante.`,
    cta: 'Configurar mi cartel',
  };
}
