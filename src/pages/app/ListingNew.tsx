import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, QrCode, Signpost, Link2 } from 'lucide-react';
import { OnboardingOverlay } from '@/components/activation/OnboardingOverlay';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWizardLabels } from '@/components/wizard/wizardLabels';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { StepProperty } from '@/components/wizard/StepProperty';
import { StepMedia } from '@/components/wizard/StepMedia';
import { StepContact } from '@/components/wizard/StepContact';
import { useLanguage } from '@/i18n/LanguageContext';
import { SEO } from '@/components/SEO';
import { seoTranslations } from '@/i18n/seoTranslations';
import type { Tables } from '@/integrations/supabase/types';
import { useListingMutations } from '@/hooks/useListingMutations';

type Listing = Partial<Tables<'listings'>>;

const STEPS = ['step1', 'step2', 'step3'] as const;

const INITIAL_DATA: Listing = {
  operation_type: null,
  property_type: null,
  title: '',
  description: '',
  price_sale: null,
  price_rent: null,
  currency: 'EUR',
  bedrooms: null,
  bathrooms: null,
  built_area_m2: null,
  plot_area_m2: null,
  street: '',
  city: '',
  postal_code: '',
  region: '',
  country: '',
  condition: null,
  year_built: null,
  elevator: false,
  parking: false,
  cover_image_url: null,
  gallery_urls: [],
  video_url: null,
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  contact_whatsapp: '',
  agency_name: '',
  show_phone: false,
  show_email: true,
  show_whatsapp: false,
  lead_form_enabled: true,
};

const plans = [
  { id: '3m', months: 3, price: 49, popular: false },
  { id: '6m', months: 6, price: 64, popular: true },
  { id: '12m', months: 12, price: 94, popular: false },
];

const planLabels: Record<string, Record<string, string>> = {
  choosePlan: { en: 'Choose your plan', es: 'Elige tu plan', fr: 'Choisissez votre plan', de: 'Wählen Sie Ihren Plan', it: 'Scegli il tuo piano', pt: 'Escolha seu plano', pl: 'Wybierz plan' },
  choosePlanDesc: { en: 'Your listing is ready! Select a plan to activate it.', es: 'Tu anuncio está listo. Selecciona un plan para activarlo.', fr: 'Votre annonce est prête ! Sélectionnez un plan.', de: 'Ihr Inserat ist fertig! Wählen Sie einen Plan.', it: 'Il tuo annuncio è pronto! Seleziona un piano.', pt: 'Seu anúncio está pronto! Selecione um plano.', pl: 'Ogłoszenie jest gotowe! Wybierz plan.' },
  months: { en: 'months', es: 'meses', fr: 'mois', de: 'Monate', it: 'mesi', pt: 'meses', pl: 'miesięcy' },
  activate: { en: 'Activate & Pay', es: 'Activar y Pagar', fr: 'Activer & Payer', de: 'Aktivieren & Bezahlen', it: 'Attiva & Paga', pt: 'Ativar & Pagar', pl: 'Aktywuj & Zapłać' },
  bestValue: { en: 'Best value', es: 'Mejor precio', fr: 'Meilleur prix', de: 'Bester Preis', it: 'Miglior prezzo', pt: 'Melhor preço', pl: 'Najlepsza cena' },
  saveChanges: { en: 'Save changes', es: 'Guardar cambios', fr: 'Enregistrer', de: 'Speichern', it: 'Salva', pt: 'Salvar', pl: 'Zapisz' },
  changesSaved: { en: 'Changes saved successfully', es: 'Cambios guardados correctamente', fr: 'Modifications enregistrées', de: 'Änderungen gespeichert', it: 'Modifiche salvate', pt: 'Alterações salvas', pl: 'Zmiany zapisane' },
  howToPublish: { en: 'How do you want to publish?', es: '¿Cómo quieres publicar?', fr: 'Comment voulez-vous publier ?', de: 'Wie möchten Sie veröffentlichen?', it: 'Come vuoi pubblicare?', pt: 'Como deseja publicar?', pl: 'Jak chcesz opublikować?' },
  useAvailableSign: { en: 'Use an available sign', es: 'Usar cartel disponible', fr: 'Utiliser une affiche disponible', de: 'Verfügbares Plakat nutzen', it: 'Usa un cartello disponibile', pt: 'Usar cartaz disponível', pl: 'Użyj dostępnego plakatu' },
  useAvailableSignDesc: { en: 'Assign one of your existing signs to this listing', es: 'Asigna uno de tus carteles existentes a este anuncio', fr: 'Assignez une de vos affiches existantes', de: 'Weisen Sie eines Ihrer Plakate zu', it: 'Assegna uno dei tuoi cartelli esistenti', pt: 'Atribua um de seus cartazes existentes', pl: 'Przypisz jeden z istniejących plakatów' },
  buyNewSign: { en: 'Create a new sign', es: 'Crear cartel nuevo', fr: 'Créer une nouvelle affiche', de: 'Neues Plakat erstellen', it: 'Crea un nuovo cartello', pt: 'Criar novo cartaz', pl: 'Utwórz nowy plakat' },
  buyNewSignDesc: { en: 'Purchase a plan to get a new physical sign with QR code', es: 'Compra un plan para obtener un nuevo cartel físico con QR', fr: 'Achetez un plan pour obtenir une nouvelle affiche avec QR', de: 'Kaufen Sie einen Plan für ein neues Plakat mit QR', it: 'Acquista un piano per un nuovo cartello con QR', pt: 'Compre um plano para um novo cartaz com QR', pl: 'Kup plan, aby uzyskać nowy plakat z QR' },
  qrOnly: { en: 'QR-only (I\'ll use my own sign)', es: 'Solo QR (usaré mi propio cartel)', fr: 'QR uniquement (j\'utilise mon affiche)', de: 'Nur QR (ich nutze mein eigenes Plakat)', it: 'Solo QR (uso il mio cartello)', pt: 'Apenas QR (usarei meu próprio cartaz)', pl: 'Tylko QR (użyję własnego plakatu)' },
  qrOnlyDesc: { en: 'Get a QR code that points directly to your listing page', es: 'Obtén un código QR que apunta directamente a tu anuncio', fr: 'Obtenez un QR pointant vers votre annonce', de: 'QR-Code direkt zu Ihrer Inseratseite', it: 'Ottieni un QR che punta alla tua pagina annuncio', pt: 'Obtenha um QR que aponta para seu anúncio', pl: 'Uzyskaj kod QR prowadzący do strony ogłoszenia' },
  availableSignsCount: { en: 'available signs', es: 'carteles disponibles', fr: 'affiches disponibles', de: 'verfügbare Plakate', it: 'cartelli disponibili', pt: 'cartazes disponíveis', pl: 'dostępne plakaty' },
  selectSign: { en: 'Select a sign to assign', es: 'Selecciona un cartel', fr: 'Sélectionnez une affiche', de: 'Plakat auswählen', it: 'Seleziona un cartello', pt: 'Selecione um cartaz', pl: 'Wybierz plakat' },
  assignAndActivate: { en: 'Assign & Activate', es: 'Asignar y Activar', fr: 'Assigner & Activer', de: 'Zuweisen & Aktivieren', it: 'Assegna & Attiva', pt: 'Atribuir & Ativar', pl: 'Przypisz & Aktywuj' },
  activated: { en: 'Listing activated!', es: '¡Anuncio activado!', fr: 'Annonce activée !', de: 'Inserat aktiviert!', it: 'Annuncio attivato!', pt: 'Anúncio ativado!', pl: 'Ogłoszenie aktywowane!' },
};

const ListingNew = () => {
  const t = useWizardLabels();
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invalidateAll } = useListingMutations();
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get('listing_id');
  const isNew = searchParams.get('new') === '1';
  const hasOnboarding = searchParams.get('onboarding') === 'true';
  const isEdit = !!editId && !isNew;

  const [step, setStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(hasOnboarding);
  const [listingId, setListingId] = useState<string | null>(editId);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [showSignSelection, setShowSignSelection] = useState(false);
  const [publishMode, setPublishMode] = useState<'assign' | 'new' | 'qr-only' | null>(null);
  const [availableSigns, setAvailableSigns] = useState<any[]>([]);
  const [selectedSignId, setSelectedSignId] = useState<string | null>(null);
  const [assigningSign, setAssigningSign] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew && !!editId);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLoad = useRef(false);

  const tp = (key: string) => planLabels[key]?.[language] || planLabels[key]?.en || key;

  const [data, setData] = useState<Listing>({
    ...INITIAL_DATA,
    contact_name: profile?.full_name || '',
    contact_phone: profile?.phone || '',
    contact_email: profile?.email || '',
  });

  // Load existing draft for resume
  useEffect(() => {
    if (didLoad.current || !user || isNew) return;
    didLoad.current = true;
    setLoading(true);

    const loadDraft = async () => {
      try {
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));

        let query;
        if (editId) {
          query = (supabase as any)
            .from('listings')
            .select('*')
            .eq('id', editId)
            .eq('owner_user_id', user.id)
            .single();
        } else {
          query = (supabase as any)
            .from('listings')
            .select('*')
            .eq('owner_user_id', user.id)
            .eq('status', 'draft')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        }

        const existing = await Promise.race([query.then((r: any) => r.data), timeout]);
        if (existing) {
          setListingId(existing.id);
          setOriginalStatus(existing.status);
          const { id, created_at, updated_at, owner_user_id, status, ...rest } = existing;
          setData((prev) => ({ ...prev, ...rest }));

          // When editing an existing active/paused/expired listing, always start at step 0
          if (isEdit) {
            setStep(0);
          } else if (existing.cover_image_url || (existing.gallery_urls as any[])?.length > 0 || existing.video_url) {
            setStep(2);
          } else if (existing.title && existing.operation_type && existing.property_type) {
            setStep(1);
          }
        }
      } catch (err) {
        console.error('Load draft error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [user, editId]);

  const stepLabels = STEPS.map((s) => t(s));

  const autoSave = useCallback(
    async (current: Listing, id: string | null) => {
      if (!user) return id;
      setSaving(true);
      try {
        const statusToSave = originalStatus && originalStatus !== 'draft' ? originalStatus : 'draft';
        const payload: any = { ...current, owner_user_id: user.id, status: statusToSave };
        delete payload.id;
        delete payload.created_at;
        delete payload.updated_at;

        if (id) {
          await (supabase as any).from('listings').update(payload).eq('id', id);
          return id;
        } else {
          const { data: inserted, error } = await (supabase as any)
            .from('listings')
            .insert(payload)
            .select('id')
            .single();
          if (error) throw error;
          setListingId(inserted.id);
          return inserted.id;
        }
      } catch (err: any) {
        console.error('Auto-save error:', err);
        return id;
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  const handleChange = useCallback(
    (patch: Listing) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => autoSave(next, listingId), 1200);
        return next;
      });
    },
    [autoSave, listingId]
  );

  const canAdvance = () => {
    if (step === 0) {
      return !!data.operation_type && !!data.property_type && !!data.title?.trim();
    }
    if (step === 2) {
      const showPhone = data.show_phone ?? false;
      const showEmail = data.show_email ?? true;
      const showWhatsapp = data.show_whatsapp ?? false;
      const showForm = data.lead_form_enabled ?? true;
      const hasAtLeastOne = showPhone || showEmail || showWhatsapp || showForm;
      if (!hasAtLeastOne) return false;
      if ((showPhone || showWhatsapp) && !data.contact_phone?.trim()) return false;
      if (showEmail && !data.contact_email?.trim()) return false;
      if (!data.contact_name?.trim()) return false;
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    // Fire save in background — don't block step advancement to prevent hanging
    autoSave(data, listingId);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    if (showPlanSelection) {
      setShowPlanSelection(false);
      setPublishMode(null);
      return;
    }
    if (showSignSelection) {
      setShowSignSelection(false);
      setPublishMode(null);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const handlePublish = async () => {
    if (!canAdvance()) {
      toast({ title: t('required'), description: t('atLeastOneContact'), variant: 'destructive' });
      return;
    }
    setPublishing(true);
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const savedId = await autoSave(data, listingId);
      if (savedId) {
        setListingId(savedId);
      }

      const currentListingId = savedId || listingId;

      // Check if this listing was created from an unassigned sign activation
      // If so, the sign is already linked — skip sign selection and go straight to payment
      if (currentListingId) {
        const { data: linkedSign } = await (supabase as any)
          .from('unassigned_signs')
          .select('id')
          .eq('listing_id', currentListingId)
          .maybeSingle();

        if (linkedSign) {
          // Sign already exists via activation — go straight to payment
          setShowPlanSelection(true);
          setPublishing(false);
          return;
        }
      }

      // Check for available unassigned signs
      const { data: poolSigns } = await (supabase as any)
        .from('signs')
        .select('*')
        .is('listing_id', null)
        .order('created_at', { ascending: false });

      setAvailableSigns(poolSigns || []);
      setShowSignSelection(true);
    } catch (err: any) {
      console.error('Save error:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const handleAssignAndActivate = async () => {
    if (!listingId || !selectedSignId) return;
    setAssigningSign(true);
    try {
      // Assign the sign to this listing
      await (supabase as any)
        .from('signs')
        .update({ listing_id: listingId })
        .eq('id', selectedSignId);

      // Record assignment
      await (supabase as any)
        .from('sign_assignments')
        .insert({
          sign_id: selectedSignId,
          listing_id: listingId,
          assigned_by: user?.id,
        });

      // Activate the listing
      await (supabase as any)
        .from('listings')
        .update({ status: 'active' })
        .eq('id', listingId);

      toast({ title: '✅', description: tp('activated') });
      invalidateAll();
      navigate(`/app/listings/${listingId}`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAssigningSign(false);
    }
  };

  const handleCheckout = async (packageId: string) => {
    if (!listingId) return;
    setLoadingPlan(packageId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { package_id: packageId, listing_id: listingId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast({ title: err.message || 'Checkout failed', variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const seo = seoTranslations[language].listingNew;

  return (
    <div className="max-w-3xl mx-auto">
      <OnboardingOverlay
        open={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          // Remove onboarding param from URL
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('onboarding');
          setSearchParams(newParams, { replace: true });
        }}
      />
      <SEO title={seo.title} description={seo.description} />
      <Link
        to="/app/listings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      {showSignSelection ? (
        /* Sign selection / publish mode screen */
        <div>
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">{tp('howToPublish')}</h1>
          </div>

          {!publishMode ? (
            /* Step 1: Choose mode */
            <div className="space-y-3 max-w-lg mx-auto">
              {availableSigns.length > 0 && (
                <button
                  onClick={() => setPublishMode('assign')}
                  className="w-full text-left bg-card rounded-2xl border-2 border-border hover:border-primary p-5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{tp('useAvailableSign')}</p>
                      <p className="text-sm text-muted-foreground">{tp('useAvailableSignDesc')}</p>
                      <p className="text-xs text-primary mt-1">{availableSigns.length} {tp('availableSignsCount')}</p>
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => { setPublishMode('new'); setShowPlanSelection(true); setShowSignSelection(false); }}
                className="w-full text-left bg-card rounded-2xl border-2 border-border hover:border-primary p-5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Signpost className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{tp('buyNewSign')}</p>
                    <p className="text-sm text-muted-foreground">{tp('buyNewSignDesc')}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setPublishMode('qr-only'); setShowPlanSelection(true); setShowSignSelection(false); }}
                className="w-full text-left bg-card rounded-2xl border-2 border-border hover:border-primary p-5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{tp('qrOnly')}</p>
                    <p className="text-sm text-muted-foreground">{tp('qrOnlyDesc')}</p>
                  </div>
                </div>
              </button>
            </div>
          ) : publishMode === 'assign' ? (
            /* Step 2: Select sign from pool */
            <div className="max-w-lg mx-auto">
              <p className="text-sm font-medium text-foreground mb-3">{tp('selectSign')}</p>
              <div className="space-y-3 mb-6">
                {availableSigns.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSignId(s.id)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
                      selectedSignId === s.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <QrCode className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <code className="bg-secondary px-2 py-0.5 rounded text-xs font-mono">{s.sign_code}</code>
                        {s.headline_text && <p className="text-sm text-muted-foreground mt-1">{s.headline_text}</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                variant="hero"
                className="w-full"
                disabled={!selectedSignId || assigningSign}
                onClick={handleAssignAndActivate}
              >
                {assigningSign && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {tp('assignAndActivate')}
              </Button>
            </div>
          ) : null}

          <div className="mt-6">
            <Button variant="outline" onClick={handleBack}>
              {t('prev')}
            </Button>
          </div>
        </div>
      ) : showPlanSelection ? (
        /* Plan selection screen */
        <div>
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">{tp('choosePlan')}</h1>
            <p className="text-muted-foreground">{tp('choosePlanDesc')}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 transition-all ${
                  plan.popular
                    ? 'bg-card shadow-xl border-2 border-primary scale-105 z-10'
                    : 'bg-card shadow-md border border-border hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-0.5 rounded-full shadow">
                      {tp('bestValue')}
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <p className="text-4xl font-display font-bold text-foreground mb-1">{plan.months}</p>
                  <p className="text-sm text-muted-foreground">{tp('months')}</p>
                </div>

                <div className="text-center mb-4">
                  <span className="text-3xl font-display font-bold text-foreground">€{plan.price}</span>
                </div>

                <Button
                  variant={plan.popular ? 'hero' : 'default'}
                  size="lg"
                  className="w-full"
                  disabled={loadingPlan !== null}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {loadingPlan === plan.id && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {tp('activate')}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button variant="outline" onClick={handleBack}>
              {t('prev')}
            </Button>
          </div>
        </div>
      ) : (
        /* Wizard steps */
        <>
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-2xl font-bold text-foreground">{t('title')}</h1>
            {saving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> {t('saving')}
              </span>
            )}
            {!saving && listingId && (
              <span className="text-xs text-success flex items-center gap-1">
                <Check className="w-3 h-3" /> {t('saved')}
              </span>
            )}
          </div>

          <WizardStepper steps={stepLabels} currentStep={step} />

          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
            {step === 0 && <StepProperty data={data} onChange={handleChange} />}
            {step === 1 && <StepMedia data={data} listingId={listingId} onChange={handleChange} />}
            {step === 2 && <StepContact data={data} onChange={handleChange} />}
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 0}>
              {t('prev')}
            </Button>
            <div className="flex gap-3">
              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={!canAdvance() || saving}>
                  {t('next')}
                </Button>
              ) : originalStatus && originalStatus !== 'draft' ? (
                /* Editing an already published listing — save directly */
                <Button variant="hero" onClick={async () => {
                  if (!canAdvance()) {
                    toast({ title: t('required'), description: t('atLeastOneContact'), variant: 'destructive' });
                    return;
                  }
                  setPublishing(true);
                  if (saveTimer.current) clearTimeout(saveTimer.current);
                  await autoSave(data, listingId);
                  toast({ title: '✅', description: tp('changesSaved') });
                  invalidateAll();
                  navigate(`/app/listings/${listingId}`);
                }} disabled={publishing || saving || !canAdvance()}>
                  {publishing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {tp('saveChanges')}
                </Button>
              ) : (
                /* New/draft listing — go to publish flow */
                <Button variant="hero" onClick={handlePublish} disabled={publishing || saving || !canAdvance()}>
                  {publishing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {t('publish')}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListingNew;
