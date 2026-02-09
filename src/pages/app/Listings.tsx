import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

const labels: Record<string, Record<string, string>> = {
  title: { en: 'My Listings', es: 'Mis anuncios', fr: 'Mes annonces', de: 'Meine Inserate', it: 'I miei annunci', pt: 'Meus anúncios', pl: 'Moje ogłoszenia' },
  empty: { en: 'No listings yet', es: 'Aún no tienes anuncios', fr: 'Aucune annonce', de: 'Noch keine Inserate', it: 'Nessun annuncio', pt: 'Nenhum anúncio', pl: 'Brak ogłoszeń' },
  emptyDesc: { en: 'Create your first property listing to get started.', es: 'Crea tu primer anuncio para empezar.', fr: 'Créez votre première annonce pour commencer.', de: 'Erstellen Sie Ihr erstes Inserat.', it: 'Crea il tuo primo annuncio.', pt: 'Crie seu primeiro anúncio.', pl: 'Utwórz swoje pierwsze ogłoszenie.' },
  create: { en: 'Create listing', es: 'Crear anuncio', fr: 'Créer une annonce', de: 'Inserat erstellen', it: 'Crea annuncio', pt: 'Criar anúncio', pl: 'Utwórz ogłoszenie' },
};

const Listings = () => {
  const { language } = useLanguage();
  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">{t('title')}</h1>
        <Button asChild variant="hero">
          <Link to="/app/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('create')}
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">{t('empty')}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t('emptyDesc')}</p>
        <Button asChild variant="default">
          <Link to="/app/listings/new">{t('create')}</Link>
        </Button>
      </div>
    </div>
  );
};

export default Listings;
