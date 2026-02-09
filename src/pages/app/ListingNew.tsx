import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWizardLabels } from '@/components/wizard/wizardLabels';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { StepProperty } from '@/components/wizard/StepProperty';
import { StepMedia } from '@/components/wizard/StepMedia';
import { StepContact } from '@/components/wizard/StepContact';
import type { Tables } from '@/integrations/supabase/types';

type Listing = Partial<Tables<'listings'>>;

const STEPS = ['step1', 'step2', 'step3'] as const;

const ListingNew = () => {
  const t = useWizardLabels();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const purchaseId = searchParams.get('purchase_id');

  const [step, setStep] = useState(0);
  const [listingId, setListingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [data, setData] = useState<Listing>({
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
    contact_name: profile?.full_name || '',
    contact_phone: profile?.phone || '',
    contact_email: profile?.email || '',
    contact_whatsapp: '',
    agency_name: '',
    show_phone: true,
    show_email: true,
    show_whatsapp: false,
  });

  const stepLabels = STEPS.map((s) => t(s));

  // Debounced auto-save
  const autoSave = useCallback(
    async (current: Listing, id: string | null) => {
      if (!user) return;
      setSaving(true);
      try {
        const payload: any = { ...current, owner_user_id: user.id, status: 'draft' };
        delete payload.id;
        delete payload.created_at;
        delete payload.updated_at;

        if (id) {
          await (supabase as any).from('listings').update(payload).eq('id', id);
        } else {
          const { data: inserted, error } = await (supabase as any)
            .from('listings')
            .insert(payload)
            .select('id')
            .single();
          if (error) throw error;
          setListingId(inserted.id);

          // Auto-link purchase
          if (purchaseId) {
            await (supabase as any)
              .from('purchases')
              .update({ listing_id: inserted.id })
              .eq('id', purchaseId)
              .eq('user_id', user.id);
          }
        }
      } catch (err: any) {
        console.error('Auto-save error:', err);
      } finally {
        setSaving(false);
      }
    },
    [user, purchaseId]
  );

  const handleChange = useCallback(
    (patch: Listing) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        // Debounce save
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
    return true;
  };

  const handleNext = async () => {
    // Force save before advancing
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await autoSave(data, listingId);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handlePublish = async () => {
    if (!listingId || !data.contact_name?.trim()) {
      toast({ title: t('required'), description: t('contactName'), variant: 'destructive' });
      return;
    }
    setPublishing(true);
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await (supabase as any)
        .from('listings')
        .update({ ...data, status: 'active', owner_user_id: user!.id })
        .eq('id', listingId);
      toast({ title: '✅', description: t('saved') });
      navigate('/app/listings');
    } catch (err: any) {
      console.error('Publish error:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/app/listings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

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

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack} disabled={step === 0}>
          {t('prev')}
        </Button>
        <div className="flex gap-3">
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canAdvance() || saving}>
              {t('next')}
            </Button>
          ) : (
            <Button variant="hero" onClick={handlePublish} disabled={publishing || saving}>
              {publishing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('publish')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingNew;
