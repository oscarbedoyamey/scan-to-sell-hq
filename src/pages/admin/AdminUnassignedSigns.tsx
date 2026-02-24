import { useState, useEffect, useCallback } from 'react';
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
import { Plus, Loader2, ArrowLeft, Download, FileSpreadsheet, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
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

      // Generate QR PNGs and upload to storage
      for (const s of signsToInsert) {
        try {
          const pngBuffer = await QRCode.toBuffer(s.qr_url, {
            errorCorrectionLevel: 'H',
            width: 800,
            margin: 2,
            color: { dark: '#0F1F3D', light: '#FFFFFF' },
          });

          const filePath = `signs/${batch.id}/${s.activation_token}.png`;
          await supabase.storage
            .from('sign-assets')
            .upload(filePath, pngBuffer, { contentType: 'image/png', upsert: true });

          await (supabase as any)
            .from('unassigned_signs')
            .update({ png_filename: filePath })
            .eq('activation_token', s.activation_token);
        } catch (qrErr) {
          console.error('QR generation error for', s.activation_token, qrErr);
        }
      }

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
                      {s.png_filename && (
                        <button onClick={() => downloadPng(s)} className="text-primary hover:text-primary/80">
                          <Download className="h-4 w-4" />
                        </button>
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
