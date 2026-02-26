import { useState } from 'react';
import { SignGenerateDialog, type SignGenerateOptions } from './SignGenerateDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
  QrCode, Download, RefreshCw, FileText, Loader2, Unlink, ArrowRightLeft, Plus, AlertTriangle
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Sign = Tables<'signs'>;

const labels: Record<string, Record<string, string>> = {
  distribution: { en: 'Distribution', es: 'Distribución', fr: 'Distribution', de: 'Verteilung', it: 'Distribuzione', pt: 'Distribuição', pl: 'Dystrybucja' },
  assignedSigns: { en: 'Assigned Signs', es: 'Carteles asignados', fr: 'Affiches assignées', de: 'Zugewiesene Plakate', it: 'Cartelli assegnati', pt: 'Cartazes atribuídos', pl: 'Przypisane plakaty' },
  noAssigned: { en: 'No signs assigned to this listing.', es: 'No hay carteles asignados a este anuncio.', fr: 'Aucune affiche assignée.', de: 'Keine Plakate zugewiesen.', it: 'Nessun cartello assegnato.', pt: 'Nenhum cartaz atribuído.', pl: 'Brak przypisanych plakatów.' },
  addSign: { en: 'Assign a sign', es: 'Asignar cartel', fr: 'Assigner une affiche', de: 'Plakat zuweisen', it: 'Assegna cartello', pt: 'Atribuir cartaz', pl: 'Przypisz plakat' },
  unassign: { en: 'Unassign', es: 'Desasignar', fr: 'Désassigner', de: 'Zuordnung aufheben', it: 'Rimuovi', pt: 'Desatribuir', pl: 'Odłącz' },
  unassignConfirm: { en: 'Unassign this sign?', es: '¿Desasignar este cartel?', fr: 'Désassigner cette affiche ?', de: 'Zuordnung aufheben?', it: 'Rimuovere questo cartello?', pt: 'Desatribuir este cartaz?', pl: 'Odłączyć ten plakat?' },
  unassignDesc: { en: 'The sign will go back to your available pool. People scanning the QR will see a "not found" page until you reassign it.', es: 'El cartel volverá a tu pool disponible. Quienes escaneen el QR verán una página "no encontrado" hasta que lo reasignes.', fr: 'L\'affiche retournera dans votre pool. Les personnes scannant le QR verront une page "introuvable".', de: 'Das Plakat kehrt in Ihren Pool zurück. QR-Scanner sehen eine "nicht gefunden" Seite.', it: 'Il cartello tornerà nel tuo pool. Chi scansiona il QR vedrà "non trovato".', pt: 'O cartaz voltará ao seu pool. Quem escanear o QR verá "não encontrado".', pl: 'Plakat wróci do puli. Skanujący QR zobaczą stronę "nie znaleziono".' },
  confirm: { en: 'Confirm', es: 'Confirmar', fr: 'Confirmer', de: 'Bestätigen', it: 'Conferma', pt: 'Confirmar', pl: 'Potwierdź' },
  cancel: { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', it: 'Annulla', pt: 'Cancelar', pl: 'Anuluj' },
  availableSigns: { en: 'Available signs in your pool', es: 'Carteles disponibles en tu pool', fr: 'Affiches disponibles dans votre pool', de: 'Verfügbare Plakate', it: 'Cartelli disponibili nel tuo pool', pt: 'Cartazes disponíveis no seu pool', pl: 'Dostępne plakaty w puli' },
  noAvailable: { en: 'No unassigned signs available. Purchase a new plan to get one.', es: 'No hay carteles sin asignar. Compra un plan para obtener uno.', fr: 'Aucune affiche disponible. Achetez un plan.', de: 'Keine verfügbaren Plakate. Kaufen Sie einen Plan.', it: 'Nessun cartello disponibile. Acquista un piano.', pt: 'Nenhum cartaz disponível. Compre um plano.', pl: 'Brak dostępnych plakatów. Kup plan.' },
  assignToListing: { en: 'Assign to this listing', es: 'Asignar a este anuncio', fr: 'Assigner à cette annonce', de: 'Diesem Inserat zuweisen', it: 'Assegna a questo annuncio', pt: 'Atribuir a este anúncio', pl: 'Przypisz do tego ogłoszenia' },
  reassignWarning: { en: 'This sign is currently assigned to another listing. Reassigning it will change what people see when scanning.', es: 'Este cartel está asignado a otro anuncio. Reasignarlo cambiará lo que ven al escanear.', fr: 'Cette affiche est actuellement assignée à une autre annonce. La réassigner changera ce que les gens voient.', de: 'Dieses Plakat ist einem anderen Inserat zugewiesen. Neuzuweisung ändert, was Scanner sehen.', it: 'Questo cartello è assegnato a un altro annuncio. Riassegnarlo cambierà cosa vedono gli scanner.', pt: 'Este cartaz está atribuído a outro anúncio. Reatribuí-lo mudará o que as pessoas veem.', pl: 'Ten plakat jest przypisany do innego ogłoszenia. Ponowne przypisanie zmieni to, co widzą skanujący.' },
  reassignCheckbox: { en: 'I confirm I moved/replaced the physical sign', es: 'Confirmo que moví/reemplacé el cartel físico', fr: 'Je confirme avoir déplacé/remplacé l\'affiche physique', de: 'Ich bestätige, dass ich das physische Plakat bewegt/ersetzt habe', it: 'Confermo di aver spostato/sostituito il cartello fisico', pt: 'Confirmo que movi/substitui o cartaz físico', pl: 'Potwierdzam, że przeniosłem/wymieniłem fizyczny plakat' },
  assigned: { en: 'Sign assigned successfully', es: 'Cartel asignado correctamente', fr: 'Affiche assignée', de: 'Plakat zugewiesen', it: 'Cartello assegnato', pt: 'Cartaz atribuído', pl: 'Plakat przypisany' },
  unassigned: { en: 'Sign unassigned', es: 'Cartel desasignado', fr: 'Affiche désassignée', de: 'Zuordnung aufgehoben', it: 'Cartello rimosso', pt: 'Cartaz desatribuído', pl: 'Plakat odłączony' },
  regenerate: { en: 'Regenerate', es: 'Regenerar', fr: 'Régénérer', de: 'Neu generieren', it: 'Rigenera', pt: 'Regenerar', pl: 'Regeneruj' },
  generate: { en: 'Generate assets', es: 'Generar activos', fr: 'Générer', de: 'Generieren', it: 'Genera', pt: 'Gerar', pl: 'Generuj' },
  generatingTooltip: { en: 'Sign is being generated', es: 'El cartel se está generando', fr: 'L\'affiche est en cours de génération', de: 'Plakat wird erstellt', it: 'Il cartello è in fase di generazione', pt: 'O cartaz está sendo gerado', pl: 'Plakat jest generowany' },
  viewSign: { en: 'View sign', es: 'Ver cartel', fr: 'Voir l\'affiche', de: 'Plakat ansehen', it: 'Vedi cartello', pt: 'Ver cartaz', pl: 'Zobacz plakat' },
};

interface DistributionSectionProps {
  listingId: string;
  signs: Sign[];
  onDataChange: () => void;
  getPublicUrl: (path: string | null) => string | null;
  onGenerateAssets: (signId: string, options?: { phone?: string; language?: string }) => void;
  generating: string | null;
  contactPhone?: string;
}

const DistributionSection = ({
  listingId,
  signs,
  onDataChange,
  getPublicUrl,
  onGenerateAssets,
  generating,
  contactPhone,
}: DistributionSectionProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState<string | null>(null);
  const [showReassignConfirm, setShowReassignConfirm] = useState<string | null>(null);
  const [availableSigns, setAvailableSigns] = useState<Sign[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [unassigning, setUnassigning] = useState(false);
  const [reassignConfirmed, setReassignConfirmed] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState<string | null>(null);
  const loadAvailableSigns = async () => {
    if (!user) return;
    setLoadingAvailable(true);
    // Fetch all signs owned by this user (via listings they own) that are either unassigned
    // or assigned to a different listing (available for reassignment)
    const { data: poolSigns } = await (supabase as any)
      .from('signs')
      .select('*')
      .or('listing_id.is.null,listing_id.neq.' + listingId)
      .order('created_at', { ascending: false });

    setAvailableSigns(poolSigns || []);
    setLoadingAvailable(false);
  };

  const handleAssign = async (sign: Sign) => {
    // Check if sign is currently assigned to another listing
    if (sign.listing_id && sign.listing_id !== listingId) {
      setShowReassignConfirm(sign.id);
      return;
    }

    // If sign is in pool (no listing_id), assign directly
    setAssigning(sign.id);
    try {
      // Update sign's listing_id
      await (supabase as any)
        .from('signs')
        .update({ listing_id: listingId })
        .eq('id', sign.id);

      // Record new assignment
      await (supabase as any)
        .from('sign_assignments')
        .insert({
          sign_id: sign.id,
          listing_id: listingId,
          assigned_by: user?.id,
        });

      onDataChange();

      toast({ title: '✅', description: t('assigned') });
      // Show generate dialog so user picks phone/language before generating
      setShowGenerateDialog(sign.id);
      setShowAssignModal(false);
      setReassignConfirmed(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAssigning(null);
    }
  };

  const handleConfirmReassign = async (signId: string) => {
    if (!reassignConfirmed) {
      toast({ title: 'Error', description: 'Please confirm you moved the physical sign', variant: 'destructive' });
      return;
    }

    setAssigning(signId);
    try {
      const sign = availableSigns.find(s => s.id === signId);
      if (!sign) return;

      // If sign was previously assigned to another listing, record unassignment
      if (sign.listing_id && sign.listing_id !== listingId) {
        await (supabase as any)
          .from('sign_assignments')
          .update({ unassigned_at: new Date().toISOString() })
          .eq('sign_id', signId)
          .is('unassigned_at', null);
      }

      // Update sign's listing_id
      await (supabase as any)
        .from('signs')
        .update({ listing_id: listingId })
        .eq('id', signId);

      // Record new assignment
      await (supabase as any)
        .from('sign_assignments')
        .insert({
          sign_id: signId,
          listing_id: listingId,
          assigned_by: user?.id,
        });

      onDataChange();

      toast({ title: '✅', description: t('assigned') });
      // Show generate dialog so user picks phone/language before generating
      setShowGenerateDialog(signId);
      setShowReassignConfirm(null);
      setShowAssignModal(false);
      setReassignConfirmed(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassign = async (signId: string) => {
    setUnassigning(true);
    try {
      // Record unassignment in history
      await (supabase as any)
        .from('sign_assignments')
        .update({ unassigned_at: new Date().toISOString() })
        .eq('sign_id', signId)
        .is('unassigned_at', null);

      // Set listing_id to null
      await (supabase as any)
        .from('signs')
        .update({ listing_id: null })
        .eq('id', signId);

      onDataChange();

      toast({ title: '✅', description: t('unassigned') });
      setShowUnassignModal(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUnassigning(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" /> {t('distribution')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowAssignModal(true); loadAvailableSigns(); }}
        >
          <Plus className="h-3 w-3 mr-1" /> {t('addSign')}
        </Button>
      </div>

      <p className="text-sm font-medium text-foreground mb-3">{t('assignedSigns')}</p>

      {signs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <QrCode className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>{t('noAssigned')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {signs.map((sign) => {
            const qrUrl = getPublicUrl(sign.qr_image_path);
            const pdfUrl = getPublicUrl(sign.sign_pdf_path);
            const isGenerating = generating === sign.id;

            return (
              <div key={sign.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* QR preview */}
                  <div className="shrink-0">
                    {sign.sign_pdf_path ? (
                      qrUrl ? (
                        <img src={qrUrl} alt="QR Code" className="w-24 h-24 rounded-lg border border-border" />
                      ) : (
                        <div className="w-24 h-24 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/50">
                          <QrCode className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-24 h-24 rounded-lg border border-dashed border-primary/30 flex items-center justify-center bg-primary/5 cursor-help">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('generatingTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Sign info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="bg-secondary px-2 py-0.5 rounded text-xs font-mono">{sign.sign_code}</code>
                      <Badge variant="outline" className="text-xs">{sign.size || 'A4'}</Badge>
                      <Badge variant="outline" className="text-xs">{sign.orientation || 'portrait'}</Badge>
                    </div>

                    {sign.headline_text && (
                      <p className="text-sm font-semibold text-foreground mb-1">{sign.headline_text}</p>
                    )}


                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => setShowGenerateDialog(sign.id)} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> :
                          sign.qr_image_path ? <RefreshCw className="h-3 w-3 mr-1" /> : <QrCode className="h-3 w-3 mr-1" />}
                        {sign.qr_image_path ? t('regenerate') : t('generate')}
                      </Button>
                      {qrUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={qrUrl} download={`qr-${sign.sign_code}.png`}>
                            <Download className="h-3 w-3 mr-1" /> QR
                          </a>
                        </Button>
                      )}
                      {pdfUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-3 w-3 mr-1" /> {t('viewSign')}
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setShowUnassignModal(sign.id)}
                      >
                        <Unlink className="h-3 w-3 mr-1" /> {t('unassign')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unassign confirmation dialog */}
      <Dialog open={!!showUnassignModal} onOpenChange={() => setShowUnassignModal(null)}>
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
            <Button
              variant="destructive"
              disabled={unassigning}
              onClick={() => showUnassignModal && handleUnassign(showUnassignModal)}
            >
              {unassigning && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              {t('unassign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign sign modal */}
      <Dialog open={showAssignModal} onOpenChange={(open) => { setShowAssignModal(open); setReassignConfirmed(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addSign')}</DialogTitle>
            <DialogDescription>{t('availableSigns')}</DialogDescription>
          </DialogHeader>

          {loadingAvailable ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : availableSigns.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <QrCode className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>{t('noAvailable')}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableSigns.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <code className="bg-secondary px-2 py-0.5 rounded text-xs font-mono">{s.sign_code}</code>
                    {s.headline_text && <p className="text-sm text-muted-foreground mt-1">{s.headline_text}</p>}
                  </div>
                  <Button
                    size="sm"
                    disabled={assigning !== null}
                    onClick={() => handleAssign(s)}
                  >
                    {assigning === s.id && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                    {t('assignToListing')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reassignment confirmation dialog */}
      <Dialog open={!!showReassignConfirm} onOpenChange={() => { setShowReassignConfirm(null); setReassignConfirmed(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('reassignWarning')}
            </DialogTitle>
            <DialogDescription>{t('reassignWarning')}</DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
            {t('reassignDesc')}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="reassign-confirm"
              checked={reassignConfirmed}
              onCheckedChange={(checked) => setReassignConfirmed(checked as boolean)}
            />
            <label htmlFor="reassign-confirm" className="text-sm font-medium cursor-pointer">
              {t('reassignCheckbox')}
            </label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('cancel')}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={!reassignConfirmed || assigning !== null}
              onClick={() => showReassignConfirm && handleConfirmReassign(showReassignConfirm)}
            >
              {assigning && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              {t('assignToListing')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate dialog */}
      <SignGenerateDialog
        open={!!showGenerateDialog}
        onOpenChange={(v) => { if (!v) setShowGenerateDialog(null); }}
        onConfirm={(opts) => {
          if (showGenerateDialog) {
            onGenerateAssets(showGenerateDialog, {
              phone: opts.showPhone ? (contactPhone || '') : '',
              language: opts.language,
            });
            setShowGenerateDialog(null);
          }
        }}
        loading={!!generating}
      />
    </div>
  );
};

export default DistributionSection;
