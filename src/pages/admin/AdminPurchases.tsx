import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 20;

const AdminPurchases = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    const db = supabase as any;

    let query = db
      .from('purchases')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, count } = await query;

    // Fetch user profiles separately
    const userIds = [...new Set((data || []).map((p: any) => p.user_id))];
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await db.from('profiles').select('id, email, full_name').in('id', userIds);
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
    }

    let enriched = (data || []).map((p: any) => ({ ...p, profiles: profileMap[p.user_id] || null }));

    // Client-side search filter on email
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      enriched = enriched.filter((p: any) => p.profiles?.email?.toLowerCase().includes(s));
    }

    setPurchases(enriched);
    setTotalCount(search.trim() ? enriched.length : (count || 0));
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const statusVariant = (s: string) => {
    if (s === 'paid') return 'default';
    if (s === 'failed') return 'destructive';
    if (s === 'refunded') return 'outline';
    return 'secondary';
  };

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Purchases</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Start</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">End</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stripe PI</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={8} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : purchases.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No purchases found</td></tr>
              ) : purchases.map((p: any) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-foreground">{p.profiles?.full_name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{p.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.package_id || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">€{((p.amount_eur || 0) / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.start_at ? new Date(p.start_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.end_at ? new Date(p.end_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[100px]">{p.stripe_payment_intent_id || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
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
    </div>
  );
};

export default AdminPurchases;
