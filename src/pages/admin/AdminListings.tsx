import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const PAGE_SIZE = 20;

const AdminListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const db = supabase as any;

    let query = db
      .from('listings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%,listing_code.ilike.%${search.trim()}%`);
    }

    const { data, count } = await query;

    // Fetch owner profiles separately
    const ownerIds = [...new Set((data || []).map((l: any) => l.owner_user_id))];
    let profileMap: Record<string, any> = {};
    if (ownerIds.length > 0) {
      const { data: profiles } = await db.from('profiles').select('id, email, full_name').in('id', ownerIds);
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
    }

    setListings((data || []).map((l: any) => ({ ...l, profiles: profileMap[l.owner_user_id] || null })));
    setTotalCount(count || 0);
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const statusVariant = (s: string) => {
    if (s === 'active') return 'default' as const;
    if (s === 'expired') return 'destructive' as const;
    return 'secondary' as const;
  };

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Listings</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, city, or code..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">City</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={8} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No listings found</td></tr>
              ) : listings.map((l: any) => (
                <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{l.title || '(untitled)'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(l.status)}>{l.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{l.city || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.operation_type || '—'} / {l.property_type || '—'}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/users/${l.owner_user_id}`} className="text-primary hover:underline text-xs">
                      {l.profiles?.email || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{l.listing_code || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.updated_at ? new Date(l.updated_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    {l.listing_code && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={`/l/${l.listing_code}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
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
    </div>
  );
};

export default AdminListings;
