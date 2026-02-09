import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, FileText, AlertTriangle, BarChart3 } from 'lucide-react';

const labels: Record<string, Record<string, string>> = {
  welcome: { en: 'Welcome back', es: 'Bienvenido de nuevo', fr: 'Bon retour', de: 'Willkommen zurück', it: 'Bentornato', pt: 'Bem-vindo de volta', pl: 'Witaj ponownie' },
  create: { en: 'Create new listing', es: 'Crear nuevo anuncio', fr: 'Créer une annonce', de: 'Neues Inserat erstellen', it: 'Crea nuovo annuncio', pt: 'Criar novo anúncio', pl: 'Utwórz ogłoszenie' },
  createDesc: { en: 'Start a new property listing with QR code and poster', es: 'Crea un nuevo anuncio con código QR y cartel', fr: 'Créez une nouvelle annonce avec QR et affiche', de: 'Erstellen Sie ein neues Inserat mit QR-Code und Plakat', it: 'Crea un nuovo annuncio con QR e poster', pt: 'Crie um novo anúncio com QR e cartaz', pl: 'Utwórz nowe ogłoszenie z kodem QR i plakatem' },
  active: { en: 'Active listings', es: 'Anuncios activos', fr: 'Annonces actives', de: 'Aktive Inserate', it: 'Annunci attivi', pt: 'Anúncios ativos', pl: 'Aktywne ogłoszenia' },
  expiring: { en: 'Expiring soon', es: 'Por expirar', fr: 'Expirent bientôt', de: 'Läuft bald ab', it: 'In scadenza', pt: 'Expirando em breve', pl: 'Wygasające wkrótce' },
  analytics: { en: 'Total scans (30d)', es: 'Escaneos totales (30d)', fr: 'Scans totaux (30j)', de: 'Scans gesamt (30T)', it: 'Scansioni totali (30g)', pt: 'Scans totais (30d)', pl: 'Skany łącznie (30d)' },
};

const Dashboard = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  return (
    <div className="max-w-5xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          {t('welcome')}, {profile?.full_name || profile?.email?.split('@')[0] || ''}! 👋
        </h1>
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Create new */}
        <Link
          to="/app/listings/new"
          className="group col-span-1 sm:col-span-2 lg:col-span-2 bg-primary text-primary-foreground rounded-2xl p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{t('create')}</h3>
              <p className="text-primary-foreground/70 text-sm">{t('createDesc')}</p>
            </div>
          </div>
        </Link>

        {/* Active listings */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">{t('active')}</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">0</p>
        </div>

        {/* Expiring */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <span className="text-sm text-muted-foreground">{t('expiring')}</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">0</p>
        </div>
      </div>

      {/* Analytics placeholder */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">{t('analytics')}</span>
        </div>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          — No data yet —
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
