import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAudit } from '@/hooks/useAdminAudit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, ExternalLink, FileText, QrCode, Users, BarChart3,
  Pause, Play, Archive, AlertTriangle,
} from 'lucide-react';

const AdminListingDetail = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { logAction } = useAdminAudit();
  const [listing, setListing] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [signs, setSigns] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status change dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [saving, setSaving] = useState(false);

  // Unassign dialog
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [unassignReason, setUnassignReason] = useState('');
  const [unassignSignId, setUnassignSignId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    const db = supabase as any;

    const [
      { data: lst },
      { data: sgns },
      { data: asgns },
      { data: lds },
      { data: scn },
    ] = await Promise.all([
      db.from('listings').select('*').eq('id', listingId).maybeSingle(),
      db.from('signs').select('*').eq('listing_id', listingId).order('created_at', { ascending: false }),
      db.from('sign_assignments').select('*').eq('listing_id', listingId).order('assigned_at', { ascending: false }),
      db.from('leads').select('*').eq('listing_id', listingId).order('created_at', { ascending: false }).limit(100),
      db.from('scans').select('*').eq('listing_id', listingId).order('occurred_at', { ascending: false }).limit(200),
    ]);

    if (lst?.owner_user_id) {
      const { data: prof } = await db.from('profiles').select('id, email, full_name').eq('id', lst.owner_user_id).maybeSingle();
      setOwner(prof);
    }

    setListing(lst);
    setSigns(sgns || []);
    setAssignments(asgns || []);
    setLeads(lds || []);
    setScans(scn || []);
    setLoading(false);
  }, [listingId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleChangeStatus = async () => {
    if (!listing || !newStatus) return;
    setSaving(true);
    const db = supabase as any;
    const { error } = await db.from('listings').update({ status: newStatus }).eq('id', listing.id);
    if (error) {
      toast.error('Failed to update status');
    } else {
      await logAction('change_listing_status', 'listing', listing.id, { from: listing.status, to: newStatus }, statusReason || undefined);
      toast.success(`Status changed to ${newStatus}`);
      setStatusDialogOpen(false);
      setStatusReason('');
      loadData();
    }
    setSaving(false);
  };

  const handleUnassignSign = async () => {
    if (!unassignSignId || !listing) return;
    setSaving(true);
    const db = supabase as any;

    // Nullify listing_id on the sign
    await db.from('signs').update({ listing_id: null }).eq('id', unassignSignId);

    // Close the assignment record
    await db.from('sign_assignments')
      .update({ unassigned_at: new Date().toISOString() })
      .eq('sign_id', unassignSignId)
      .eq('listing_id', listing.id)
      .is('unassigned_at', null);

    await logAction('unassign_sign', 'sign', unassignSignId, { listing_id: listing.id }, unassignReason || undefined);
    toast.success('Sign unassigned');
    setUnassignDialogOpen(false);
    setUnassignReason('');
    setUnassignSignId(null);
    loadData();
    setSaving(false);
  };

  const handleForceUnassignAll = async () => {
    if (!listing || signs.length === 0) return;
    setSaving(true);
    const db = supabase as any;
    const signIds = signs.map((s: any) => s.id);

    await db.from('signs').update({ listing_id: null }).in('id', signIds);
    await db.from('sign_assignments')
      .update({ unassigned_at: new Date().toISOString() })
      .eq('listing_id', listing.id)
      .is('unassigned_at', null);

    await logAction('force_unassign_all_signs', 'listing', listing.id, { sign_count: signIds.length }, unassignReason || undefined);
    toast.success(`${signIds.length} sign(s) unassigned`);
    setUnassignDialogOpen(false);
    setUnassignReason('');
    setUnassignSignId(null);
    loadData();
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl">
        <Link to="/admin/listings" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>
        <p className="text-muted-foreground">Listing not found.</p>
      </div>
    );
  }

  const statusVariant = (s: string) => {
    if (s === 'active') return 'default' as const;
    if (s === 'expired') return 'destructive' as const;
    return 'secondary' as const;
  };

  // Scans per day for last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentScans = scans.filter((s: any) => new Date(s.occurred_at) >= thirtyDaysAgo);
  const conversionRate = recentScans.length > 0 ? ((leads.length / recentScans.length) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-6xl">
      <Link to="/admin/listings" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Listings
      </Link>

      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-display text-xl font-bold text-foreground">{listing.title || '(untitled)'}</h1>
              <Badge variant={statusVariant(listing.status)}>{listing.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {listing.operation_type || '—'} · {listing.property_type || '—'} · {listing.city || '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Code: <span className="font-mono">{listing.listing_code || '—'}</span> · Owner:{' '}
              {owner ? (
                <Link to={`/admin/users/${owner.id}`} className="text-primary hover:underline">{owner.email}</Link>
              ) : '—'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {listing.listing_code && (
              <Button asChild variant="outline" size="sm">
                <a href={`/l/${listing.listing_code}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" /> View Public
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setNewStatus(listing.status === 'active' ? 'paused' : 'active'); setStatusDialogOpen(true); }}
            >
              {listing.status === 'active' ? <><Pause className="h-4 w-4 mr-1" /> Pause</> : <><Play className="h-4 w-4 mr-1" /> Activate</>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setNewStatus(''); setStatusDialogOpen(true); }}
            >
              <Archive className="h-4 w-4 mr-1" /> Change Status
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Signs', value: signs.length, icon: QrCode },
            { label: 'Leads', value: leads.length, icon: Users },
            { label: 'Scans (30d)', value: recentScans.length, icon: BarChart3 },
            { label: 'Conversion', value: `${conversionRate}%`, icon: FileText },
          ].map((s) => (
            <div key={s.label} className="bg-muted/50 rounded-xl p-4 text-center">
              <s.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signs">Signs ({signs.length})</TabsTrigger>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-medium text-foreground">Listing Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ['Title', listing.title],
                ['City', listing.city],
                ['Region', listing.region],
                ['Country', listing.country],
                ['Price (Sale)', listing.price_sale ? `€${Number(listing.price_sale).toLocaleString()}` : '—'],
                ['Price (Rent)', listing.price_rent ? `€${Number(listing.price_rent).toLocaleString()}/mo` : '—'],
                ['Currency', listing.currency],
                ['Bedrooms', listing.bedrooms],
                ['Bathrooms', listing.bathrooms],
                ['Built Area', listing.built_area_m2 ? `${listing.built_area_m2} m²` : '—'],
                ['Plot Area', listing.plot_area_m2 ? `${listing.plot_area_m2} m²` : '—'],
                ['Condition', listing.condition],
                ['Energy Rating', listing.energy_rating],
                ['Year Built', listing.year_built],
                ['Reference Code', listing.reference_code],
                ['Contact Name', listing.contact_name],
                ['Contact Email', listing.contact_email],
                ['Contact Phone', listing.contact_phone],
                ['Auto-Renew', listing.auto_renew ? 'Yes' : 'No'],
                ['Created', listing.created_at ? new Date(listing.created_at).toLocaleString() : '—'],
                ['Updated', listing.updated_at ? new Date(listing.updated_at).toLocaleString() : '—'],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <span className="text-muted-foreground">{label}:</span>{' '}
                  <span className="text-foreground">{value || '—'}</span>
                </div>
              ))}
            </div>
            {listing.description && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">Description:</span>
                <p className="text-sm text-foreground mt-1 whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{listing.description}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="signs">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {signs.length > 0 && (
              <div className="px-4 py-3 border-b border-border flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { setUnassignSignId(null); setUnassignDialogOpen(true); }}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" /> Force Unassign All
                </Button>
              </div>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sign Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Size</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Orientation</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Template</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {signs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No signs assigned</td></tr>
                ) : signs.map((s: any) => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-foreground">{s.sign_code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.size || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.orientation || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.template_id || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setUnassignSignId(s.id); setUnassignDialogOpen(true); }}
                      >
                        Unassign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Assignment History */}
            {assignments.length > 0 && (
              <div className="border-t border-border p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Assignment History</h4>
                <div className="space-y-2">
                  {assignments.map((a: any) => (
                    <div key={a.id} className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full ${a.unassigned_at ? 'bg-muted-foreground' : 'bg-primary'}`} />
                      <span className="font-mono">{a.sign_id.slice(0, 8)}…</span>
                      <span>Assigned: {new Date(a.assigned_at).toLocaleDateString()}</span>
                      {a.unassigned_at && <span>→ Unassigned: {new Date(a.unassigned_at).toLocaleDateString()}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No leads yet</td></tr>
                ) : leads.map((l: any) => (
                  <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground">{l.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.email || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{l.message || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            <h3 className="font-medium text-foreground">Scan Analytics (Last 30 Days)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{recentScans.length}</p>
                <p className="text-xs text-muted-foreground">Total Scans</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                <p className="text-xs text-muted-foreground">Leads Captured</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>

            {/* Top referrers */}
            {recentScans.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Top Devices</h4>
                <div className="space-y-1">
                  {Object.entries(
                    recentScans.reduce((acc: Record<string, number>, s: any) => {
                      const dev = s.device || 'unknown';
                      acc[dev] = (acc[dev] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([device, count]) => (
                      <div key={device} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{device}</span>
                        <span className="text-foreground font-medium">{count as number}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Change Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Listing Status</DialogTitle>
            <DialogDescription>Update the status of this listing. This action will be recorded in the audit log.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Status</Label>
              <p className="text-sm text-muted-foreground mt-1">{listing.status}</p>
            </div>
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Textarea
                className="mt-1"
                placeholder="Why is this status being changed?"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeStatus} disabled={!newStatus || newStatus === listing.status || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Dialog */}
      <Dialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{unassignSignId ? 'Unassign Sign' : 'Force Unassign All Signs'}</DialogTitle>
            <DialogDescription>
              {unassignSignId
                ? 'This will remove the sign from this listing and return it to the pool.'
                : `This will unassign all ${signs.length} sign(s) from this listing.`}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason (optional)</Label>
            <Textarea
              className="mt-1"
              placeholder="Why are you unassigning?"
              value={unassignReason}
              onChange={(e) => setUnassignReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnassignDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={unassignSignId ? handleUnassignSign : handleForceUnassignAll}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {unassignSignId ? 'Unassign' : 'Unassign All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminListingDetail;
