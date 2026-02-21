import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Download, ExternalLink, Unlink, RefreshCw, Loader2, AlertTriangle, Eye, LinkIcon, Plus } from 'lucide-react';
import { useUserSigns } from '@/hooks/useSigns';
import { useListingMutations } from '@/hooks/useListingMutations';
import { SignGenerateDialog, type SignGenerateOptions } from '@/components/listing/SignGenerateDialog';

const translations: Record<string, Record<string, string>> = {
  mySignsTitle: { en: 'My Signs', es: 'Mis Carteles' },
  mySignsDescription: { en: 'Manage your sign pool and track assignments', es: 'Gestiona tu pool de carteles y sus asignaciones' },
  noSigns: { en: 'No signs yet', es: 'Sin carteles aún' },
  noSignsDescription: { en: 'Create a new listing and purchase a plan to get started', es: 'Crea un anuncio y compra un plan para comenzar' },
  signCode: { en: 'Sign Code', es: 'Código' },
  status: { en: 'Status', es: 'Estado' },
  assigned: { en: 'Assigned', es: 'Asignado' },
  unassigned: { en: 'In Pool', es: 'En Pool' },
  assignment: { en: 'Listing', es: 'Anuncio' },
  createdAt: { en: 'Created', es: 'Creado' },
  actions: { en: 'Actions', es: 'Acciones' },
  viewQR: { en: 'QR', es: 'QR' },
  downloadPDF: { en: 'PDF', es: 'PDF' },
  preview: { en: 'Preview', es: 'Ver' },
  unassign: { en: 'Unassign', es: 'Desasignar' },
  unassignConfirm: { en: 'Unassign this sign?', es: '¿Desasignar este cartel?' },
  unassignDesc: { en: 'The sign will go back to your pool. QR scans will show "not found" until reassigned.', es: 'El cartel volverá a tu pool. Los escaneos del QR mostrarán "no encontrado" hasta reasignarlo.' },
  cancel: { en: 'Cancel', es: 'Cancelar' },
  unassignSuccess: { en: 'Sign unassigned', es: 'Cartel desasignado' },
  regenerate: { en: 'Regenerate', es: 'Regenerar' },
  generate: { en: 'Generate', es: 'Generar' },
  assetsGenerated: { en: 'Assets generated', es: 'Activos generados' },
  generatingTooltip: { en: 'Sign is being generated', es: 'El cartel se está generando' },
  assignListing: { en: 'Assign listing', es: 'Asignar anuncio' },
  assignListingTitle: { en: 'Assign to a listing', es: 'Asignar a un anuncio' },
  assignListingDesc: { en: 'Choose a listing with an active subscription', es: 'Elige un anuncio con suscripción activa' },
  noActiveListings: { en: 'No listings with active subscriptions', es: 'No hay anuncios con suscripción activa' },
  createNewListing: { en: 'Create new listing', es: 'Crear nuevo anuncio' },
  assignSuccess: { en: 'Sign assigned successfully', es: 'Cartel asignado correctamente' },
};

export default function MySigns() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [signsPolling, setSignsPolling] = useState(false);
  const { data: signs = [], isLoading: loading } = useUserSigns(signsPolling);
  const { invalidateSigns, invalidateAll } = useListingMutations();

  // Enable polling while any sign is missing generated assets
  useEffect(() => {
    const pending = signs.some((s: any) => s.listing_id && !s.sign_pdf_path);
    setSignsPolling(pending);
  }, [signs]);

  const [unassignSignId, setUnassignSignId] = useState<string | null>(null);
  const [unassigning, setUnassigning] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<{ code: string; url: string } | null>(null);

  // Assign listing state
  const [assignSignId, setAssignSignId] = useState<string | null>(null);
  const [activeListings, setActiveListings] = useState<Array<{ id: string; title: string | null; listing_code: string | null; city: string | null }>>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  const t = (key: string) => translations[key]?.[language] || translations[key]?.en || key;

  const getPublicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('generated-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUnassign = async () => {
    if (!unassignSignId) return;
    setUnassigning(true);
    try {
      const sign = signs.find(s => s.id === unassignSignId);
      if (sign?.listing_id) {
        await (supabase as any).from('sign_assignments')
          .update({ unassigned_at: new Date().toISOString() })
          .eq('sign_id', unassignSignId)
          .eq('listing_id', sign.listing_id)
          .is('unassigned_at', null);
      }
      await (supabase as any).from('signs').update({ listing_id: null }).eq('id', unassignSignId);
      invalidateAll();
      toast({ title: '✅', description: t('unassignSuccess') });
      setUnassignSignId(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUnassigning(false);
    }
  };

  const handleGenerate = async (signId: string, options?: { phone?: string; language?: string }) => {
    setGenerating(signId);
    setShowGenerateDialog(null);
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
      invalidateSigns();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const loadActiveListings = async () => {
    if (!user) return;
    setLoadingListings(true);
    try {
      // Get listings that have an active (paid) purchase
      const { data: purchases } = await (supabase as any)
        .from('purchases')
        .select('listing_id')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('end_at', new Date().toISOString());

      const listingIds = [...new Set((purchases || []).map((p: any) => p.listing_id).filter(Boolean))] as string[];

      if (listingIds.length === 0) {
        setActiveListings([]);
        setLoadingListings(false);
        return;
      }

      const { data: listings } = await (supabase as any)
        .from('listings')
        .select('id, title, listing_code, city')
        .in('id', listingIds)
        .order('updated_at', { ascending: false });

      setActiveListings(listings || []);
    } catch (err) {
      console.error('Error loading active listings:', err);
      setActiveListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleOpenAssign = (signId: string) => {
    setAssignSignId(signId);
    loadActiveListings();
  };

  const handleAssignToListing = async (listingId: string) => {
    if (!assignSignId || !user) return;
    setAssigning(listingId);
    try {
      // Update sign's listing_id
      await (supabase as any)
        .from('signs')
        .update({ listing_id: listingId })
        .eq('id', assignSignId);

      // Record assignment
      await (supabase as any)
        .from('sign_assignments')
        .insert({
          sign_id: assignSignId,
          listing_id: listingId,
          assigned_by: user.id,
        });

      // Auto-generate assets
      try {
        await supabase.functions.invoke('generate-sign-assets', { body: { sign_id: assignSignId, fallback_language: language } });
      } catch (genErr) {
        console.warn('Auto-generate after assign failed:', genErr);
      }

      invalidateAll();
      toast({ title: '✅', description: t('assignSuccess') });
      setAssignSignId(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!signs.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('mySignsTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('mySignsDescription')}</p>
        </div>
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <QrCode className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">{t('noSigns')}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t('noSignsDescription')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('mySignsTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('mySignsDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Signs ({signs.length})
          </CardTitle>
          <CardDescription>{t('mySignsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('signCode')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('assignment')}</TableHead>
                  <TableHead>{t('createdAt')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signs.map((sign) => {
                  const qrUrl = getPublicUrl(sign.qr_image_path);
                  const pdfUrl = getPublicUrl(sign.sign_pdf_path);
                  const isGenerating = generating === sign.id;

                  return (
                    <TableRow key={sign.id}>
                      <TableCell className="font-mono text-sm font-semibold">
                        {sign.sign_code}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sign.listing_id ? 'default' : 'outline'} className="gap-1">
                          <span className={`h-2 w-2 rounded-full ${sign.listing_id ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {sign.listing_id ? t('assigned') : t('unassigned')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sign.listing ? (
                          <Link to={`/app/listings/${sign.listing_id}`} className="text-sm text-primary hover:underline">
                            {sign.listing.title || sign.listing.listing_code}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sign.created_at
                          ? new Date(sign.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          {/* Assign listing (only for unassigned signs) */}
                          {!sign.listing_id && (
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleOpenAssign(sign.id)}
                            >
                              <LinkIcon className="h-3.5 w-3.5" /> {t('assignListing')}
                            </Button>
                          )}
                          {/* Generate / Regenerate */}
                          {sign.listing_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              disabled={isGenerating}
                              onClick={() => setShowGenerateDialog(sign.id)}
                            >
                              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                                sign.qr_image_path ? <RefreshCw className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />}
                              {sign.qr_image_path ? t('regenerate') : t('generate')}
                            </Button>
                          )}
                          {/* Generating indicator */}
                          {sign.listing_id && !sign.sign_pdf_path && !isGenerating && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-xs text-primary cursor-help">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('generatingTooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* QR preview */}
                          {qrUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => setQrPreview({ code: sign.sign_code, url: qrUrl })}
                            >
                              <Eye className="h-3.5 w-3.5" /> {t('viewQR')}
                            </Button>
                          )}
                          {/* Download PDF */}
                          {pdfUrl && (
                            <Button variant="ghost" size="sm" className="gap-1" asChild>
                              <a href={pdfUrl} download={`sign-${sign.sign_code}.pdf`} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3.5 w-3.5" /> {t('downloadPDF')}
                              </a>
                            </Button>
                          )}
                          {/* Preview public URL */}
                          {sign.public_url && (
                            <Button variant="ghost" size="sm" className="gap-1" asChild>
                              <a href={sign.public_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" /> {t('preview')}
                              </a>
                            </Button>
                          )}
                          {/* Unassign */}
                          {sign.listing_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => setUnassignSignId(sign.id)}
                            >
                              <Unlink className="h-3.5 w-3.5" /> {t('unassign')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* QR Preview Dialog */}
      <Dialog open={!!qrPreview} onOpenChange={() => setQrPreview(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR — {qrPreview?.code}</DialogTitle>
          </DialogHeader>
          {qrPreview && (
            <div className="flex flex-col items-center gap-4">
              <img src={qrPreview.url} alt={`QR ${qrPreview.code}`} className="w-64 h-64 rounded-lg border border-border" />
              <Button variant="outline" size="sm" asChild>
                <a href={qrPreview.url} download={`qr-${qrPreview.code}.png`}>
                  <Download className="h-3 w-3 mr-1" /> Download PNG
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Unassign Dialog */}
      <Dialog open={!!unassignSignId} onOpenChange={() => setUnassignSignId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('unassignConfirm')}
            </DialogTitle>
            <DialogDescription>{t('unassignDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('cancel')}</Button>
            </DialogClose>
            <Button variant="destructive" disabled={unassigning} onClick={handleUnassign}>
              {unassigning && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              {t('unassign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Listing Dialog */}
      <Dialog open={!!assignSignId} onOpenChange={() => setAssignSignId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              {t('assignListingTitle')}
            </DialogTitle>
            <DialogDescription>{t('assignListingDesc')}</DialogDescription>
          </DialogHeader>

          {loadingListings ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activeListings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">{t('noActiveListings')}</p>
              <Button onClick={() => { setAssignSignId(null); navigate('/app/listings/new'); }}>
                <Plus className="h-4 w-4 mr-1" /> {t('createNewListing')}
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {activeListings.map((listing) => (
                <button
                  key={listing.id}
                  disabled={!!assigning}
                  onClick={() => handleAssignToListing(listing.id)}
                  className="w-full flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {listing.title || listing.listing_code || 'Untitled'}
                    </p>
                    {listing.city && (
                      <p className="text-xs text-muted-foreground">{listing.city}</p>
                    )}
                  </div>
                  {assigning === listing.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  ) : (
                    <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              ))}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setAssignSignId(null); navigate('/app/listings/new'); }}
                >
                  <Plus className="h-4 w-4 mr-1" /> {t('createNewListing')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate dialog */}
      <SignGenerateDialog
        open={!!showGenerateDialog}
        onOpenChange={(v) => { if (!v) setShowGenerateDialog(null); }}
        onConfirm={(opts) => {
          if (showGenerateDialog) {
            const sign = signs.find((s: any) => s.id === showGenerateDialog);
            const phone = opts.showPhone ? (sign?.listing?.contact_phone || '') : '';
            handleGenerate(showGenerateDialog, { phone, language: opts.language });
          }
        }}
        loading={!!generating}
      />
    </div>
  );
}
