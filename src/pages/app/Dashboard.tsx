import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, AlertTriangle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats, useDashboardScans } from '@/hooks/useListings';

const labels: Record<string, Record<string, string>> = {
  welcome: { en: 'Welcome back', es: 'Bienvenido de nuevo', fr: 'Bon retour', de: 'Willkommen zurück', it: 'Bentornato', pt: 'Bem-vindo de volta', pl: 'Witaj ponownie' },
  create: { en: 'Create new listing', es: 'Crear nuevo anuncio', fr: 'Créer une annonce', de: 'Neues Inserat erstellen', it: 'Crea nuovo annuncio', pt: 'Criar novo anúncio', pl: 'Utwórz ogłoszenie' },
  createDesc: { en: 'Start a new property listing with QR code and poster', es: 'Crea un nuevo anuncio con código QR y cartel', fr: 'Créez une nouvelle annonce avec QR et affiche', de: 'Erstellen Sie ein neues Inserat mit QR-Code und Plakat', it: 'Crea un nuovo annuncio con QR e poster', pt: 'Crie um novo anúncio com QR e cartaz', pl: 'Utwórz nowe ogłoszenie z kodem QR i plakatem' },
  active: { en: 'Active listings', es: 'Anuncios activos', fr: 'Annonces actives', de: 'Aktive Inserate', it: 'Annunci attivi', pt: 'Anúncios ativos', pl: 'Aktywne ogłoszenia' },
  expiring: { en: 'Expiring soon', es: 'Por expirar', fr: 'Expirent bientôt', de: 'Läuft bald ab', it: 'In scadenza', pt: 'Expirando em breve', pl: 'Wygasające wkrótce' },
  totalScans: { en: 'Total visits', es: 'Visitas totales', fr: 'Visites totales', de: 'Besuche gesamt', it: 'Visite totali', pt: 'Visitas totais', pl: 'Wizyty łącznie' },
  day: { en: 'Daily', es: 'Diario', fr: 'Jour', de: 'Täglich', it: 'Giornaliero', pt: 'Diário', pl: 'Dziennie' },
  week: { en: 'Weekly', es: 'Semanal', fr: 'Semaine', de: 'Wöchentlich', it: 'Settimanale', pt: 'Semanal', pl: 'Tygodniowo' },
  month: { en: 'Monthly', es: 'Mensual', fr: 'Mois', de: 'Monatlich', it: 'Mensile', pt: 'Mensal', pl: 'Miesięcznie' },
  last7: { en: 'Last 7 days', es: 'Últimos 7 días', fr: '7 derniers jours', de: 'Letzte 7 Tage', it: 'Ultimi 7 giorni', pt: 'Últimos 7 dias', pl: 'Ostatnie 7 dni' },
  last30: { en: 'Last 30 days', es: 'Últimos 30 días', fr: '30 derniers jours', de: 'Letzte 30 Tage', it: 'Ultimi 30 giorni', pt: 'Últimos 30 dias', pl: 'Ostatnie 30 dni' },
  last90: { en: 'Last 90 days', es: 'Últimos 90 días', fr: '90 derniers jours', de: 'Letzte 90 Tage', it: 'Ultimi 90 giorni', pt: 'Últimos 90 dias', pl: 'Ostatnie 90 dni' },
  last365: { en: 'Last year', es: 'Último año', fr: 'Dernière année', de: 'Letztes Jahr', it: 'Ultimo anno', pt: 'Último ano', pl: 'Ostatni rok' },
  noData: { en: 'No visits yet', es: 'Sin visitas aún', fr: 'Pas de visites', de: 'Noch keine Besuche', it: 'Nessuna visita', pt: 'Sem visitas', pl: 'Brak wizyt' },
};

type ScanRow = { occurred_at: string | null; listing_id: string | null };

function aggregateScans(scans: ScanRow[], granularity: 'day' | 'week' | 'month') {
  const map = new Map<string, number>();
  for (const s of scans) {
    if (!s.occurred_at) continue;
    const d = new Date(s.occurred_at);
    let key: string;
    if (granularity === 'day') {
      key = d.toISOString().slice(0, 10);
    } else if (granularity === 'week') {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      key = monday.toISOString().slice(0, 10);
    } else {
      key = d.toISOString().slice(0, 7);
    }
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

const Dashboard = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [range, setRange] = useState('30');

  const { data: stats } = useDashboardStats();
  const { data: scans } = useDashboardScans(Number(range));

  const chartData = useMemo(() => aggregateScans(scans || [], granularity), [scans, granularity]);
  const totalScans = scans?.length || 0;

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

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">{t('active')}</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">{stats?.activeCount ?? 0}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <span className="text-sm text-muted-foreground">{t('expiring')}</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">{stats?.expiringCount ?? 0}</p>
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{t('totalScans')}</span>
            <span className="text-2xl font-bold text-foreground">{totalScans}</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('last7')}</SelectItem>
                <SelectItem value="30">{t('last30')}</SelectItem>
                <SelectItem value="90">{t('last90')}</SelectItem>
                <SelectItem value="365">{t('last365')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={granularity} onValueChange={(v) => setGranularity(v as any)}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t('day')}</SelectItem>
                <SelectItem value="week">{t('week')}</SelectItem>
                <SelectItem value="month">{t('month')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            {t('noData')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
