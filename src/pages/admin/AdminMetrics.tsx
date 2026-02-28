import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, FileText, CreditCard, Activity } from 'lucide-react';

interface PeriodMetric {
  last24h: number;
  last7d: number;
  last30d: number;
  growth7d: number | null;
  growth30d: number | null;
}

interface SubMetrics extends PeriodMetric {
  byPackage: Record<string, PeriodMetric>;
}

interface ActiveSubs {
  total: number;
  byPackage: Record<string, number>;
}

interface MetricsData {
  listingsCreated: PeriodMetric;
  listingsEdited: PeriodMetric;
  subscriptions: SubMetrics;
  activeSubs: ActiveSubs;
}

const calcGrowth = (current: number, previous: number): number | null => {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
};

const GrowthBadge = ({ value }: { value: number | null }) => {
  if (value === null) return <span className="text-xs text-muted-foreground">N/A</span>;
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-500' : 'text-muted-foreground';
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {value > 0 ? '+' : ''}{value}%
    </span>
  );
};

const MetricCard = ({ label, value, growth7d, growth30d }: { label: string; value: number | string; growth7d?: number | null; growth30d?: number | null }) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    {(growth7d !== undefined || growth30d !== undefined) && (
      <div className="flex gap-3 mt-2">
        {growth7d !== undefined && <div><span className="text-[10px] text-muted-foreground mr-1">7d:</span><GrowthBadge value={growth7d} /></div>}
        {growth30d !== undefined && <div><span className="text-[10px] text-muted-foreground mr-1">30d:</span><GrowthBadge value={growth30d} /></div>}
      </div>
    )}
  </div>
);

const PeriodRow = ({ label, metric }: { label: string; metric: PeriodMetric }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <MetricCard label="Last 24h" value={metric.last24h} />
      <MetricCard label="Last 7 days" value={metric.last7d} />
      <MetricCard label="Last 30 days" value={metric.last30d} />
      <MetricCard label="Growth 7d" value={metric.growth7d !== null ? `${metric.growth7d > 0 ? '+' : ''}${metric.growth7d}%` : 'N/A'} />
      <MetricCard label="Growth 30d" value={metric.growth30d !== null ? `${metric.growth30d > 0 ? '+' : ''}${metric.growth30d}%` : 'N/A'} />
    </div>
  </div>
);

const PACKAGE_LABELS: Record<string, string> = {
  '3m': '3 Months',
  '6m': '6 Months',
  '9m': '9 Months',
};

const AdminMetrics = () => {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const db = supabase as any;
      const now = Date.now();
      const d24h = new Date(now - 86400000).toISOString();
      const d7d = new Date(now - 7 * 86400000).toISOString();
      const d14d = new Date(now - 14 * 86400000).toISOString();
      const d30d = new Date(now - 30 * 86400000).toISOString();
      const d60d = new Date(now - 60 * 86400000).toISOString();
      const nowISO = new Date(now).toISOString();

      // Fetch all listings with created_at and updated_at
      const { data: allListings } = await db.from('listings').select('id, created_at, updated_at');
      const listings = allListings || [];

      // Listings created
      const createdIn = (from: string, to: string) => listings.filter((l: any) => l.created_at >= from && l.created_at < to).length;
      const created24h = createdIn(d24h, nowISO);
      const created7d = createdIn(d7d, nowISO);
      const created7dPrev = createdIn(d14d, d7d);
      const created30d = createdIn(d30d, nowISO);
      const created30dPrev = createdIn(d60d, d30d);

      // Listings edited (updated but not created same day)
      const editedIn = (from: string, to: string) => listings.filter((l: any) => {
        if (!l.updated_at || l.updated_at < from || l.updated_at >= to) return false;
        // Exclude if created on the same calendar day as updated
        const createdDay = l.created_at?.substring(0, 10);
        const updatedDay = l.updated_at?.substring(0, 10);
        return createdDay !== updatedDay;
      }).length;
      const edited24h = editedIn(d24h, nowISO);
      const edited7d = editedIn(d7d, nowISO);
      const edited7dPrev = editedIn(d14d, d7d);
      const edited30d = editedIn(d30d, nowISO);
      const edited30dPrev = editedIn(d60d, d30d);

      // Fetch purchases with package info
      const { data: allPurchases } = await db.from('purchases').select('id, created_at, status, package_id, end_at');
      const purchases = allPurchases || [];

      // Fetch packages to map id -> duration
      const { data: pkgs } = await db.from('packages').select('id, duration_months');
      const packageMap: Record<string, string> = {};
      (pkgs || []).forEach((p: any) => {
        if (p.duration_months === 3) packageMap[p.id] = '3m';
        else if (p.duration_months === 6) packageMap[p.id] = '6m';
        else if (p.duration_months === 9) packageMap[p.id] = '9m';
        else packageMap[p.id] = `${p.duration_months}m`;
      });

      const paidPurchases = purchases.filter((p: any) => p.status === 'paid');

      const paidIn = (from: string, to: string, pkgKey?: string) =>
        paidPurchases.filter((p: any) => {
          if (p.created_at < from || p.created_at >= to) return false;
          if (pkgKey && packageMap[p.package_id] !== pkgKey) return false;
          return true;
        }).length;

      const buildPeriod = (pkgKey?: string): PeriodMetric => {
        const l24 = paidIn(d24h, nowISO, pkgKey);
        const l7 = paidIn(d7d, nowISO, pkgKey);
        const l7p = paidIn(d14d, d7d, pkgKey);
        const l30 = paidIn(d30d, nowISO, pkgKey);
        const l30p = paidIn(d60d, d30d, pkgKey);
        return { last24h: l24, last7d: l7, last30d: l30, growth7d: calcGrowth(l7, l7p), growth30d: calcGrowth(l30, l30p) };
      };

      const subTotal = buildPeriod();
      const byPackageSubs: Record<string, PeriodMetric> = {};
      ['3m', '6m', '9m'].forEach(k => { byPackageSubs[k] = buildPeriod(k); });

      // Active subscriptions
      const activePurchases = paidPurchases.filter((p: any) => p.end_at && p.end_at >= nowISO);
      const activeTotal = activePurchases.length;
      const activeByPkg: Record<string, number> = { '3m': 0, '6m': 0, '9m': 0 };
      activePurchases.forEach((p: any) => {
        const k = packageMap[p.package_id];
        if (k && activeByPkg[k] !== undefined) activeByPkg[k]++;
      });

      setData({
        listingsCreated: { last24h: created24h, last7d: created7d, last30d: created30d, growth7d: calcGrowth(created7d, created7dPrev), growth30d: calcGrowth(created30d, created30dPrev) },
        listingsEdited: { last24h: edited24h, last7d: edited7d, last30d: edited30d, growth7d: calcGrowth(edited7d, edited7dPrev), growth30d: calcGrowth(edited30d, edited30dPrev) },
        subscriptions: { ...subTotal, byPackage: byPackageSubs },
        activeSubs: { total: activeTotal, byPackage: activeByPkg },
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl space-y-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Metrics</h1>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl space-y-8">
      <h1 className="font-display text-2xl font-bold text-foreground">Metrics</h1>

      {/* Listings Created */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" />Listings Created</CardTitle>
        </CardHeader>
        <CardContent>
          <PeriodRow label="" metric={data.listingsCreated} />
        </CardContent>
      </Card>

      {/* Listings Edited */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-primary" />Listings Edited (excl. creation day)</CardTitle>
        </CardHeader>
        <CardContent>
          <PeriodRow label="" metric={data.listingsEdited} />
        </CardContent>
      </Card>

      {/* New Subscriptions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-primary" />New Paid Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PeriodRow label="Total" metric={data.subscriptions} />
          {['3m', '6m', '9m'].map(k => (
            <PeriodRow key={k} label={PACKAGE_LABELS[k] || k} metric={data.subscriptions.byPackage[k]} />
          ))}
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Total Active" value={data.activeSubs.total} />
            {['3m', '6m', '9m'].map(k => (
              <MetricCard key={k} label={`Active ${PACKAGE_LABELS[k]}`} value={data.activeSubs.byPackage[k]} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMetrics;
