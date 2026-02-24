import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Plus, Loader2, ArrowLeft, Download, FileSpreadsheet, Copy, Check, RefreshCw, Eye } from 'lucide-react';
import JSZip from 'jszip';

interface Batch {
  id: string;
  created_at: string;
  language: string;
  property_type: string;
  transaction_type: string;
  has_phone_space: boolean;
  total_count: number;
  unassigned_count?: number;
  sold_count?: number;
  assigned_count?: number;
}

interface UnassignedSign {
  id: string;
  activation_token: string;
  qr_url: string;
  status: string;
  customer_id: string | null;
  listing_id: string | null;
  sold_at: string | null;
  assigned_at: string | null;
  png_filename: string | null;
  customer_email?: string;
}

const generateToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 12; i++) result += chars[arr[i] % chars.length];
  return result;
};

const AdminUnassignedSigns = () => {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [signs, setSigns] = useState<UnassignedSign[]>([]);
  const [signsLoading, setSignsLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState<{ current: number; total: number } | null>(null);
  const [generatingSignIds, setGeneratingSignIds] = useState<Set<string>>(new Set());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Form state
  const [formLang, setFormLang] = useState('es');
  const [formPropType, setFormPropType] = useState('apartment');
  const [formTxType, setFormTxType] = useState('sale');
  const [formPhone, setFormPhone] = useState(false);
  const [formCount, setFormCount] = useState(10);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    const { data: batchData } = await (supabase as any)
      .from('sign_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (!batchData) { setLoading(false); return; }

    // Fetch counts for each batch
    const enriched: Batch[] = [];
    for (const b of batchData) {
      const { data: signData } = await (supabase as any)
        .from('unassigned_signs')
        .select('status')
        .eq('batch_id', b.id);

      const counts = { unassigned: 0, sold: 0, assigned: 0 };
      signData?.forEach((s: any) => {
        if (s.status in counts) counts[s.status as keyof typeof counts]++;
      });

      enriched.push({
        ...b,
        unassigned_count: counts.unassigned,
        sold_count: counts.sold,
        assigned_count: counts.assigned,
      });
    }
    setBatches(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const handleGenerate = async () => {
    if (formCount < 1 || formCount > 500) return;
    setGenerating(true);

    try {
      // Create batch
      const { data: batch, error: batchErr } = await (supabase as any)
        .from('sign_batches')
        .insert({
          language: formLang,
          property_type: formPropType,
          transaction_type: formTxType,
          has_phone_space: formPhone,
          total_count: formCount,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select('id')
        .single();

      if (batchErr) throw batchErr;

      // Generate signs
      const signsToInsert = [];
      for (let i = 0; i < formCount; i++) {
        const token = generateToken();
        signsToInsert.push({
          batch_id: batch.id,
          activation_token: token,
          qr_url: `https://zignoqr.com/activate/${token}`,
          status: 'unassigned',
        });
      }

      const { error: insertErr } = await (supabase as any)
        .from('unassigned_signs')
        .insert(signsToInsert);

      if (insertErr) throw insertErr;

      // Call edge function to generate sign via n8n webhook for each sign
      let completed = 0;
      setGenProgress({ current: 0, total: signsToInsert.length });

      // Get inserted signs with their DB ids
      const { data: insertedSigns } = await (supabase as any)
        .from('unassigned_signs')
        .select('id, activation_token')
        .eq('batch_id', batch.id);

      const signMap = new Map((insertedSigns || []).map((s: any) => [s.activation_token, s.id]));

      for (const s of signsToInsert) {
        try {
          const signId = signMap.get(s.activation_token);
          const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-unassigned-sign', {
            body: {
              signId,
              batchId: batch.id,
              token: s.activation_token,
              qrUrl: s.qr_url,
              language: formLang,
              type: formTxType,
              propertyType: formPropType,
              phone: formPhone,
            },
          });

          if (fnError) {
            console.error('Edge function error for', s.activation_token, fnError);
          } else {
            console.log('Sign generated:', s.activation_token, fnData);
          }
        } catch (err) {
          console.error('Error generating sign', s.activation_token, err);
        }
        completed++;
        setGenProgress({ current: completed, total: signsToInsert.length });
      }
      setGenProgress(null);

      toast({ title: `Batch generado: ${formCount} carteles creados.` });
      setDialogOpen(false);
      fetchBatches();
    } catch (err: any) {
      toast({ title: err.message || 'Error generating batch', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const fetchSigns = async (batchId: string) => {
    setSignsLoading(true);
    setSelectedBatch(batchId);

    const { data } = await (supabase as any)
      .from('unassigned_signs')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });

    // Fetch customer emails for sold/assigned signs
    const enriched: UnassignedSign[] = [];
    for (const s of (data || [])) {
      let customerEmail = '—';
      if (s.customer_id) {
        const { data: prof } = await (supabase as any)
          .from('profiles')
          .select('email')
          .eq('id', s.customer_id)
          .maybeSingle();
        customerEmail = prof?.email || '—';
      }
      enriched.push({ ...s, customer_email: customerEmail });
    }
    setSigns(enriched);
    setSignsLoading(false);

    // Start polling for signs without png_filename
    startPolling(batchId);
  };

  const startPolling = (batchId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      const { data } = await (supabase as any)
        .from('unassigned_signs')
        .select('id, png_filename')
        .eq('batch_id', batchId)
        .is('png_filename', null);

      if (!data || data.length === 0) {
        // All signs have PNGs, stop polling and refresh
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        // Refresh the full sign list
        const { data: refreshed } = await (supabase as any)
          .from('unassigned_signs')
          .select('*')
          .eq('batch_id', batchId)
          .order('created_at', { ascending: true });
        if (refreshed) {
          const enriched: UnassignedSign[] = refreshed.map((s: any) => ({ ...s, customer_email: '—' }));
          setSigns(enriched);
        }
        return;
      }

      // Partial update: update signs that now have png_filename
      setSigns(prev => {
        const updatedIds = new Set(data.map((d: any) => d.id));
        return prev; // no change needed, we'll refresh on next poll
      });

      // Also refresh to get updated png_filenames
      const { data: allSigns } = await (supabase as any)
        .from('unassigned_signs')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: true });
      if (allSigns) {
        const enriched: UnassignedSign[] = allSigns.map((s: any) => ({ ...s, customer_email: s.customer_email || '—' }));
        setSigns(enriched);
      }
    }, 3000);
  };

  // Cleanup polling on unmount or batch change
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedBatch]);

  const generateSingleSign = async (sign: UnassignedSign) => {
    if (!selectedBatch) return;
    setGeneratingSignIds(prev => new Set(prev).add(sign.id));

    // Get batch info
    const batch = batches.find(b => b.id === selectedBatch);

    try {
      const { data, error } = await supabase.functions.invoke('generate-unassigned-sign', {
        body: {
          signId: sign.id,
          batchId: selectedBatch,
          token: sign.activation_token,
          qrUrl: sign.qr_url,
          language: batch?.language || 'es',
          type: batch?.transaction_type || 'sale',
          propertyType: batch?.property_type || 'apartment',
          phone: batch?.has_phone_space || false,
        },
      });

      if (error) {
        console.error('Error generating sign:', error);
        toast({ title: `Error generando cartel ${sign.activation_token}`, variant: 'destructive' });
      } else {
        // Update the sign in local state
        setSigns(prev => prev.map(s =>
          s.id === sign.id ? { ...s, png_filename: data.filePath } : s
        ));
        toast({ title: `Cartel ${sign.activation_token} generado correctamente` });
      }
    } catch (err: any) {
      console.error('Error:', err);
      toast({ title: err.message || 'Error', variant: 'destructive' });
    } finally {
      setGeneratingSignIds(prev => {
        const next = new Set(prev);
        next.delete(sign.id);
        return next;
      });
    }
  };

  const downloadPng = async (sign: UnassignedSign) => {
    if (!sign.png_filename) return;
    const { data } = supabase.storage.from('sign-assets').getPublicUrl(sign.png_filename);
    window.open(data.publicUrl, '_blank');
  };

  const downloadAllPngs = async () => {
    const zip = new JSZip();
    const folder = zip.folder('signs');
    if (!folder) return;

    for (const s of signs) {
      if (!s.png_filename) continue;
      const { data } = supabase.storage.from('sign-assets').getPublicUrl(s.png_filename);
      try {
        const resp = await fetch(data.publicUrl);
        const blob = await resp.blob();
        folder.file(`${s.activation_token}.png`, blob);
      } catch {}
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-${selectedBatch}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = ['#', 'Token', 'QR URL', 'Status', 'Customer', 'Listing ID', 'Sold At', 'Assigned At'];
    const rows = signs.map((s, i) => [
      i + 1,
      s.activation_token,
      s.qr_url,
      s.status,
      s.customer_email || '—',
      s.listing_id || '—',
      s.sold_at || '—',
      s.assigned_at || '—',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-${selectedBatch}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(`https://zignoqr.com/activate/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'unassigned': return <Badge variant="secondary">Sin asignar</Badge>;
      case 'sold': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Vendido</Badge>;
      case 'assigned': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Asignado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  // SIGN DETAIL VIEW
  if (selectedBatch) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedBatch(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <h1 className="text-xl font-bold text-foreground">Carteles del batch</h1>
        </div>

        <div className="flex gap-3 mb-4">
          <Button variant="outline" size="sm" onClick={downloadAllPngs}>
            <Download className="h-4 w-4 mr-1" /> Descargar todos los PNGs
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Exportar CSV
          </Button>
        </div>

        {signsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>QR URL</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Fecha venta</TableHead>
                  <TableHead>Fecha asignación</TableHead>
                  <TableHead className="w-12">PNG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signs.map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{s.activation_token}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => copyToken(s.activation_token)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {copiedToken === s.activation_token ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span className="max-w-[120px] truncate">{s.qr_url}</span>
                      </button>
                    </TableCell>
                    <TableCell>{statusBadge(s.status)}</TableCell>
                    <TableCell className="text-sm">{s.customer_email}</TableCell>
                    <TableCell className="text-sm">
                      {s.listing_id ? (
                        <a href={`/admin/listings/${s.listing_id}`} className="text-primary hover:underline text-xs">
                          Ver
                        </a>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(s.sold_at)}</TableCell>
                    <TableCell className="text-sm">{formatDate(s.assigned_at)}</TableCell>
                    <TableCell>
                      {s.png_filename ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => {
                            const { data } = supabase.storage.from('sign-assets').getPublicUrl(s.png_filename!);
                            window.open(data.publicUrl, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Button>
                      ) : generatingSignIds.has(s.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateSingleSign(s)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Generar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  }

  // BATCH LIST VIEW
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Carteles sin asignar</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Generar nuevo batch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generar nuevo batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Idioma</Label>
                <Select value={formLang} onValueChange={setFormLang}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de inmueble</Label>
                <Select value={formPropType} onValueChange={setFormPropType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="office">Oficina</SelectItem>
                    <SelectItem value="commercial">Local Comercial</SelectItem>
                    <SelectItem value="garage">Garaje</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de transacción</Label>
                <Select value={formTxType} onValueChange={setFormTxType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Alquiler</SelectItem>
                    <SelectItem value="sale">Venta</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>¿Espacio para teléfono en cartel?</Label>
                <Switch checked={formPhone} onCheckedChange={setFormPhone} />
              </div>

              <div>
                <Label>Cantidad de carteles</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={formCount}
                  onChange={(e) => setFormCount(Number(e.target.value))}
                />
              </div>

              {genProgress && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Generando carteles…</span>
                    <span>{genProgress.current}/{genProgress.total}</span>
                  </div>
                  <Progress value={(genProgress.current / genProgress.total) * 100} className="h-2" />
                </div>
              )}
              <Button className="w-full" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generar batch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : batches.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No hay batches generados aún.</p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Idioma</TableHead>
                <TableHead>Tipo inmueble</TableHead>
                <TableHead>Transacción</TableHead>
                <TableHead>Tel.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Sin asignar</TableHead>
                <TableHead>Vendidos</TableHead>
                <TableHead>Asignados</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{formatDate(b.created_at)}</TableCell>
                  <TableCell className="uppercase">{b.language}</TableCell>
                  <TableCell>{b.property_type}</TableCell>
                  <TableCell>{b.transaction_type}</TableCell>
                  <TableCell>{b.has_phone_space ? '✓' : '—'}</TableCell>
                  <TableCell>{b.total_count}</TableCell>
                  <TableCell>{b.unassigned_count}</TableCell>
                  <TableCell>{b.sold_count}</TableCell>
                  <TableCell>{b.assigned_count}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => fetchSigns(b.id)}>
                      Ver carteles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminUnassignedSigns;
