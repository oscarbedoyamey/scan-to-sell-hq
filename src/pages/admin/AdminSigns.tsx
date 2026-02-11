import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAudit } from '@/hooks/useAdminAudit';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const PAGE_SIZE = 20;

const AdminSigns = () => {
  const { logAction } = useAdminAudit();
  const [signs, setSigns] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Unassign dialog
  const [unassignOpen, setUnassignOpen] = useState(false);
  const [unassignSign, setUnassignSign] = useState<any>(null);
  const [unassignReason, setUnassignReason] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSigns = useCallback(async () => {
    setLoading(true);
    const db = supabase as any;

    let query = db
      .from('signs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter === 'assigned') {
      query = query.not('listing_id', 'is', null);
    } else if (statusFilter === 'pool') {
      query = query.is('listing_id', null);
    }

    if (search.trim()) {
      query = query.ilike('sign_code', `%${search.trim()}%`);
    }

    const { data, count } = await query;

    // Fetch listing info for assigned signs
    const listingIds = [...new Set((data || []).filter((s: any) => s.listing_id).map((s: any) => s.listing_id))];
    let listingMap: Record<string, any> = {};
    if (listingIds.length > 0) {
      const { data: listings } = await db.from('listings').select('id, title, listing_code, owner_user_id').in('id', listingIds);
      (listings || []).forEach((l: any) => { listingMap[l.id] = l; });
    }

    setSigns((data || []).map((s: any) => ({ ...s, listing: listingMap[s.listing_id] || null })));
    setTotalCount(count || 0);
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => { loadSigns(); }, [loadSigns]);

  const handleUnassign = async () => {
    if (!unassignSign) return;
    setSaving(true);
    const db = supabase as any;

    await db.from('signs').update({ listing_id: null }).eq('id', unassignSign.id);

    if (unassignSign.listing_id) {
      await db.from('sign_assignments')
        .update({ unassigned_at: new Date().toISOString() })
        .eq('sign_id', unassignSign.id)
        .eq('listing_id', unassignSign.listing_id)
        .is('unassigned_at', null);
    }

    await logAction('unassign_sign', 'sign', unassignSign.id, { listing_id: unassignSign.listing_id }, unassignReason || undefined);
    toast.success('Sign unassigned');
    setUnassignOpen(false);
    setUnassignSign(null);
    setUnassignReason('');
    loadSigns();
    setSaving(false);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Signs</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by sign code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All signs</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="pool">In Pool</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sign Code</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Listing</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Size</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Template</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : signs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No signs found</td></tr>
              ) : signs.map((s: any) => (
                <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-medium text-foreground">{s.sign_code}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.listing_id ? 'default' : 'secondary'}>
                      {s.listing_id ? 'Assigned' : 'Pool'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {s.listing ? (
                      <Link to={`/admin/listings/${s.listing.id}`} className="text-primary hover:underline text-xs">
                        {s.listing.title || s.listing.listing_code}
                      </Link>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.size || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.template_id || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    {s.listing_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setUnassignSign(s); setUnassignOpen(true); }}
                      >
                        Unassign
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Unassign Dialog */}
      <Dialog open={unassignOpen} onOpenChange={setUnassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign Sign</DialogTitle>
            <DialogDescription>
              This will remove sign <span className="font-mono font-medium">{unassignSign?.sign_code}</span> from its current listing and return it to the pool.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason (optional)</Label>
            <Textarea className="mt-1" placeholder="Why are you unassigning this sign?" value={unassignReason} onChange={(e) => setUnassignReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnassignOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleUnassign} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Unassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSigns;
