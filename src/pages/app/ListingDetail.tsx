import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, QrCode, FileText, Download, RefreshCw, ExternalLink, Loader2, Eye, CreditCard, BarChart3, Power, Pencil, Link2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Tables } from '@/integrations/supabase/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DistributionSection from '@/components/listing/DistributionSection';
import { useListing, useListingSigns, useListingPurchase, useListingScans } from '@/hooks/useListings';
import { useListingMutations } from '@/hooks/useListingMutations';

type Listing = Tables<'listings'>;
type Sign = Tables<'signs'>;
type Purchase = Tables<'purchases'>;

const labels: Record<string, Record<string, string>> = {
  back: { en: 'Back to listings', es: 'Volver a anuncios', fr: 'Retour', de: 'Zurück', it: 'Torna', pt: 'Voltar', pl: 'Wróć' },
  signs: { en: 'Signs & QR Codes', es: 'Carteles y QR', fr: 'Affiches & QR', de: 'Plakate & QR', it: 'Cartelli & QR', pt: 'Cartazes & QR', pl: 'Plakaty & QR' },
  noSigns: { en: 'No signs created yet.', es: 'Aún no hay carteles.', fr: 'Aucune affiche.', de: 'Keine Plakate.', it: 'Nessun cartello.', pt: 'Nenhum cartaz.', pl: 'Brak plakatów.' },
  noSignsHint: { en: 'Signs are created when you purchase a plan.', es: 'Los carteles se crean al comprar un plan.', fr: 'Les affiches sont créées lors de l\'achat.', de: 'Plakate werden beim Kauf erstellt.', it: 'I cartelli vengono creati con l\'acquisto.', pt: 'Cartazes são criados ao comprar.', pl: 'Plakaty są tworzone po zakupie.' },
  regenerate: { en: 'Regenerate', es: 'Regenerar', fr: 'Régénérer', de: 'Neu generieren', it: 'Rigenera', pt: 'Regenerar', pl: 'Regeneruj' },
  generate: { en: 'Generate assets', es: 'Generar activos', fr: 'Générer', de: 'Generieren', it: 'Genera', pt: 'Gerar', pl: 'Generuj' },
  preview: { en: 'Preview landing', es: 'Ver landing', fr: 'Voir la page', de: 'Vorschau', it: 'Anteprima', pt: 'Pré-visualizar', pl: 'Podgląd' },
  purchase: { en: 'Purchase', es: 'Compra', fr: 'Achat', de: 'Kauf', it: 'Acquisto', pt: 'Compra', pl: 'Zakup' },
  expiresAt: { en: 'Expires', es: 'Expira', fr: 'Expire', de: 'Läuft ab', it: 'Scade', pt: 'Expira', pl: 'Wygasa' },
  cancelSub: { en: 'Cancel subscription', es: 'Cancelar suscripción', fr: 'Annuler l\'abonnement', de: 'Abo kündigen', it: 'Annulla abbonamento', pt: 'Cancelar assinatura', pl: 'Anuluj subskrypcję' },
  cancelConfirm: { en: 'Subscription will not renew', es: 'La suscripción no se renovará', fr: 'L\'abonnement ne sera pas renouvelé', de: 'Abo wird nicht verlängert', it: 'L\'abbonamento non sarà rinnovato', pt: 'A assinatura não será renovada', pl: 'Subskrypcja nie zostanie odnowiona' },
  cancelledAt: { en: 'Cancels at', es: 'Se cancela el', fr: 'Annulé le', de: 'Endet am', it: 'Annullato il', pt: 'Cancela em', pl: 'Anuluje się' },
  autoRenewOn: { en: 'Auto-renewal enabled', es: 'Renovación automática activada', fr: 'Renouvellement automatique activé', de: 'Auto-Verlängerung aktiviert', it: 'Rinnovo automatico attivato', pt: 'Renovação automática ativada', pl: 'Auto-odnowienie włączone' },
  autoRenewOff: { en: 'Auto-renewal disabled', es: 'Renovación automática desactivada', fr: 'Renouvellement automatique désactivé', de: 'Auto-Verlängerung deaktiviert', it: 'Rinnovo automatico disattivato', pt: 'Renovação automática desativada', pl: 'Auto-odnowienie wyłączone' },
  subscription: { en: 'Subscription', es: 'Suscripción', fr: 'Abonnement', de: 'Abonnement', it: 'Abbonamento', pt: 'Assinatura', pl: 'Subskrypcja' },
  activate: { en: 'Activate listing', es: 'Activar anuncio', fr: 'Activer', de: 'Aktivieren', it: 'Attiva', pt: 'Ativar', pl: 'Aktywuj' },
  noPurchase: { en: 'No active plan. Purchase one to activate this listing.', es: 'Sin plan activo. Compra uno para activar este anuncio.', fr: 'Pas de plan actif. Achetez-en un.', de: 'Kein aktiver Plan. Kaufen Sie einen.', it: 'Nessun piano attivo. Acquistane uno.', pt: 'Sem plano ativo. Compre um.', pl: 'Brak planu. Kup jeden.' },
  paid: { en: 'Paid', es: 'Pagado', fr: 'Payé', de: 'Bezahlt', it: 'Pagato', pt: 'Pago', pl: 'Opłacone' },
  assetsGenerated: { en: 'Assets generated successfully', es: 'Activos generados correctamente', fr: 'Fichiers générés', de: 'Assets erstellt', it: 'File generati', pt: 'Ativos gerados', pl: 'Zasoby wygenerowane' },
  visits: { en: 'Visits', es: 'Visitas', fr: 'Visites', de: 'Besuche', it: 'Visite', pt: 'Visitas', pl: 'Wizyty' },
  day: { en: 'Daily', es: 'Diario', fr: 'Jour', de: 'Täglich', it: 'Giornaliero', pt: 'Diário', pl: 'Dziennie' },
  week: { en: 'Weekly', es: 'Semanal', fr: 'Semaine', de: 'Wöchentlich', it: 'Settimanale', pt: 'Semanal', pl: 'Tygodniowo' },
  month: { en: 'Monthly', es: 'Mensual', fr: 'Mois', de: 'Monatlich', it: 'Mensile', pt: 'Mensal', pl: 'Miesięcznie' },
  noVisits: { en: 'No visits yet', es: 'Sin visitas aún', fr: 'Pas de visites', de: 'Keine Besuche', it: 'Nessuna visita', pt: 'Sem visitas', pl: 'Brak wizyt' },
  autoRenew: { en: 'Auto-renew', es: 'Renovación automática', fr: 'Renouvellement auto', de: 'Auto-Verlängerung', it: 'Rinnovo auto', pt: 'Renovação auto', pl: 'Auto-odnowienie' },
  edit: { en: 'Edit listing', es: 'Editar anuncio', fr: 'Modifier', de: 'Bearbeiten', it: 'Modifica', pt: 'Editar', pl: 'Edytuj' },
  deactivate: { en: 'Deactivate listing', es: 'Desactivar anuncio', fr: 'Désactiver', de: 'Deaktivieren', it: 'Disattiva', pt: 'Desativar', pl: 'Dezaktywuj' },
  reactivate: { en: 'Reactivate listing', es: 'Reactivar anuncio', fr: 'Réactiver', de: 'Reaktivieren', it: 'Riattiva', pt: 'Reativar', pl: 'Reaktywuj' },
  deactivated: { en: 'Listing deactivated', es: 'Anuncio desactivado', fr: 'Annonce désactivée', de: 'Inserat deaktiviert', it: 'Annuncio disattivato', pt: 'Anúncio desativado', pl: 'Ogłoszenie dezaktywowane' },
  reactivated: { en: 'Listing reactivated', es: 'Anuncio reactivado', fr: 'Annonce réactivée', de: 'Inserat reaktiviert', it: 'Annuncio riattivato', pt: 'Anúncio reativado', pl: 'Ogłoszenie reaktywowane' },
  settings: { en: 'Settings', es: 'Ajustes', fr: 'Paramètres', de: 'Einstellungen', it: 'Impostazioni', pt: 'Configurações', pl: 'Ustawienia' },
  directLink: { en: 'Direct Link', es: 'Enlace directo', fr: 'Lien direct', de: 'Direktlink', it: 'Link diretto', pt: 'Link direto', pl: 'Link bezpośredni' },
  copied: { en: 'Copied!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', it: 'Copiato!', pt: 'Copiado!', pl: 'Skopiowano!' },
};

function aggregateScans(scans: { occurred_at: string | null }[], granularity: 'day' | 'week' | 'month') {
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

const ListingDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { invalidateListingDetail, invalidateListings } = useListingMutations();

  const { data: listing, isLoading: loadingListing, isError: listingError, refetch: refetchListing } = useListing(id);
  const [signsPolling, setSignsPolling] = useState(false);
  const { data: signs = [] } = useListingSigns(id, signsPolling);
  const { data: purchase } = useListingPurchase(id);
  const { data: scans = [] } = useListingScans(id);

  // Enable polling while any sign is missing generated assets
  useEffect(() => {
    const pending = signs.some((s: any) => s.listing_id && !s.sign_pdf_path);
    setSignsPolling(pending);
  }, [signs]);

  const [generating, setGenerating] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [scanGranularity, setScanGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [togglingRenew, setTogglingRenew] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  const loading = loadingListing;

  const scanChartData = useMemo(() => aggregateScans(scans, scanGranularity), [scans, scanGranularity]);

  const generateAssets = async (signId: string, options?: { phone?: string; language?: string }) => {
    setGenerating(signId);
    try {
      const res = await supabase.functions.invoke('generate-sign-assets', {
        body: {
          sign_id: signId,
          fallback_language: options?.language || language,
          phone: options?.phone || '',
        },
      });
      if (res.error) throw new Error(res.error.message);
      toast({ title: '✅', description: t('assetsGenerated') });
      if (id) invalidateListingDetail(id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const handleCheckout = async (packageId: string) => {
    if (!id) return;
    setLoadingPlan(packageId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { package_id: packageId, listing_id: id },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPublicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('generated-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <div className="max-w-5xl">
        <Link to="/app/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> {t('back')}
        </Link>
        <div className="text-center py-10 space-y-4">
          <p className="text-muted-foreground">{listingError ? 'Error loading listing. Please try again.' : 'Listing not found.'}</p>
          {listingError && (
            <Button variant="outline" onClick={() => refetchListing()}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t('retry')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const isExpired = purchase?.end_at ? new Date(purchase.end_at) < new Date() : false;
  const needsPayment = !purchase || isExpired;

  const plans = [
    { id: '3m', months: 3, price: 49 },
    { id: '6m', months: 6, price: 64 },
    { id: '12m', months: 12, price: 94 },
  ];

  return (
    <div className="max-w-5xl">
      <Link to="/app/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> {t('back')}
      </Link>

      {/* Listing header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{listing.title || 'Untitled listing'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {[listing.city, listing.region].filter(Boolean).join(', ') || 'No location'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/app/listings/new?listing_id=${listing.id}`}>
              <Pencil className="h-3 w-3 mr-1" /> {t('edit')}
            </Link>
          </Button>
          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="uppercase text-xs">
            {listing.status}
          </Badge>
        </div>
      </div>

      {/* Direct listing link */}
      {(listing as any).listing_code && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{t('directLink')}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="bg-secondary px-3 py-1.5 rounded-lg text-sm font-mono flex-1 truncate">
              {window.location.origin}/l/{(listing as any).listing_code}
            </code>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/l/${(listing as any).listing_code}`);
                  toast({ title: '✅', description: t('copied') });
                }}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" asChild>
                <a href={`/l/${(listing as any).listing_code}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" /> Open
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase / Subscription */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">{t('purchase')}</span>
        </div>

        {purchase && !isExpired ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default">{t('paid')}</Badge>
                  <Badge variant="outline">{t('subscription')}</Badge>
                  <span className="text-sm text-muted-foreground">€{purchase.amount_eur}</span>
                </div>
                {purchase.end_at && (
                  <p className="text-sm text-muted-foreground">
                    {(listing as any).auto_renew === false
                      ? `${t('cancelledAt')}: ${new Date(purchase.end_at).toLocaleDateString()}`
                      : `${t('expiresAt')}: ${new Date(purchase.end_at).toLocaleDateString()}`
                    }
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Auto-renew toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t('autoRenew')}</p>
              </div>
              <Switch
                checked={(listing as any).auto_renew ?? true}
                disabled={togglingRenew || cancellingSubscription}
                onCheckedChange={async (checked) => {
                  if (!(purchase as any).stripe_subscription_id) {
                    // Fallback: just update listing flag locally
                    setTogglingRenew(true);
                    await supabase.from('listings').update({ auto_renew: checked } as any).eq('id', listing.id);
                    if (id) { invalidateListingDetail(id); invalidateListings(); }
                    setTogglingRenew(false);
                    return;
                  }
                  setTogglingRenew(true);
                  try {
                    const { error } = await supabase.functions.invoke('toggle-auto-renew', {
                      body: { purchase_id: purchase.id, auto_renew: checked },
                    });
                    if (error) throw error;
                    toast({ title: '✅', description: checked ? t('autoRenewOn') : t('autoRenewOff') });
                    if (id) { invalidateListingDetail(id); invalidateListings(); }
                  } catch (err: any) {
                    toast({ title: 'Error', description: err.message, variant: 'destructive' });
                  } finally {
                    setTogglingRenew(false);
                  }
                }}
              />
            </div>

            {/* Cancel subscription button */}
            {(purchase as any).stripe_subscription_id && (listing as any).auto_renew !== false && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('cancelSub')}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={cancellingSubscription}
                  onClick={async () => {
                    setCancellingSubscription(true);
                    try {
                      const { error } = await supabase.functions.invoke('cancel-subscription', {
                        body: { purchase_id: purchase.id },
                      });
                      if (error) throw error;
                      toast({ title: '✅', description: t('cancelConfirm') });
                      if (id) { invalidateListingDetail(id); invalidateListings(); }
                    } catch (err: any) {
                      toast({ title: 'Error', description: err.message, variant: 'destructive' });
                    } finally {
                      setCancellingSubscription(false);
                    }
                  }}
                >
                  {cancellingSubscription && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                  {t('cancelSub')}
                </Button>
              </div>
            )}

            <Separator />

            {/* Deactivate / Reactivate */}
            {(
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {listing.status === 'active' ? t('deactivate') : t('reactivate')}
                  </p>
                </div>
                <Button
                  variant={listing.status === 'active' ? 'destructive' : 'default'}
                  size="sm"
                  disabled={togglingStatus}
                  onClick={async () => {
                    setTogglingStatus(true);
                    const newStatus = listing.status === 'active' ? 'paused' : 'active';
                    await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id);
                    if (id) { invalidateListingDetail(id); invalidateListings(); }
                    toast({ title: '✅', description: newStatus === 'paused' ? t('deactivated') : t('reactivated') });
                    setTogglingStatus(false);
                  }}
                >
                  {togglingStatus && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                  <Power className="h-4 w-4 mr-1" />
                  {listing.status === 'active' ? t('deactivate') : t('reactivate')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">{t('noPurchase')}</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {plans.map((plan) => (
                <Button
                  key={plan.id}
                  variant="outline"
                  className="flex flex-col h-auto py-3"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.id && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span className="font-bold">{plan.months} mo — €{plan.price}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visits chart */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{t('visits')}</span>
            <span className="text-2xl font-bold text-foreground">{scans.length}</span>
          </div>
          <Select value={scanGranularity} onValueChange={(v) => setScanGranularity(v as any)}>
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
        {scanChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scanChartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            {t('noVisits')}
          </div>
        )}
      </div>

      {/* Distribution section (replaces old Signs section) */}
      <Separator className="mb-6" />
      <DistributionSection
        listingId={listing.id}
        signs={signs}
        onDataChange={() => { if (id) { invalidateListingDetail(id); invalidateListings(); } }}
        getPublicUrl={getPublicUrl}
        onGenerateAssets={generateAssets}
        generating={generating}
        contactPhone={listing.contact_phone || ''}
      />
    </div>
  );
};

export default ListingDetail;
