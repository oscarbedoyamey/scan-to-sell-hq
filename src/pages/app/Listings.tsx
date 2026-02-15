import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Pencil, Home, MapPin, QrCode } from 'lucide-react';
import { useUserListings } from '@/hooks/useListings';

const labels: Record<string, Record<string, string>> = {
  title: { en: 'My Listings', es: 'Mis anuncios', fr: 'Mes annonces', de: 'Meine Inserate', it: 'I miei annunci', pt: 'Meus anúncios', pl: 'Moje ogłoszenia' },
  empty: { en: 'No listings yet', es: 'Aún no tienes anuncios', fr: 'Aucune annonce', de: 'Noch keine Inserate', it: 'Nessun annuncio', pt: 'Nenhum anúncio', pl: 'Brak ogłoszeń' },
  emptyDesc: { en: 'Create your first property listing to get started.', es: 'Crea tu primer anuncio para empezar.', fr: 'Créez votre première annonce pour commencer.', de: 'Erstellen Sie Ihr erstes Inserat.', it: 'Crea il tuo primo annuncio.', pt: 'Crie seu primeiro anúncio.', pl: 'Utwórz swoje pierwsze ogłoszenie.' },
  create: { en: 'Create listing', es: 'Crear anuncio', fr: 'Créer une annonce', de: 'Inserat erstellen', it: 'Crea annuncio', pt: 'Criar anúncio', pl: 'Utwórz ogłoszenie' },
  draft: { en: 'Draft', es: 'Borrador', fr: 'Brouillon', de: 'Entwurf', it: 'Bozza', pt: 'Rascunho', pl: 'Szkic' },
  active: { en: 'Active', es: 'Activo', fr: 'Actif', de: 'Aktiv', it: 'Attivo', pt: 'Ativo', pl: 'Aktywne' },
  paused: { en: 'Paused', es: 'Pausado', fr: 'En pause', de: 'Pausiert', it: 'In pausa', pt: 'Pausado', pl: 'Wstrzymane' },
  expired: { en: 'Expired', es: 'Expirado', fr: 'Expiré', de: 'Abgelaufen', it: 'Scaduto', pt: 'Expirado', pl: 'Wygasłe' },
  resume: { en: 'Resume', es: 'Continuar', fr: 'Reprendre', de: 'Fortsetzen', it: 'Riprendi', pt: 'Retomar', pl: 'Wznów' },
  edit: { en: 'Edit', es: 'Editar', fr: 'Modifier', de: 'Bearbeiten', it: 'Modifica', pt: 'Editar', pl: 'Edytuj' },
  signs: { en: 'Signs', es: 'Carteles', fr: 'Affiches', de: 'Plakate', it: 'Cartelli', pt: 'Cartazes', pl: 'Plakaty' },
};

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  active: 'default',
  paused: 'outline',
  expired: 'destructive',
};

const Listings = () => {
  const { language } = useLanguage();
  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  const { data: listings = [], isLoading: loading } = useUserListings();

  const currencySymbol: Record<string, string> = { EUR: '€', GBP: '£', CHF: 'CHF', PLN: 'zł', CZK: 'Kč' };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">{t('title')}</h1>
        <Button asChild variant="hero">
          <Link to="/app/listings/new?new=1">
            <Plus className="h-4 w-4 mr-2" />
            {t('create')}
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">...</div>
      ) : listings.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground mb-2">{t('empty')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t('emptyDesc')}</p>
          <Button asChild variant="default">
            <Link to="/app/listings/new?new=1">{t('create')}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => {
            const price = l.operation_type === 'rent' ? l.price_rent : l.price_sale;
            const isDraft = l.status === 'draft';
            return (
              <Link
                key={l.id}
                to={isDraft ? `/app/listings/new?listing_id=${l.id}` : `/app/listings/${l.id}`}
                className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-primary/40 transition-colors"
              >
                {l.cover_image_url ? (
                  <img src={l.cover_image_url} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground truncate">{l.title || 'Sin título'}</span>
                    <Badge variant={statusVariant[l.status || 'draft'] || 'secondary'}>
                      {t(l.status || 'draft')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {l.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.city}</span>}
                    {price != null && (
                      <span>{currencySymbol[l.currency || 'EUR'] || '€'}{Number(price).toLocaleString()}</span>
                    )}
                    {(l.sign_count ?? 0) > 0 && (
                      <span className="flex items-center gap-1"><QrCode className="w-3 h-3" />{l.sign_count}</span>
                    )}
                  </div>
                </div>
                {isDraft ? (
                  <Button variant="outline" size="sm" className="flex-shrink-0" asChild>
                    <span><Pencil className="w-3 h-3 mr-1" />{t('resume')}</span>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-shrink-0" asChild>
                    <Link to={`/app/listings/new?listing_id=${l.id}`} onClick={(e) => e.stopPropagation()}>
                      <Pencil className="w-3 h-3 mr-1" />{t('edit')}
                    </Link>
                  </Button>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Listings;
