import type { Language } from './translations';

interface PageSEO {
  title: string;
  description: string;
}

type SEOTranslations = Record<Language, {
  home: PageSEO;
  auth: PageSEO;
  demo: PageSEO;
  terms: PageSEO;
  privacy: PageSEO;
  cookies: PageSEO;
  dashboard: PageSEO;
  listings: PageSEO;
  listingNew: PageSEO;
  signs: PageSEO;
  settings: PageSEO;
}>;

export const seoTranslations: SEOTranslations = {
  es: {
    home: {
      title: 'Zigno — Carteles inteligentes con QR para inmobiliarias',
      description: 'Convierte cada cartel de venta o alquiler en una máquina de captación de leads. QR dinámico + landing page profesional incluida. Pruébalo gratis.',
    },
    auth: { title: 'Zigno — Iniciar sesión', description: 'Accede a tu cuenta de Zigno para gestionar tus inmuebles y carteles QR.' },
    demo: { title: 'Zigno — Demo de cartel QR', description: 'Descubre cómo funciona un cartel inteligente Zigno con esta demostración interactiva.' },
    terms: { title: 'Zigno — Términos y condiciones', description: 'Consulta los términos y condiciones de uso de Zigno.' },
    privacy: { title: 'Zigno — Política de privacidad', description: 'Lee nuestra política de privacidad y protección de datos.' },
    cookies: { title: 'Zigno — Política de cookies', description: 'Información sobre el uso de cookies en Zigno.' },
    dashboard: { title: 'Zigno — Panel de control', description: 'Tu panel de control de Zigno. Gestiona tus inmuebles, carteles y leads.' },
    listings: { title: 'Zigno — Mis inmuebles', description: 'Gestiona todos tus inmuebles publicados en Zigno.' },
    listingNew: { title: 'Zigno — Nuevo inmueble', description: 'Crea un nuevo anuncio de inmueble en Zigno.' },
    signs: { title: 'Zigno — Mis carteles', description: 'Gestiona tus carteles QR inteligentes.' },
    settings: { title: 'Zigno — Ajustes', description: 'Configura tu cuenta de Zigno.' },
  },
  en: {
    home: {
      title: 'Zigno — Smart QR signs for real estate',
      description: 'Turn every For Sale or For Rent sign into a lead-generation machine. Dynamic QR + professional landing page included. Try it free.',
    },
    auth: { title: 'Zigno — Sign in', description: 'Access your Zigno account to manage your properties and QR signs.' },
    demo: { title: 'Zigno — QR sign demo', description: 'See how a Zigno smart sign works with this interactive demo.' },
    terms: { title: 'Zigno — Terms & conditions', description: 'Read the Zigno terms and conditions of use.' },
    privacy: { title: 'Zigno — Privacy policy', description: 'Read our privacy and data protection policy.' },
    cookies: { title: 'Zigno — Cookie policy', description: 'Information about cookie usage on Zigno.' },
    dashboard: { title: 'Zigno — Dashboard', description: 'Your Zigno dashboard. Manage properties, signs, and leads.' },
    listings: { title: 'Zigno — My listings', description: 'Manage all your property listings on Zigno.' },
    listingNew: { title: 'Zigno — New listing', description: 'Create a new property listing on Zigno.' },
    signs: { title: 'Zigno — My signs', description: 'Manage your smart QR signs.' },
    settings: { title: 'Zigno — Settings', description: 'Configure your Zigno account.' },
  },
  fr: {
    home: {
      title: 'Zigno — Panneaux QR intelligents pour l\'immobilier',
      description: 'Transformez chaque panneau de vente ou location en machine à leads. QR dynamique + page d\'annonce professionnelle incluse. Essayez gratuitement.',
    },
    auth: { title: 'Zigno — Connexion', description: 'Accédez à votre compte Zigno pour gérer vos biens et panneaux QR.' },
    demo: { title: 'Zigno — Démo panneau QR', description: 'Découvrez le fonctionnement d\'un panneau intelligent Zigno.' },
    terms: { title: 'Zigno — Conditions générales', description: 'Consultez les conditions générales d\'utilisation de Zigno.' },
    privacy: { title: 'Zigno — Politique de confidentialité', description: 'Lisez notre politique de confidentialité et de protection des données.' },
    cookies: { title: 'Zigno — Politique de cookies', description: 'Informations sur l\'utilisation des cookies sur Zigno.' },
    dashboard: { title: 'Zigno — Tableau de bord', description: 'Votre tableau de bord Zigno. Gérez vos biens, panneaux et prospects.' },
    listings: { title: 'Zigno — Mes biens', description: 'Gérez tous vos biens publiés sur Zigno.' },
    listingNew: { title: 'Zigno — Nouveau bien', description: 'Créez une nouvelle annonce immobilière sur Zigno.' },
    signs: { title: 'Zigno — Mes panneaux', description: 'Gérez vos panneaux QR intelligents.' },
    settings: { title: 'Zigno — Paramètres', description: 'Configurez votre compte Zigno.' },
  },
  de: {
    home: {
      title: 'Zigno — Intelligente QR-Schilder für Immobilien',
      description: 'Verwandeln Sie jedes Verkaufs- oder Mietschild in eine Lead-Maschine. Dynamischer QR + professionelle Landingpage inklusive. Kostenlos testen.',
    },
    auth: { title: 'Zigno — Anmelden', description: 'Melden Sie sich bei Ihrem Zigno-Konto an.' },
    demo: { title: 'Zigno — QR-Schild Demo', description: 'Sehen Sie, wie ein intelligentes Zigno-Schild funktioniert.' },
    terms: { title: 'Zigno — AGB', description: 'Lesen Sie die allgemeinen Geschäftsbedingungen von Zigno.' },
    privacy: { title: 'Zigno — Datenschutz', description: 'Lesen Sie unsere Datenschutzrichtlinie.' },
    cookies: { title: 'Zigno — Cookie-Richtlinie', description: 'Informationen zur Cookie-Nutzung auf Zigno.' },
    dashboard: { title: 'Zigno — Dashboard', description: 'Ihr Zigno-Dashboard. Verwalten Sie Immobilien, Schilder und Leads.' },
    listings: { title: 'Zigno — Meine Immobilien', description: 'Verwalten Sie alle Ihre Immobilienanzeigen auf Zigno.' },
    listingNew: { title: 'Zigno — Neue Immobilie', description: 'Erstellen Sie eine neue Immobilienanzeige auf Zigno.' },
    signs: { title: 'Zigno — Meine Schilder', description: 'Verwalten Sie Ihre intelligenten QR-Schilder.' },
    settings: { title: 'Zigno — Einstellungen', description: 'Konfigurieren Sie Ihr Zigno-Konto.' },
  },
  it: {
    home: {
      title: 'Zigno — Cartelli QR intelligenti per immobili',
      description: 'Trasforma ogni cartello di vendita o affitto in una macchina per generare contatti. QR dinamico + landing page professionale inclusa. Provalo gratis.',
    },
    auth: { title: 'Zigno — Accedi', description: 'Accedi al tuo account Zigno per gestire i tuoi immobili e cartelli QR.' },
    demo: { title: 'Zigno — Demo cartello QR', description: 'Scopri come funziona un cartello intelligente Zigno.' },
    terms: { title: 'Zigno — Termini e condizioni', description: 'Consulta i termini e le condizioni d\'uso di Zigno.' },
    privacy: { title: 'Zigno — Privacy', description: 'Leggi la nostra informativa sulla privacy.' },
    cookies: { title: 'Zigno — Cookie', description: 'Informazioni sull\'uso dei cookie su Zigno.' },
    dashboard: { title: 'Zigno — Pannello', description: 'Il tuo pannello Zigno. Gestisci immobili, cartelli e contatti.' },
    listings: { title: 'Zigno — I miei immobili', description: 'Gestisci tutti i tuoi annunci immobiliari su Zigno.' },
    listingNew: { title: 'Zigno — Nuovo immobile', description: 'Crea un nuovo annuncio immobiliare su Zigno.' },
    signs: { title: 'Zigno — I miei cartelli', description: 'Gestisci i tuoi cartelli QR intelligenti.' },
    settings: { title: 'Zigno — Impostazioni', description: 'Configura il tuo account Zigno.' },
  },
  pt: {
    home: {
      title: 'Zigno — Placas QR inteligentes para imóveis',
      description: 'Transforme cada placa de venda ou aluguel em uma máquina de captação de leads. QR dinâmico + landing page profissional incluída. Experimente grátis.',
    },
    auth: { title: 'Zigno — Entrar', description: 'Acesse sua conta Zigno para gerenciar seus imóveis e placas QR.' },
    demo: { title: 'Zigno — Demo placa QR', description: 'Veja como funciona uma placa inteligente Zigno.' },
    terms: { title: 'Zigno — Termos e condições', description: 'Consulte os termos e condições de uso do Zigno.' },
    privacy: { title: 'Zigno — Privacidade', description: 'Leia nossa política de privacidade e proteção de dados.' },
    cookies: { title: 'Zigno — Cookies', description: 'Informações sobre o uso de cookies no Zigno.' },
    dashboard: { title: 'Zigno — Painel', description: 'Seu painel Zigno. Gerencie imóveis, placas e leads.' },
    listings: { title: 'Zigno — Meus imóveis', description: 'Gerencie todos os seus anúncios de imóveis no Zigno.' },
    listingNew: { title: 'Zigno — Novo imóvel', description: 'Crie um novo anúncio de imóvel no Zigno.' },
    signs: { title: 'Zigno — Minhas placas', description: 'Gerencie suas placas QR inteligentes.' },
    settings: { title: 'Zigno — Configurações', description: 'Configure sua conta Zigno.' },
  },
  pl: {
    home: {
      title: 'Zigno — Inteligentne tabliczki QR dla nieruchomości',
      description: 'Zamień każdą tabliczkę sprzedaży lub wynajmu w maszynę do pozyskiwania leadów. Dynamiczny QR + profesjonalna strona oferty w zestawie. Wypróbuj za darmo.',
    },
    auth: { title: 'Zigno — Logowanie', description: 'Zaloguj się na swoje konto Zigno.' },
    demo: { title: 'Zigno — Demo tabliczki QR', description: 'Zobacz, jak działa inteligentna tabliczka Zigno.' },
    terms: { title: 'Zigno — Regulamin', description: 'Zapoznaj się z regulaminem Zigno.' },
    privacy: { title: 'Zigno — Prywatność', description: 'Przeczytaj naszą politykę prywatności.' },
    cookies: { title: 'Zigno — Cookies', description: 'Informacje o plikach cookie na Zigno.' },
    dashboard: { title: 'Zigno — Panel', description: 'Twój panel Zigno. Zarządzaj nieruchomościami, tabliczkami i leadami.' },
    listings: { title: 'Zigno — Moje oferty', description: 'Zarządzaj wszystkimi swoimi ofertami nieruchomości na Zigno.' },
    listingNew: { title: 'Zigno — Nowa oferta', description: 'Utwórz nową ofertę nieruchomości na Zigno.' },
    signs: { title: 'Zigno — Moje tabliczki', description: 'Zarządzaj swoimi inteligentnymi tabliczkami QR.' },
    settings: { title: 'Zigno — Ustawienia', description: 'Skonfiguruj swoje konto Zigno.' },
  },
};
