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
  commercial: { en: 'Commercial', es: 'Local comercial', fr: 'Local commercial', de: 'Gewerbe', it: 'Commerciale', pt: 'Comercial', pl: 'Lokal handlowy' },
  office: { en: 'Office', es: 'Oficina', fr: 'Bureau', de: 'Büro', it: 'Ufficio', pt: 'Escritório', pl: 'Biuro' },
  garage: { en: 'Garage', es: 'Garaje', fr: 'Garage', de: 'Garage', it: 'Garage', pt: 'Garagem', pl: 'Garaż' },
  warehouse: { en: 'Warehouse', es: 'Nave industrial', fr: 'Entrepôt', de: 'Lagerhalle', it: 'Capannone', pt: 'Armazém', pl: 'Magazyn' },
  other: { en: 'Other', es: 'Otro', fr: 'Autre', de: 'Sonstiges', it: 'Altro', pt: 'Outro', pl: 'Inne' },
  listingTitle: { en: 'Title', es: 'Título', fr: 'Titre', de: 'Titel', it: 'Titolo', pt: 'Título', pl: 'Tytuł' },
  titlePlaceholder: { en: 'e.g. Bright apartment in the city center', es: 'ej. Piso luminoso en el centro', fr: 'ex. Appartement lumineux en centre-ville', de: 'z.B. Helle Wohnung im Stadtzentrum', it: 'es. Luminoso appartamento in centro', pt: 'ex. Apartamento luminoso no centro', pl: 'np. Jasne mieszkanie w centrum' },
  description: { en: 'Description', es: 'Descripción', fr: 'Description', de: 'Beschreibung', it: 'Descrizione', pt: 'Descrição', pl: 'Opis' },
  price: { en: 'Price', es: 'Precio', fr: 'Prix', de: 'Preis', it: 'Prezzo', pt: 'Preço', pl: 'Cena' },
  priceSale: { en: 'Sale price', es: 'Precio de venta', fr: 'Prix de vente', de: 'Verkaufspreis', it: 'Prezzo di vendita', pt: 'Preço de venda', pl: 'Cena sprzedaży' },
  priceRent: { en: 'Monthly rent', es: 'Precio mensual', fr: 'Loyer mensuel', de: 'Monatsmiete', it: 'Affitto mensile', pt: 'Aluguel mensal', pl: 'Czynsz miesięczny' },
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
  condRenov: { en: 'Needs renovation', es: 'A reformar', fr: 'À rénover', de: 'Renovierungsbedürftig', it: 'Da ristrutturare', pt: 'Para renovar', pl: 'Do remontu' },
  condRenovated: { en: 'Renovated', es: 'Reformado', fr: 'Rénové', de: 'Renoviert', it: 'Ristrutturato', pt: 'Renovado', pl: 'Wyremontowany' },

  // Rent-specific
  rentalType: { en: 'Rental type', es: 'Tipo de alquiler', fr: 'Type de location', de: 'Mietart', it: 'Tipo di affitto', pt: 'Tipo de aluguel', pl: 'Typ wynajmu' },
  longTerm: { en: 'Long term', es: 'Larga temporada', fr: 'Longue durée', de: 'Langzeitmiete', it: 'Lungo termine', pt: 'Longa duração', pl: 'Długoterminowy' },
  shortTerm: { en: 'Short term', es: 'Temporal', fr: 'Courte durée', de: 'Kurzzeitmiete', it: 'Breve termine', pt: 'Curta duração', pl: 'Krótkoterminowy' },
  availabilityDate: { en: 'Availability date', es: 'Fecha de disponibilidad', fr: 'Date de disponibilité', de: 'Verfügbarkeitsdatum', it: 'Data di disponibilità', pt: 'Data de disponibilidade', pl: 'Data dostępności' },
  furnished: { en: 'Furnished', es: 'Amueblado', fr: 'Meublé', de: 'Möbliert', it: 'Arredato', pt: 'Mobilado', pl: 'Umeblowane' },
  furnishedYes: { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', pt: 'Sim', pl: 'Tak' },
  furnishedNo: { en: 'No', es: 'No', fr: 'Non', de: 'Nein', it: 'No', pt: 'Não', pl: 'Nie' },
  furnishedSemi: { en: 'Semi-furnished', es: 'Semi-amueblado', fr: 'Semi-meublé', de: 'Teilmöbliert', it: 'Semi-arredato', pt: 'Semi-mobilado', pl: 'Częściowo umeblowane' },
  expensesIncluded: { en: 'Expenses included', es: 'Gastos incluidos', fr: 'Charges incluses', de: 'Nebenkosten inklusive', it: 'Spese incluse', pt: 'Despesas incluídas', pl: 'Opłaty wliczone' },
  expensesYes: { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', pt: 'Sim', pl: 'Tak' },
  expensesNo: { en: 'No', es: 'No', fr: 'Non', de: 'Nein', it: 'No', pt: 'Não', pl: 'Nie' },
  expensesPartial: { en: 'Partial', es: 'Parcial', fr: 'Partiel', de: 'Teilweise', it: 'Parziale', pt: 'Parcial', pl: 'Częściowo' },

  // Apartment-specific
  floor: { en: 'Floor', es: 'Planta', fr: 'Étage', de: 'Stockwerk', it: 'Piano', pt: 'Andar', pl: 'Piętro' },
  orientation: { en: 'Orientation', es: 'Orientación', fr: 'Orientation', de: 'Ausrichtung', it: 'Orientamento', pt: 'Orientação', pl: 'Orientacja' },
  exterior: { en: 'Exterior', es: 'Exterior', fr: 'Extérieur', de: 'Außen', it: 'Esterno', pt: 'Exterior', pl: 'Zewnętrzne' },
  interior: { en: 'Interior', es: 'Interior', fr: 'Intérieur', de: 'Innen', it: 'Interno', pt: 'Interior', pl: 'Wewnętrzne' },
  mixed: { en: 'Mixed', es: 'Mixto', fr: 'Mixte', de: 'Gemischt', it: 'Misto', pt: 'Misto', pl: 'Mieszane' },
  terrace: { en: 'Terrace / Balcony', es: 'Terraza / Balcón', fr: 'Terrasse / Balcon', de: 'Terrasse / Balkon', it: 'Terrazza / Balcone', pt: 'Terraço / Varanda', pl: 'Taras / Balkon' },
  parkingType: { en: 'Parking', es: 'Aparcamiento', fr: 'Parking', de: 'Parkplatz', it: 'Parcheggio', pt: 'Estacionamento', pl: 'Parking' },
  parkingNo: { en: 'No', es: 'No', fr: 'Non', de: 'Nein', it: 'No', pt: 'Não', pl: 'Nie' },
  parkingIncluded: { en: 'Yes, included', es: 'Sí, incluido', fr: 'Oui, inclus', de: 'Ja, inklusive', it: 'Sì, incluso', pt: 'Sim, incluído', pl: 'Tak, w cenie' },
  parkingOptional: { en: 'Yes, optional (extra cost)', es: 'Sí, opcional (coste adicional)', fr: 'Oui, en option (coût supplémentaire)', de: 'Ja, optional (Aufpreis)', it: 'Sì, opzionale (costo extra)', pt: 'Sim, opcional (custo extra)', pl: 'Tak, opcjonalnie (dodatkowy koszt)' },

  // Villa/House-specific
  pool: { en: 'Swimming pool', es: 'Piscina', fr: 'Piscine', de: 'Schwimmbad', it: 'Piscina', pt: 'Piscina', pl: 'Basen' },

  // Land-specific
  landType: { en: 'Land type', es: 'Tipo de suelo', fr: 'Type de terrain', de: 'Bodenart', it: 'Tipo di terreno', pt: 'Tipo de solo', pl: 'Typ gruntu' },
  landUrban: { en: 'Urban', es: 'Urbano', fr: 'Urbain', de: 'Städtisch', it: 'Urbano', pt: 'Urbano', pl: 'Miejski' },
  landDevelopable: { en: 'Developable', es: 'Urbanizable', fr: 'Constructible', de: 'Bebaubar', it: 'Edificabile', pt: 'Urbanizável', pl: 'Pod zabudowę' },
  landRustic: { en: 'Rustic', es: 'Rústico', fr: 'Rustique', de: 'Ländlich', it: 'Rustico', pt: 'Rústico', pl: 'Wiejski' },
  buildability: { en: 'Buildability (m² or coeff.)', es: 'Edificabilidad (m² techo o coef.)', fr: 'Constructibilité (m² ou coeff.)', de: 'Bebaubarkeit (m² oder Koeff.)', it: 'Edificabilità (m² o coeff.)', pt: 'Edificabilidade (m² ou coef.)', pl: 'Zabudowa (m² lub wsp.)' },
  permittedUse: { en: 'Permitted use', es: 'Uso principal permitido', fr: 'Usage autorisé', de: 'Zulässige Nutzung', it: 'Uso consentito', pt: 'Uso permitido', pl: 'Dozwolone użytkowanie' },
  useResidential: { en: 'Residential', es: 'Residencial', fr: 'Résidentiel', de: 'Wohnen', it: 'Residenziale', pt: 'Residencial', pl: 'Mieszkalny' },
  useTertiary: { en: 'Tertiary / Services', es: 'Terciario', fr: 'Tertiaire', de: 'Dienstleistung', it: 'Terziario', pt: 'Terciário', pl: 'Usługowy' },
  useIndustrial: { en: 'Industrial', es: 'Industrial', fr: 'Industriel', de: 'Industrie', it: 'Industriale', pt: 'Industrial', pl: 'Przemysłowy' },
  useOther: { en: 'Other', es: 'Otro', fr: 'Autre', de: 'Sonstiges', it: 'Altro', pt: 'Outro', pl: 'Inne' },
  roadAccess: { en: 'Road access', es: '¿Tiene acceso rodado?', fr: 'Accès routier', de: 'Straßenzugang', it: 'Accesso stradale', pt: 'Acesso rodoviário', pl: 'Dojazd' },
  utilities: { en: 'Utilities at plot', es: '¿Suministros a pie de parcela?', fr: 'Raccordements', de: 'Versorgungsanschlüsse', it: 'Allacciamenti', pt: 'Utilidades', pl: 'Media' },
  utilWater: { en: 'Water', es: 'Agua', fr: 'Eau', de: 'Wasser', it: 'Acqua', pt: 'Água', pl: 'Woda' },
  utilElectricity: { en: 'Electricity', es: 'Luz', fr: 'Électricité', de: 'Strom', it: 'Elettricità', pt: 'Eletricidade', pl: 'Prąd' },
  utilSewage: { en: 'Sewage', es: 'Saneamiento', fr: 'Assainissement', de: 'Kanalisation', it: 'Fognatura', pt: 'Esgoto', pl: 'Kanalizacja' },
  utilGas: { en: 'Gas', es: 'Gas', fr: 'Gaz', de: 'Gas', it: 'Gas', pt: 'Gás', pl: 'Gaz' },
  utilNone: { en: 'None', es: 'Ninguno', fr: 'Aucun', de: 'Keine', it: 'Nessuno', pt: 'Nenhum', pl: 'Brak' },
  utilUnknown: { en: "Don't know", es: 'No sé', fr: 'Je ne sais pas', de: 'Weiß nicht', it: 'Non so', pt: 'Não sei', pl: 'Nie wiem' },

  // Garage-specific
  garageType: { en: 'Type', es: 'Tipo', fr: 'Type', de: 'Typ', it: 'Tipo', pt: 'Tipo', pl: 'Typ' },
  garageCar: { en: 'Car', es: 'Coche', fr: 'Voiture', de: 'Auto', it: 'Auto', pt: 'Carro', pl: 'Samochód' },
  garageMoto: { en: 'Motorcycle', es: 'Moto', fr: 'Moto', de: 'Motorrad', it: 'Moto', pt: 'Moto', pl: 'Motor' },
  garageBox: { en: 'Enclosed box', es: 'Box / Cerrada', fr: 'Box fermé', de: 'Geschlossene Box', it: 'Box chiuso', pt: 'Box fechado', pl: 'Boks zamknięty' },
  garageLocation: { en: 'Location', es: 'Ubicación', fr: 'Emplacement', de: 'Lage', it: 'Posizione', pt: 'Localização', pl: 'Lokalizacja' },
  garageInterior: { en: 'Interior', es: 'Interior', fr: 'Intérieur', de: 'Innen', it: 'Interno', pt: 'Interior', pl: 'Wewnętrzny' },
  garageExterior: { en: 'Exterior', es: 'Exterior', fr: 'Extérieur', de: 'Außen', it: 'Esterno', pt: 'Exterior', pl: 'Zewnętrzny' },
  garageUnderground: { en: 'Underground', es: 'Subterráneo', fr: 'Souterrain', de: 'Unterirdisch', it: 'Sotterraneo', pt: 'Subterrâneo', pl: 'Podziemny' },
  garageAccess: { en: 'Access', es: 'Acceso', fr: 'Accès', de: 'Zugang', it: 'Accesso', pt: 'Acesso', pl: 'Dostęp' },
  garageRamp: { en: 'Ramp', es: 'Rampa', fr: 'Rampe', de: 'Rampe', it: 'Rampa', pt: 'Rampa', pl: 'Rampa' },
  garageElevator: { en: 'Elevator / Platform', es: 'Elevador / Plataforma', fr: 'Ascenseur / Plateforme', de: 'Aufzug / Plattform', it: 'Ascensore / Piattaforma', pt: 'Elevador / Plataforma', pl: 'Winda / Platforma' },
  garageAccessOther: { en: 'Other', es: 'Otro', fr: 'Autre', de: 'Sonstiges', it: 'Altro', pt: 'Outro', pl: 'Inne' },
  largeCar: { en: 'Fits a large car?', es: '¿Cabe coche grande?', fr: 'Convient à une grande voiture ?', de: 'Passt ein großes Auto?', it: 'Adatta ad auto grande?', pt: 'Cabe carro grande?', pl: 'Mieści duże auto?' },
  evCharging: { en: 'EV charging point', es: 'Punto de carga EV', fr: 'Borne de recharge', de: 'EV-Ladestation', it: 'Punto ricarica EV', pt: 'Ponto de carregamento EV', pl: 'Ładowanie EV' },
  evYes: { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', pt: 'Sim', pl: 'Tak' },
  evPreinstall: { en: 'Pre-installation', es: 'Preinstalación', fr: 'Pré-installation', de: 'Vorinstallation', it: 'Pre-installazione', pt: 'Pré-instalação', pl: 'Pre-instalacja' },
  evNo: { en: 'No', es: 'No', fr: 'Non', de: 'Nein', it: 'No', pt: 'Não', pl: 'Nie' },
  evUnknown: { en: "Don't know", es: 'No sé', fr: 'Je ne sais pas', de: 'Weiß nicht', it: 'Non so', pt: 'Não sei', pl: 'Nie wiem' },

  // Office-specific
  numOffices: { en: 'Number of offices / rooms', es: 'Nº de despachos / salas', fr: "Nombre de bureaux", de: 'Anzahl Büros / Räume', it: 'Numero di uffici / sale', pt: 'Nº de escritórios', pl: 'Liczba biur / pomieszczeń' },
  airConditioning: { en: 'Air conditioning', es: 'Climatización', fr: 'Climatisation', de: 'Klimaanlage', it: 'Climatizzazione', pt: 'Ar condicionado', pl: 'Klimatyzacja' },

  // Commercial-specific
  streetLevel: { en: 'Street level', es: 'A pie de calle', fr: 'Pied de rue', de: 'Straßenebene', it: 'A livello strada', pt: 'Ao nível da rua', pl: 'Parter' },
  smokeOutlet: { en: 'Smoke outlet', es: 'Salida de humos', fr: 'Sortie de fumée', de: 'Rauchabzug', it: 'Uscita fumi', pt: 'Saída de fumos', pl: 'Wyciąg dymu' },
  facadeMeters: { en: 'Facade / shopfront (m)', es: 'Metros de fachada', fr: 'Façade / vitrine (m)', de: 'Fassade (m)', it: 'Facciata / vetrina (m)', pt: 'Fachada (m)', pl: 'Fasada (m)' },
  hasTransfer: { en: 'Business transfer (traspaso)', es: '¿Hay traspaso?', fr: 'Cession de commerce ?', de: 'Geschäftsübernahme?', it: 'Cessione attività?', pt: 'Trespasse?', pl: 'Cesja?' },
  transferAmount: { en: 'Transfer amount (€)', es: 'Importe del traspaso (€)', fr: 'Montant de cession (€)', de: 'Übernahmebetrag (€)', it: 'Importo cessione (€)', pt: 'Valor do trespasse (€)', pl: 'Kwota cesji (€)' },

  // Warehouse-specific
  warehouseArea: { en: 'Warehouse area (m²)', es: 'Superficie nave (m²)', fr: 'Surface entrepôt (m²)', de: 'Lagerfläche (m²)', it: 'Superficie capannone (m²)', pt: 'Área do armazém (m²)', pl: 'Pow. magazynu (m²)' },
  yardArea: { en: 'Yard / outdoor area (m²)', es: 'Superficie patio / campa (m²)', fr: 'Surface extérieure (m²)', de: 'Hoffläche (m²)', it: 'Superficie cortile (m²)', pt: 'Área exterior (m²)', pl: 'Pow. podwórza (m²)' },
  freeHeight: { en: 'Free height (m)', es: 'Altura libre (m)', fr: 'Hauteur libre (m)', de: 'Freie Höhe (m)', it: 'Altezza libera (m)', pt: 'Altura livre (m)', pl: 'Wysokość (m)' },
  trailerAccess: { en: 'Trailer access', es: 'Acceso tráiler', fr: 'Accès poids lourd', de: 'LKW-Zufahrt', it: 'Accesso TIR', pt: 'Acesso camião', pl: 'Dojazd naczepą' },
  electricalPower: { en: 'Electrical power (kW)', es: 'Potencia eléctrica (kW)', fr: 'Puissance électrique (kW)', de: 'Elektrische Leistung (kW)', it: 'Potenza elettrica (kW)', pt: 'Potência elétrica (kW)', pl: 'Moc elektryczna (kW)' },

  // Yes / No / Don't know
  yes: { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', pt: 'Sim', pl: 'Tak' },
  no: { en: 'No', es: 'No', fr: 'Non', de: 'Nein', it: 'No', pt: 'Não', pl: 'Nie' },
  dontKnow: { en: "Don't know", es: 'No sé', fr: 'Je ne sais pas', de: 'Weiß nicht', it: 'Non so', pt: 'Não sei', pl: 'Nie wiem' },

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
  showContactForm: { en: 'Show contact form on listing', es: 'Mostrar formulario de contacto', fr: 'Afficher le formulaire de contact', de: 'Kontaktformular anzeigen', it: 'Mostra modulo di contatto', pt: 'Mostrar formulário de contato', pl: 'Pokaż formularz kontaktowy' },
  sameAsPhone: { en: 'Same as phone', es: 'Igual que teléfono', fr: 'Identique au téléphone', de: 'Wie Telefon', it: 'Uguale al telefono', pt: 'Igual ao telefone', pl: 'Taki sam jak telefon' },
  whatsappNumber: { en: 'WhatsApp number', es: 'Número de WhatsApp', fr: 'Numéro WhatsApp', de: 'WhatsApp-Nummer', it: 'Numero WhatsApp', pt: 'Número WhatsApp', pl: 'Numer WhatsApp' },
  atLeastOneContact: { en: 'At least one contact method is required (phone, email, WhatsApp, or contact form)', es: 'Se requiere al menos un método de contacto (teléfono, email, WhatsApp o formulario)', fr: 'Au moins un moyen de contact est requis (téléphone, email, WhatsApp ou formulaire)', de: 'Mindestens eine Kontaktmethode erforderlich (Telefon, E-Mail, WhatsApp oder Formular)', it: 'È richiesto almeno un metodo di contatto (telefono, email, WhatsApp o modulo)', pt: 'É necessário pelo menos um método de contato (telefone, email, WhatsApp ou formulário)', pl: 'Wymagana co najmniej jedna metoda kontaktu (telefon, email, WhatsApp lub formularz)' },
  phoneRequiredForOption: { en: 'Phone number is required when this option is enabled', es: 'El teléfono es obligatorio cuando esta opción está activada', fr: 'Le téléphone est requis lorsque cette option est activée', de: 'Telefonnummer erforderlich wenn diese Option aktiviert ist', it: 'Il telefono è obbligatorio quando questa opzione è attiva', pt: 'O telefone é obrigatório quando esta opção está ativada', pl: 'Telefon jest wymagany gdy ta opcja jest włączona' },
  emailRequiredForOption: { en: 'Email is required when this option is enabled', es: 'El email es obligatorio cuando esta opción está activada', fr: "L'email est requis lorsque cette option est activée", de: 'E-Mail erforderlich wenn diese Option aktiviert ist', it: "L'email è obbligatoria quando questa opzione è attiva", pt: 'O email é obrigatório quando esta opção está ativada', pl: 'Email jest wymagany gdy ta opcja jest włączona' },
  review: { en: 'Review your listing', es: 'Revisa tu anuncio', fr: 'Vérifiez votre annonce', de: 'Überprüfen Sie Ihr Inserat', it: 'Rivedi il tuo annuncio', pt: 'Revise seu anúncio', pl: 'Przejrzyj ogłoszenie' },

  // Validation
  required: { en: 'Required', es: 'Obligatorio', fr: 'Requis', de: 'Erforderlich', it: 'Obbligatorio', pt: 'Obrigatório', pl: 'Wymagane' },
  operationRequired: { en: 'Select sale or rent', es: 'Selecciona venta o alquiler', fr: 'Sélectionnez vente ou location', de: 'Verkauf oder Miete wählen', it: 'Seleziona vendita o affitto', pt: 'Selecione venda ou aluguel', pl: 'Wybierz sprzedaż lub wynajem' },
  typeRequired: { en: 'Select a property type', es: 'Selecciona un tipo de propiedad', fr: 'Sélectionnez un type de bien', de: 'Wählen Sie eine Immobilienart', it: 'Seleziona un tipo di proprietà', pt: 'Selecione um tipo de imóvel', pl: 'Wybierz typ nieruchomości' },
  missingRequired: { en: 'Please fill in all required fields', es: 'Por favor, completa todos los campos obligatorios', fr: 'Veuillez remplir tous les champs obligatoires', de: 'Bitte füllen Sie alle Pflichtfelder aus', it: 'Compila tutti i campi obbligatori', pt: 'Preencha todos os campos obrigatórios', pl: 'Wypełnij wszystkie wymagane pola' },

  // Section headers
  sectionRentalDetails: { en: 'Rental details', es: 'Detalles del alquiler', fr: 'Détails de la location', de: 'Mietdetails', it: 'Dettagli affitto', pt: 'Detalhes do aluguel', pl: 'Szczegóły wynajmu' },
  sectionPrice: { en: 'Price', es: 'Precio', fr: 'Prix', de: 'Preis', it: 'Prezzo', pt: 'Preço', pl: 'Cena' },
  sectionCharacteristics: { en: 'Characteristics', es: 'Características', fr: 'Caractéristiques', de: 'Eigenschaften', it: 'Caratteristiche', pt: 'Características', pl: 'Cechy' },
};

export const useWizardLabels = () => {
  const { language } = useLanguage();
  return (key: string) => wizardLabels[key]?.[language] || wizardLabels[key]?.en || key;
};

export default wizardLabels;
