import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAudit } from '@/hooks/useAdminAudit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, FileText, QrCode, CreditCard, Activity, Loader2 } from 'lucide-react';

const AdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const { logAction } = useAdminAudit();
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [signs, setSigns] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const db = supabase as any;

    const load = async () => {
      setLoading(true);
      const [
        { data: prof },
        { data: role },
        { data: lsts },
        { data: prchs },
        { data: logs },
      ] = await Promise.all([
        db.from('profiles').select('*').eq('id', userId).maybeSingle(),
        db.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle(),
        db.from('listings').select('*').eq('owner_user_id', userId).order('created_at', { ascending: false }),
        db.from('purchases').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        db.from('admin_audit_log').select('*').eq('entity_id', userId).eq('entity_type', 'user').order('created_at', { ascending: false }).limit(50),
      ]);

      // Fetch signs for this user's listings
      const listingIds = (lsts || []).map((l: any) => l.id);
      let sgns: any[] = [];
      if (listingIds.length > 0) {
        const { data: signsData } = await db.from('signs').select('*').in('listing_id', listingIds);
        sgns = signsData || [];
      }

      setProfile(prof);
      setIsAdmin(!!role);
      setListings(lsts || []);
      setSigns(sgns);
      setPurchases(prchs || []);
      setAuditLogs(logs || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl">
        <Link to="/admin/users" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  const totalRevenue = purchases.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount_eur || 0), 0);

  const stats = [
    { label: 'Listings', value: listings.length, icon: FileText },
    { label: 'Signs', value: signs.length, icon: QrCode },
    { label: 'Revenue', value: `€${totalRevenue.toFixed(0)}`, icon: CreditCard },
    { label: 'Purchases', value: purchases.length, icon: Activity },
  ];

  return (
    <div className="max-w-6xl">
      <Link to="/admin/users" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl font-bold text-foreground">{profile.full_name || profile.email}</h1>
              {isAdmin && <Badge variant="default">Admin</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ID: {profile.id} · Locale: {profile.locale || 'en'} · Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-muted/50 rounded-xl p-4 text-center">
              <s.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings">
        <TabsList className="mb-4">
          <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          <TabsTrigger value="signs">Signs ({signs.length})</TabsTrigger>
          <TabsTrigger value="purchases">Purchases ({purchases.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <div className="bg-card rounded-2xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">City</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No listings</td></tr>
                ) : listings.map((l: any) => (
                  <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link to={`/admin/listings/${l.id}`} className="hover:underline">{l.title || '(untitled)'}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={l.status === 'active' ? 'default' : 'secondary'}>{l.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.city || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.property_type || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{l.listing_code || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.updated_at ? new Date(l.updated_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="signs">
          <div className="bg-card rounded-2xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sign Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Listing</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Size</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {signs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No signs</td></tr>
                ) : signs.map((s: any) => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-foreground">{s.sign_code}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.listing_id ? 'default' : 'secondary'}>
                        {s.listing_id ? 'Assigned' : 'Pool'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.listings?.title || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.size || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <div className="bg-card rounded-2xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Start</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">End</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stripe</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No purchases</td></tr>
                ) : purchases.map((p: any) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground">{p.package_id || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'paid' ? 'default' : p.status === 'failed' ? 'destructive' : 'secondary'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">€{(p.amount_eur || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.start_at ? new Date(p.start_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.end_at ? new Date(p.end_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[120px]">{p.stripe_payment_intent_id || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Admin Actions on this User</h3>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No admin actions recorded for this user.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm border-b border-border pb-3 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{log.action}</span>
                      {log.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {log.reason}</p>}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="text-xs text-muted-foreground mt-1 bg-muted/50 rounded p-2 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserDetail;
