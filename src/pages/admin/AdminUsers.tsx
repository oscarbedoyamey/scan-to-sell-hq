import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  locale: string | null;
  created_at: string | null;
  listingsCount?: number;
  signsCount?: number;
  revenue?: number;
  isAdmin?: boolean;
}

const PAGE_SIZE = 20;

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const db = supabase as any;

    let query = db
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.or(`email.ilike.%${search.trim()}%,full_name.ilike.%${search.trim()}%`);
    }

    const { data: profiles, count } = await query;
    setTotalCount(count || 0);

    if (!profiles || profiles.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const userIds = profiles.map((p: any) => p.id);

    // Fetch aggregates in parallel
    const [
      { data: listingCounts },
      { data: signCounts },
      { data: revenueSums },
      { data: adminRoles },
    ] = await Promise.all([
      db.from('listings').select('owner_user_id').in('owner_user_id', userIds),
      db.from('signs').select('listing_id, listings!inner(owner_user_id)').in('listings.owner_user_id', userIds),
      db.from('purchases').select('user_id, amount_eur').eq('status', 'paid').in('user_id', userIds),
      db.from('user_roles').select('user_id, role').eq('role', 'admin').in('user_id', userIds),
    ]);

    // Build count maps
    const listingMap = new Map<string, number>();
    (listingCounts || []).forEach((l: any) => {
      listingMap.set(l.owner_user_id, (listingMap.get(l.owner_user_id) || 0) + 1);
    });

    const revenueMap = new Map<string, number>();
    (revenueSums || []).forEach((p: any) => {
      revenueMap.set(p.user_id, (revenueMap.get(p.user_id) || 0) + (p.amount_eur || 0));
    });

    const adminSet = new Set((adminRoles || []).map((r: any) => r.user_id));

    const enriched: UserRow[] = profiles.map((p: any) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      locale: p.locale,
      created_at: p.created_at,
      listingsCount: listingMap.get(p.id) || 0,
      revenue: revenueMap.get(p.id) || 0,
      isAdmin: adminSet.has(p.id),
    }));

    setUsers(enriched);
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Users</h1>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Locale</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Listings</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Revenue</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No users found</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{u.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <Badge variant="default" className="text-xs">Admin</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Customer</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.locale || 'en'}</td>
                    <td className="px-4 py-3 text-right text-foreground">{u.listingsCount}</td>
                    <td className="px-4 py-3 text-right text-foreground">
                      €{((u.revenue || 0) / 100).toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/admin/users/${u.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
