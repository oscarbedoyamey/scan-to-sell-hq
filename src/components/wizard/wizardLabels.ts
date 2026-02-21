import { useLanguage } from '@/i18n/LanguageContext';

// Shared wizard labels – kept in a single file to avoid duplication
const wizardLabels: Record<string, Record<string, string>> = {
  // General
  back: { en: 'Back to listings', es: 'Volver a anuncios', fr: 'Retour aux annonces', de: 'Zurück zu Inseraten', it: 'Torna agli annunci', pt: 'Voltar aos anúncios', pl: 'Wróć do ogłoszeń' },
  title: { en: 'Create new listing', es: 'Crear nuevo anuncio', fr: 'Créer une annonce', de: 'Neues Inserat erstellen', it: 'Crea nuovo annuncio', pt: 'Criar novo anúncio', pl: 'Utwórz ogłoszenie' },
  next: { en: 'Continue', es: 'Continuar', fr: 'Continuer', de: 'Weiter', it: 'Continua', pt: 'Continuar', pl: 'Dalej' },
  prev: { en: 'Back', es: 'Atrás', fr: 'Retour', de: 'Zurück', it: 'Indietro', pt: 'Voltar', pl: 'Wstecz' },
  saving: { en: 'Saving…', es: 'Guardando…', fr: 'Sauvegarde…', de: 'Speichern…', it: 'Salvataggio…', pt: 'Salvando…', pl: 'Zapisywanie…' },
  saved: { en: 'Draft saved', es: 'Borrador guardado', fr: 'Brouillon sauvegardé', de: 'Entwurf gespeichert', it: 'Bozza salvata', pt: 'Rascunho salvo', pl: 'Wersja robocza zapisana' },
  publish: { en: 'Publish listing', es: 'Publicar anuncio', fr: 'Publier l\'annonce', de: 'Inserat veröffentlichen', it: 'Pubblica annuncio', pt: 'Publicar anúncio', pl: 'Opublikuj ogłoszenie' },

  // Steps
  step1: { en: 'Property', es: 'Propiedad', fr: 'Bien', de: 'Immobilie', it: 'Proprietà', pt: 'Imóvel', pl: 'Nieruchomość' },
  step2: { en: 'Photos & Video', es: 'Fotos y vídeo', fr: 'Photos & Vidéo', de: 'Fotos & Video', it: 'Foto e Video', pt: 'Fotos e Vídeo', pl: 'Zdjęcia i wideo' },
  step3: { en: 'Contact & Review', es: 'Contacto y revisión', fr: 'Contact & Révision', de: 'Kontakt & Überprüfung', it: 'Contatto e Revisione', pt: 'Contato e Revisão', pl: 'Kontakt i przegląd' },

  // Step 1 – Property
  operationType: { en: 'Operation', es: 'Operación', fr: 'Opération', de: 'Vorgang', it: 'Operazione', pt: 'Operação', pl: 'Operacja' },
  sale: { en: 'Sale', es: 'Venta', fr: 'Vente', de: 'Verkauf', it: 'Vendita', pt: 'Venda', pl: 'Sprzedaż' },
  rent: { en: 'Rent', es: 'Alquiler', fr: 'Location', de: 'Miete', it: 'Affitto', pt: 'Aluguel', pl: 'Wynajem' },
  propertyType: { en: 'Property type', es: 'Tipo de propiedad', fr: 'Type de bien', de: 'Immobilienart', it: 'Tipo di proprietà', pt: 'Tipo de imóvel', pl: 'Typ nieruchomości' },
  apartment: { en: 'Apartment', es: 'Vivienda', fr: 'Appartement', de: 'Wohnung', it: 'Appartamento', pt: 'Apartamento', pl: 'Mieszkanie' },
  house: { en: 'House', es: 'Casa', fr: 'Maison', de: 'Haus', it: 'Casa', pt: 'Casa', pl: 'Dom' },
  villa: { en: 'Villa', es: 'Villa', fr: 'Villa', de: 'Villa', it: 'Villa', pt: 'Vila', pl: 'Willa' },
  land: { en: 'Land', es: 'Terreno', fr: 'Terrain', de: 'Grundstück', it: 'Terreno', pt: 'Terreno', pl: 'Działka' },
  commercial: { en: 'Commercial', es: 'Comercial', fr: 'Commercial', de: 'Gewerbe', it: 'Commerciale', pt: 'Comercial', pl: 'Komercyjny' },
  office: { en: 'Office', es: 'Oficina', fr: 'Bureau', de: 'Büro', it: 'Ufficio', pt: 'Escritório', pl: 'Biuro' },
  garage: { en: 'Garage', es: 'Garaje', fr: 'Garage', de: 'Garage', it: 'Garage', pt: 'Garagem', pl: 'Garaż' },
  other: { en: 'Other', es: 'Otro', fr: 'Autre', de: 'Sonstiges', it: 'Altro', pt: 'Outro', pl: 'Inne' },
  listingTitle: { en: 'Title', es: 'Título', fr: 'Titre', de: 'Titel', it: 'Titolo', pt: 'Título', pl: 'Tytuł' },
  titlePlaceholder: { en: 'e.g. Bright apartment in the city center', es: 'ej. Piso luminoso en el centro', fr: 'ex. Appartement lumineux en centre-ville', de: 'z.B. Helle Wohnung im Stadtzentrum', it: 'es. Luminoso appartamento in centro', pt: 'ex. Apartamento luminoso no centro', pl: 'np. Jasne mieszkanie w centrum' },
  description: { en: 'Description', es: 'Descripción', fr: 'Description', de: 'Beschreibung', it: 'Descrizione', pt: 'Descrição', pl: 'Opis' },
  price: { en: 'Price', es: 'Precio', fr: 'Prix', de: 'Preis', it: 'Prezzo', pt: 'Preço', pl: 'Cena' },
  currency: { en: 'Currency', es: 'Moneda', fr: 'Devise', de: 'Währung', it: 'Valuta', pt: 'Moeda', pl: 'Waluta' },
  bedrooms: { en: 'Bedrooms', es: 'Dormitorios', fr: 'Chambres', de: 'Schlafzimmer', it: 'Camere', pt: 'Quartos', pl: 'Sypialnie' },
  bathrooms: { en: 'Bathrooms', es: 'Baños', fr: 'Salles de bain', de: 'Badezimmer', it: 'Bagni', pt: 'Banheiros', pl: 'Łazienki' },
  builtArea: { en: 'Built area (m²)', es: 'Superficie construida (m²)', fr: 'Surface bâtie (m²)', de: 'Wohnfläche (m²)', it: 'Superficie (m²)', pt: 'Área construída (m²)', pl: 'Pow. zabudowy (m²)' },
  plotArea: { en: 'Plot area (m²)', es: 'Superficie parcela (m²)', fr: 'Surface terrain (m²)', de: 'Grundstücksfläche (m²)', it: 'Superficie terreno (m²)', pt: 'Área do terreno (m²)', pl: 'Pow. działki (m²)' },
  address: { en: 'Address', es: 'Dirección', fr: 'Adresse', de: 'Adresse', it: 'Indirizzo', pt: 'Endereço', pl: 'Adres' },
  street: { en: 'Street', es: 'Calle', fr: 'Rue', de: 'Straße', it: 'Via', pt: 'Rua', pl: 'Ulica' },
  city: { en: 'City', es: 'Ciudad', fr: 'Ville', de: 'Stadt', it: 'Città', pt: 'Cidade', pl: 'Miasto' },
  postalCode: { en: 'Postal code', es: 'Código postal', fr: 'Code postal', de: 'PLZ', it: 'CAP', pt: 'CEP', pl: 'Kod pocztowy' },
  region: { en: 'Region / Province', es: 'Región / Provincia', fr: 'Région', de: 'Region', it: 'Regione', pt: 'Região', pl: 'Region' },
  country: { en: 'Country', es: 'País', fr: 'Pays', de: 'Land', it: 'Paese', pt: 'País', pl: 'Kraj' },
  extras: { en: 'Extras', es: 'Extras', fr: 'Extras', de: 'Extras', it: 'Extra', pt: 'Extras', pl: 'Dodatki' },
  elevator: { en: 'Elevator', es: 'Ascensor', fr: 'Ascenseur', de: 'Aufzug', it: 'Ascensore', pt: 'Elevador', pl: 'Winda' },
  parking: { en: 'Parking', es: 'Aparcamiento', fr: 'Parking', de: 'Parkplatz', it: 'Parcheggio', pt: 'Estacionamento', pl: 'Parking' },
  yearBuilt: { en: 'Year built', es: 'Año de construcción', fr: 'Année de construction', de: 'Baujahr', it: 'Anno di costruzione', pt: 'Ano de construção', pl: 'Rok budowy' },
  condition: { en: 'Condition', es: 'Estado', fr: 'État', de: 'Zustand', it: 'Condizione', pt: 'Condição', pl: 'Stan' },
  condNew: { en: 'New', es: 'Nuevo', fr: 'Neuf', de: 'Neu', it: 'Nuovo', pt: 'Novo', pl: 'Nowy' },
  condGood: { en: 'Good', es: 'Buen estado', fr: 'Bon état', de: 'Gut', it: 'Buono', pt: 'Bom', pl: 'Dobry' },
  condRenov: { en: 'Needs renovation', es: 'Para reformar', fr: 'À rénover', de: 'Renovierungsbedürftig', it: 'Da ristrutturare', pt: 'Para renovar', pl: 'Do remontu' },

  // Step 2 – Media
  coverImage: { en: 'Cover photo', es: 'Foto de portada', fr: 'Photo de couverture', de: 'Titelbild', it: 'Foto di copertina', pt: 'Foto de capa', pl: 'Zdjęcie główne' },
  gallery: { en: 'Gallery (up to 30 photos)', es: 'Galería (hasta 30 fotos)', fr: 'Galerie (jusqu\'à 30 photos)', de: 'Galerie (bis zu 30 Fotos)', it: 'Galleria (fino a 30 foto)', pt: 'Galeria (até 30 fotos)', pl: 'Galeria (do 30 zdjęć)' },
  videoUrl: { en: 'Video URL (YouTube/Vimeo)', es: 'URL del vídeo (YouTube/Vimeo)', fr: 'URL de la vidéo (YouTube/Vimeo)', de: 'Video-URL (YouTube/Vimeo)', it: 'URL video (YouTube/Vimeo)', pt: 'URL do vídeo (YouTube/Vimeo)', pl: 'URL wideo (YouTube/Vimeo)' },
  dropzone: { en: 'Click or drag photos here', es: 'Haz clic o arrastra fotos aquí', fr: 'Cliquez ou glissez des photos ici', de: 'Klicken oder Fotos hierher ziehen', it: 'Clicca o trascina le foto qui', pt: 'Clique ou arraste fotos aqui', pl: 'Kliknij lub przeciągnij zdjęcia tutaj' },
  uploading: { en: 'Uploading…', es: 'Subiendo…', fr: 'Téléversement…', de: 'Hochladen…', it: 'Caricamento…', pt: 'Enviando…', pl: 'Przesyłanie…' },

  // Step 3 – Contact
  contactName: { en: 'Contact name', es: 'Nombre de contacto', fr: 'Nom du contact', de: 'Kontaktname', it: 'Nome di contatto', pt: 'Nome de contato', pl: 'Imię kontaktowe' },
  contactPhone: { en: 'Phone', es: 'Teléfono', fr: 'Téléphone', de: 'Telefon', it: 'Telefono', pt: 'Telefone', pl: 'Telefon' },
  contactEmail: { en: 'Email', es: 'Email', fr: 'Email', de: 'E-Mail', it: 'Email', pt: 'Email', pl: 'Email' },
  contactWhatsapp: { en: 'WhatsApp', es: 'WhatsApp', fr: 'WhatsApp', de: 'WhatsApp', it: 'WhatsApp', pt: 'WhatsApp', pl: 'WhatsApp' },
  agencyName: { en: 'Agency name (optional)', es: 'Nombre de agencia (opcional)', fr: 'Nom de l\'agence (optionnel)', de: 'Agenturname (optional)', it: 'Nome agenzia (opzionale)', pt: 'Nome da agência (opcional)', pl: 'Nazwa agencji (opcjonalnie)' },
  showPhone: { en: 'Show phone on listing', es: 'Mostrar teléfono', fr: 'Afficher le téléphone', de: 'Telefon anzeigen', it: 'Mostra telefono', pt: 'Mostrar telefone', pl: 'Pokaż telefon' },
  showEmail: { en: 'Show email on listing', es: 'Mostrar email', fr: 'Afficher l\'email', de: 'E-Mail anzeigen', it: 'Mostra email', pt: 'Mostrar email', pl: 'Pokaż email' },
  showWhatsapp: { en: 'Show WhatsApp on listing', es: 'Mostrar WhatsApp', fr: 'Afficher WhatsApp', de: 'WhatsApp anzeigen', it: 'Mostra WhatsApp', pt: 'Mostrar WhatsApp', pl: 'Pokaż WhatsApp' },
  review: { en: 'Review your listing', es: 'Revisa tu anuncio', fr: 'Vérifiez votre annonce', de: 'Überprüfen Sie Ihr Inserat', it: 'Rivedi il tuo annuncio', pt: 'Revise seu anúncio', pl: 'Przejrzyj ogłoszenie' },

  // Validation
  required: { en: 'Required', es: 'Obligatorio', fr: 'Requis', de: 'Erforderlich', it: 'Obbligatorio', pt: 'Obrigatório', pl: 'Wymagane' },
  operationRequired: { en: 'Select sale or rent', es: 'Selecciona venta o alquiler', fr: 'Sélectionnez vente ou location', de: 'Verkauf oder Miete wählen', it: 'Seleziona vendita o affitto', pt: 'Selecione venda ou aluguel', pl: 'Wybierz sprzedaż lub wynajem' },
  typeRequired: { en: 'Select a property type', es: 'Selecciona un tipo de propiedad', fr: 'Sélectionnez un type de bien', de: 'Wählen Sie eine Immobilienart', it: 'Seleziona un tipo di proprietà', pt: 'Selecione um tipo de imóvel', pl: 'Wybierz typ nieruchomości' },
};

export const useWizardLabels = () => {
  const { language } = useLanguage();
  return (key: string) => wizardLabels[key]?.[language] || wizardLabels[key]?.en || key;
};

export default wizardLabels;
