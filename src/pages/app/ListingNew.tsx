import { useLanguage } from '@/i18n/LanguageContext';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const labels: Record<string, Record<string, string>> = {
  title: { en: 'Create new listing', es: 'Crear nuevo anuncio', fr: 'Créer une annonce', de: 'Neues Inserat erstellen', it: 'Crea nuovo annuncio', pt: 'Criar novo anúncio', pl: 'Utwórz ogłoszenie' },
  comingSoon: { en: 'The listing wizard will be available in the next phase.', es: 'El asistente de creación estará disponible en la siguiente fase.', fr: 'L\'assistant de création sera disponible dans la prochaine phase.', de: 'Der Erstellungsassistent wird in der nächsten Phase verfügbar sein.', it: 'La procedura guidata sarà disponibile nella prossima fase.', pt: 'O assistente de criação estará disponível na próxima fase.', pl: 'Kreator ogłoszenia będzie dostępny w następnej fazie.' },
  selectedPlan: { en: 'Selected plan', es: 'Plan seleccionado', fr: 'Plan sélectionné', de: 'Ausgewählter Plan', it: 'Piano selezionato', pt: 'Plano selecionado', pl: 'Wybrany plan' },
  back: { en: 'Back to listings', es: 'Volver a anuncios', fr: 'Retour aux annonces', de: 'Zurück zu Inseraten', it: 'Torna agli annunci', pt: 'Voltar aos anúncios', pl: 'Wróć do ogłoszeń' },
};

const planNames: Record<string, string> = {
  plan_3m: '3 months — €49',
  plan_6m: '6 months — €64',
  plan_12m: '12 months — €94',
};

const ListingNew = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const selectedPackage = searchParams.get('package');
  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  return (
    <div className="max-w-3xl">
      <Link to="/app/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <h1 className="font-display text-2xl font-bold text-foreground mb-6">{t('title')}</h1>

      {selectedPackage && planNames[selectedPackage] && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">{t('selectedPlan')}</p>
          <p className="font-display font-bold text-foreground">{planNames[selectedPackage]}</p>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{t('comingSoon')}</p>
      </div>
    </div>
  );
};

export default ListingNew;
