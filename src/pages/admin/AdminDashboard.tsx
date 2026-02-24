import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, CreditCard, BarChart3, QrCode, AlertTriangle, TrendingUp } from 'lucide-react';

interface KpiData {
  totalUsers: number;
  activeListings: number;
  totalRevenue: number;
  scans30d: number;
  totalSigns: number;
  expiringSoon: number;
  pendingPurchases: number;
  leads30d: number;
}

const AdminDashboard = () => {
  const [kpis, setKpis] = useState<KpiData>({
    totalUsers: 0,
    activeListings: 0,
    totalRevenue: 0,
    scans30d: 0,
    totalSigns: 0,
    expiringSoon: 0,
    pendingPurchases: 0,
    leads30d: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const db = supabase as any;

      const [
        { count: totalUsers },
        { count: activeListings },
        { data: paidPurchases },
        { count: scans30d },
        { count: totalSigns },
        { count: expiringSoon },
        { count: pendingPurchases },
        { count: leads30d },
        { data: auditLogs },
      ] = await Promise.all([
        db.from('profiles').select('id', { count: 'exact', head: true }),
        db.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        db.from('purchases').select('amount_eur').eq('status', 'paid'),
        db.from('scans').select('id', { count: 'exact', head: true })
          .gte('occurred_at', new Date(Date.now() - 30 * 86400000).toISOString()),
        db.from('signs').select('id', { count: 'exact', head: true }),
        db.from('purchases').select('id', { count: 'exact', head: true })
          .eq('status', 'paid')
          .lte('end_at', new Date(Date.now() + 14 * 86400000).toISOString())
          .gte('end_at', new Date().toISOString()),
        db.from('purchases').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        db.from('leads').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
        db.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalRevenue = (paidPurchases || []).reduce((sum: number, p: any) => sum + (p.amount_eur || 0), 0);

      setKpis({
        totalUsers: totalUsers || 0,
        activeListings: activeListings || 0,
        totalRevenue,
        scans30d: scans30d || 0,
        totalSigns: totalSigns || 0,
        expiringSoon: expiringSoon || 0,
        pendingPurchases: pendingPurchases || 0,
        leads30d: leads30d || 0,
      });
      setRecentActivity(auditLogs || []);
      setLoading(false);
    };
    load();
  }, []);

  const kpiCards = [
    { label: 'Total Users', value: kpis.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Active Listings', value: kpis.activeListings, icon: FileText, color: 'text-success' },
    { label: 'Revenue (€)', value: `€${kpis.totalRevenue.toFixed(0)}`, icon: CreditCard, color: 'text-accent' },
    { label: 'Scans (30d)', value: kpis.scans30d, icon: BarChart3, color: 'text-primary' },
    { label: 'Total Signs', value: kpis.totalSigns, icon: QrCode, color: 'text-muted-foreground' },
    { label: 'Expiring (14d)', value: kpis.expiringSoon, icon: AlertTriangle, color: kpis.expiringSoon > 0 ? 'text-destructive' : 'text-muted-foreground' },
    { label: 'Pending Purchases', value: kpis.pendingPurchases, icon: TrendingUp, color: kpis.pendingPurchases > 0 ? 'text-accent' : 'text-muted-foreground' },
    { label: 'Leads (30d)', value: kpis.leads30d, icon: Users, color: 'text-success' },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-foreground mb-8">Admin Dashboard</h1>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent audit activity */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Admin Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin actions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 text-sm border-b border-border pb-3 last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">{log.action}</span>
                  <span className="text-muted-foreground"> on {log.entity_type}</span>
                  {log.entity_id && <span className="text-muted-foreground text-xs ml-1">({log.entity_id})</span>}
                  {log.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {log.reason}</p>}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
