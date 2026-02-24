import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAudit } from '@/hooks/useAdminAudit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, RefreshCw, Calendar, DollarSign } from 'lucide-react';

const AdminPurchaseDetail = () => {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { logAction } = useAdminAudit();
  const [purchase, setPurchase] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Refund dialog
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Extend dialog
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDate, setExtendDate] = useState('');
  const [extendReason, setExtendReason] = useState('');

  const loadData = useCallback(async () => {
    if (!purchaseId) return;
    setLoading(true);
    const db = supabase as any;

    const { data: purch } = await db.from('purchases').select('*').eq('id', purchaseId).maybeSingle();

    if (purch) {
      const [{ data: prof }, { data: lst }] = await Promise.all([
        db.from('profiles').select('id, email, full_name').eq('id', purch.user_id).maybeSingle(),
        purch.listing_id ? db.from('listings').select('id, title, listing_code, status').eq('id', purch.listing_id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      setOwner(prof);
      setListing(lst);
    }

    setPurchase(purch);
    setLoading(false);
  }, [purchaseId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarkRefunded = async () => {
    if (!purchase) return;
    setSaving(true);
    const db = supabase as any;
    const { error } = await db.from('purchases').update({ status: 'refunded' }).eq('id', purchase.id);
    if (error) {
      toast.error('Failed to mark as refunded');
    } else {
      await logAction('mark_purchase_refunded', 'purchase', purchase.id, { previous_status: purchase.status }, refundReason || undefined);
      toast.success('Purchase marked as refunded');
      setRefundOpen(false);
      setRefundReason('');
      loadData();
    }
    setSaving(false);
  };

  const handleExtend = async () => {
    if (!purchase || !extendDate) return;
    setSaving(true);
    const db = supabase as any;
    const { error } = await db.from('purchases').update({ end_at: new Date(extendDate).toISOString() }).eq('id', purchase.id);
    if (error) {
      toast.error('Failed to extend');
    } else {
      await logAction('extend_purchase', 'purchase', purchase.id, { previous_end: purchase.end_at, new_end: extendDate }, extendReason || undefined);
      toast.success('Purchase extended');
      setExtendOpen(false);
      setExtendDate('');
      setExtendReason('');
      loadData();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-4xl">
        <Link to="/admin/purchases" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Purchases
        </Link>
        <p className="text-muted-foreground">Purchase not found.</p>
      </div>
    );
  }

  const statusVariant = (s: string) => {
    if (s === 'paid') return 'default' as const;
    if (s === 'failed') return 'destructive' as const;
    if (s === 'refunded') return 'outline' as const;
    return 'secondary' as const;
  };

  return (
    <div className="max-w-4xl">
      <Link to="/admin/purchases" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Purchases
      </Link>

      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-display text-xl font-bold text-foreground">Purchase</h1>
              <Badge variant={statusVariant(purchase.status)}>{purchase.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{purchase.id}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {purchase.status === 'paid' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setRefundOpen(true)}>
                  <DollarSign className="h-4 w-4 mr-1" /> Mark Refunded
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setExtendDate(purchase.end_at ? purchase.end_at.slice(0, 10) : ''); setExtendOpen(true); }}>
                  <Calendar className="h-4 w-4 mr-1" /> Extend
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">User:</span>{' '}
            {owner ? (
              <Link to={`/admin/users/${owner.id}`} className="text-primary hover:underline">{owner.email}</Link>
            ) : <span className="text-foreground">—</span>}
          </div>
          <div>
            <span className="text-muted-foreground">Listing:</span>{' '}
            {listing ? (
              <Link to={`/admin/listings/${listing.id}`} className="text-primary hover:underline">{listing.title || listing.listing_code}</Link>
            ) : <span className="text-foreground">—</span>}
          </div>
          <div>
            <span className="text-muted-foreground">Package:</span>{' '}
            <span className="text-foreground">{purchase.package_id || '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Amount:</span>{' '}
            <span className="text-foreground font-medium">€{(purchase.amount_eur || 0).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Start:</span>{' '}
            <span className="text-foreground">{purchase.start_at ? new Date(purchase.start_at).toLocaleString() : '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">End:</span>{' '}
            <span className="text-foreground">{purchase.end_at ? new Date(purchase.end_at).toLocaleString() : '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>{' '}
            <span className="text-foreground">{purchase.created_at ? new Date(purchase.created_at).toLocaleString() : '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>{' '}
            <Badge variant={statusVariant(purchase.status)}>{purchase.status}</Badge>
          </div>
        </div>

        {/* Stripe Metadata */}
        <div className="border-t border-border pt-4">
          <h3 className="font-medium text-foreground mb-3">Stripe Metadata</h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Checkout Session ID:</span>{' '}
              <span className="text-foreground font-mono text-xs break-all">{purchase.stripe_checkout_session_id || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Intent ID:</span>{' '}
              <span className="text-foreground font-mono text-xs break-all">{purchase.stripe_payment_intent_id || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mark Refunded Dialog */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Refunded</DialogTitle>
            <DialogDescription>This marks the purchase status as refunded in the database. Ensure the actual Stripe refund has been processed separately.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason (optional)</Label>
            <Textarea className="mt-1" placeholder="Why is this being refunded?" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleMarkRefunded} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Mark Refunded
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Purchase</DialogTitle>
            <DialogDescription>Change the end date of this purchase. This action will be recorded in the audit log.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current End Date</Label>
              <p className="text-sm text-muted-foreground mt-1">{purchase.end_at ? new Date(purchase.end_at).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <Label>New End Date</Label>
              <Input type="date" className="mt-1" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} />
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Textarea className="mt-1" placeholder="Why is this being extended?" value={extendReason} onChange={(e) => setExtendReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendOpen(false)}>Cancel</Button>
            <Button onClick={handleExtend} disabled={!extendDate || saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Extend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPurchaseDetail;
