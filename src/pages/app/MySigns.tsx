import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { QrCode, FileText, Download, ExternalLink, Unlink, RefreshCw, Loader2, AlertTriangle, Eye } from 'lucide-react';
import { useUserSigns } from '@/hooks/useSigns';
import { useListingMutations } from '@/hooks/useListingMutations';

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
};

export default function MySigns() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: signs = [], isLoading: loading } = useUserSigns();
  const { invalidateSigns, invalidateAll } = useListingMutations();

  const [unassignSignId, setUnassignSignId] = useState<string | null>(null);
  const [unassigning, setUnassigning] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<{ code: string; url: string } | null>(null);

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

  const handleGenerate = async (signId: string) => {
    setGenerating(signId);
    try {
      const res = await supabase.functions.invoke('generate-sign-assets', { body: { sign_id: signId } });
      if (res.error) throw new Error(res.error.message);
      toast({ title: '✅', description: t('assetsGenerated') });
      invalidateSigns();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(null);
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
                          {/* Generate / Regenerate */}
                          {sign.listing_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              disabled={isGenerating}
                              onClick={() => handleGenerate(sign.id)}
                            >
                              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                                sign.qr_image_path ? <RefreshCw className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />}
                              {sign.qr_image_path ? t('regenerate') : t('generate')}
                            </Button>
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
    </div>
  );
}
