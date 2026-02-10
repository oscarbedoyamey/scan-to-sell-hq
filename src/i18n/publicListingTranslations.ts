export type PublicListingLang = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'pl';

const SUPPORTED: PublicListingLang[] = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl'];

export const detectPublicLang = (): PublicListingLang => {
  const raw = navigator.language.split('-')[0];
  return SUPPORTED.includes(raw as PublicListingLang) ? (raw as PublicListingLang) : 'en';
};

export const publicListingT = {
  en: {
    forSale: 'For Sale', forRent: 'For Rent', perMonth: '/month',
    bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', builtArea: 'Built area', plot: 'Plot',
    yearBuilt: 'Year built', energy: 'Energy', elevator: 'Elevator', parking: 'Parking', yes: 'Yes',
    description: 'Description', ref: 'Ref', notFound: 'Property not found', notFoundSub: 'This listing may no longer be available.',
    noPhotos: 'No photos available', requestInfo: 'Request information',
    propertyTypes: { apartment: 'Apartment', house: 'House', villa: 'Villa', land: 'Land', commercial: 'Commercial', office: 'Office', garage: 'Garage', other: 'Other' },
    conditions: { new: 'New build', good: 'Good condition', needs_renovation: 'Needs renovation' },
    leadForm: {
      name: 'Name', email: 'Email', phone: 'Phone', message: 'Message',
      placeholder: "I'm interested in this property...", consent: 'I agree to be contacted regarding this property',
      send: 'Send message', sent: 'Message sent!', sentSub: "We'll get back to you soon.",
    },
  },
  es: {
    forSale: 'En venta', forRent: 'En alquiler', perMonth: '/mes',
    bedrooms: 'Habitaciones', bathrooms: 'Baños', builtArea: 'Superficie construida', plot: 'Parcela',
    yearBuilt: 'Año construcción', energy: 'Energía', elevator: 'Ascensor', parking: 'Parking', yes: 'Sí',
    description: 'Descripción', ref: 'Ref', notFound: 'Inmueble no encontrado', notFoundSub: 'Este anuncio ya no está disponible.',
    noPhotos: 'Sin fotos disponibles', requestInfo: 'Solicitar información',
    propertyTypes: { apartment: 'Piso', house: 'Casa', villa: 'Chalet', land: 'Terreno', commercial: 'Local', office: 'Oficina', garage: 'Garaje', other: 'Otro' },
    conditions: { new: 'Obra nueva', good: 'Buen estado', needs_renovation: 'A reformar' },
    leadForm: {
      name: 'Nombre', email: 'Email', phone: 'Teléfono', message: 'Mensaje',
      placeholder: 'Me interesa este inmueble...', consent: 'Acepto ser contactado sobre este inmueble',
      send: 'Enviar mensaje', sent: '¡Mensaje enviado!', sentSub: 'Nos pondremos en contacto pronto.',
    },
  },
  fr: {
    forSale: 'À vendre', forRent: 'À louer', perMonth: '/mois',
    bedrooms: 'Chambres', bathrooms: 'Salles de bain', builtArea: 'Surface construite', plot: 'Terrain',
    yearBuilt: 'Année', energy: 'Énergie', elevator: 'Ascenseur', parking: 'Parking', yes: 'Oui',
    description: 'Description', ref: 'Réf', notFound: 'Bien non trouvé', notFoundSub: "Cette annonce n'est plus disponible.",
    noPhotos: 'Pas de photos disponibles', requestInfo: 'Demander des informations',
    propertyTypes: { apartment: 'Appartement', house: 'Maison', villa: 'Villa', land: 'Terrain', commercial: 'Local commercial', office: 'Bureau', garage: 'Garage', other: 'Autre' },
    conditions: { new: 'Neuf', good: 'Bon état', needs_renovation: 'À rénover' },
    leadForm: {
      name: 'Nom', email: 'Email', phone: 'Téléphone', message: 'Message',
      placeholder: 'Ce bien m\'intéresse...', consent: "J'accepte d'être contacté(e) au sujet de ce bien",
      send: 'Envoyer', sent: 'Message envoyé !', sentSub: 'Nous vous recontacterons bientôt.',
    },
  },
  de: {
    forSale: 'Zum Verkauf', forRent: 'Zur Miete', perMonth: '/Monat',
    bedrooms: 'Schlafzimmer', bathrooms: 'Bäder', builtArea: 'Wohnfläche', plot: 'Grundstück',
    yearBuilt: 'Baujahr', energy: 'Energie', elevator: 'Aufzug', parking: 'Parkplatz', yes: 'Ja',
    description: 'Beschreibung', ref: 'Ref', notFound: 'Immobilie nicht gefunden', notFoundSub: 'Dieses Inserat ist nicht mehr verfügbar.',
    noPhotos: 'Keine Fotos verfügbar', requestInfo: 'Informationen anfordern',
    propertyTypes: { apartment: 'Wohnung', house: 'Haus', villa: 'Villa', land: 'Grundstück', commercial: 'Gewerbe', office: 'Büro', garage: 'Garage', other: 'Sonstige' },
    conditions: { new: 'Neubau', good: 'Guter Zustand', needs_renovation: 'Renovierungsbedürftig' },
    leadForm: {
      name: 'Name', email: 'E-Mail', phone: 'Telefon', message: 'Nachricht',
      placeholder: 'Ich interessiere mich für diese Immobilie...', consent: 'Ich stimme einer Kontaktaufnahme zu dieser Immobilie zu',
      send: 'Nachricht senden', sent: 'Nachricht gesendet!', sentSub: 'Wir melden uns bald bei Ihnen.',
    },
  },
  it: {
    forSale: 'In vendita', forRent: 'In affitto', perMonth: '/mese',
    bedrooms: 'Camere', bathrooms: 'Bagni', builtArea: 'Superficie', plot: 'Terreno',
    yearBuilt: 'Anno', energy: 'Energia', elevator: 'Ascensore', parking: 'Parcheggio', yes: 'Sì',
    description: 'Descrizione', ref: 'Rif', notFound: 'Immobile non trovato', notFoundSub: 'Questo annuncio non è più disponibile.',
    noPhotos: 'Nessuna foto disponibile', requestInfo: 'Richiedi informazioni',
    propertyTypes: { apartment: 'Appartamento', house: 'Casa', villa: 'Villa', land: 'Terreno', commercial: 'Commerciale', office: 'Ufficio', garage: 'Garage', other: 'Altro' },
    conditions: { new: 'Nuova costruzione', good: 'Buone condizioni', needs_renovation: 'Da ristrutturare' },
    leadForm: {
      name: 'Nome', email: 'Email', phone: 'Telefono', message: 'Messaggio',
      placeholder: 'Sono interessato a questo immobile...', consent: 'Accetto di essere contattato riguardo questo immobile',
      send: 'Invia messaggio', sent: 'Messaggio inviato!', sentSub: 'Ti ricontatteremo presto.',
    },
  },
  pt: {
    forSale: 'À venda', forRent: 'Para alugar', perMonth: '/mês',
    bedrooms: 'Quartos', bathrooms: 'Casas de banho', builtArea: 'Área construída', plot: 'Terreno',
    yearBuilt: 'Ano', energy: 'Energia', elevator: 'Elevador', parking: 'Estacionamento', yes: 'Sim',
    description: 'Descrição', ref: 'Ref', notFound: 'Imóvel não encontrado', notFoundSub: 'Este anúncio já não está disponível.',
    noPhotos: 'Sem fotos disponíveis', requestInfo: 'Solicitar informação',
    propertyTypes: { apartment: 'Apartamento', house: 'Moradia', villa: 'Villa', land: 'Terreno', commercial: 'Comercial', office: 'Escritório', garage: 'Garagem', other: 'Outro' },
    conditions: { new: 'Construção nova', good: 'Bom estado', needs_renovation: 'Para renovar' },
    leadForm: {
      name: 'Nome', email: 'Email', phone: 'Telefone', message: 'Mensagem',
      placeholder: 'Estou interessado neste imóvel...', consent: 'Aceito ser contactado sobre este imóvel',
      send: 'Enviar mensagem', sent: 'Mensagem enviada!', sentSub: 'Entraremos em contacto brevemente.',
    },
  },
  pl: {
    forSale: 'Na sprzedaż', forRent: 'Do wynajęcia', perMonth: '/mies.',
    bedrooms: 'Sypialnie', bathrooms: 'Łazienki', builtArea: 'Pow. zabudowy', plot: 'Działka',
    yearBuilt: 'Rok budowy', energy: 'Energia', elevator: 'Winda', parking: 'Parking', yes: 'Tak',
    description: 'Opis', ref: 'Ref', notFound: 'Nie znaleziono nieruchomości', notFoundSub: 'To ogłoszenie nie jest już dostępne.',
    noPhotos: 'Brak zdjęć', requestInfo: 'Zapytaj o szczegóły',
    propertyTypes: { apartment: 'Mieszkanie', house: 'Dom', villa: 'Willa', land: 'Działka', commercial: 'Lokal', office: 'Biuro', garage: 'Garaż', other: 'Inne' },
    conditions: { new: 'Nowe', good: 'Dobry stan', needs_renovation: 'Do remontu' },
    leadForm: {
      name: 'Imię', email: 'Email', phone: 'Telefon', message: 'Wiadomość',
      placeholder: 'Jestem zainteresowany tą nieruchomością...', consent: 'Wyrażam zgodę na kontakt w sprawie tej nieruchomości',
      send: 'Wyślij wiadomość', sent: 'Wiadomość wysłana!', sentSub: 'Skontaktujemy się wkrótce.',
    },
  },
} as const;

export type PublicListingTranslations = typeof publicListingT['en'];
