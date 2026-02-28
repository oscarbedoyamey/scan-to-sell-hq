import { useEffect, useState, useMemo } from 'react';
import { format, differenceInDays, subDays, addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfDay, startOfWeek, startOfMonth, isBefore, isAfter } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown, Minus, FileText, CreditCard, Activity, DollarSign, Users, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ─── types ───
interface RangeMetric {
  count: number;
  prevCount: number;
  growth: number | null;
}

interface RawRow { created_at: string; updated_at?: string; status?: string; package_id?: string; end_at?: string; amount_eur?: number; occurred_at?: string }

interface CustomMetrics {
  listingsCreated: RangeMetric;
  listingsEdited: RangeMetric;
  subscriptions: RangeMetric;
  subsByPackage: Record<string, RangeMetric>;
  activeSubs: { total: number; byPackage: Record<string, number> };
  revenue: RangeMetric;
  revenueByPackage: Record<string, RangeMetric>;
  leads: RangeMetric;
  scans: RangeMetric;
}

interface TimePoint { label: string; from: Date; to: Date }

// ─── helpers ───
const calcGrowth = (c: number, p: number): number | null => {
  if (p === 0) return c > 0 ? 100 : null;
  return Math.round(((c - p) / p) * 100);
};

const GrowthBadge = ({ value }: { value: number | null }) => {
  if (value === null) return <span className="text-xs text-muted-foreground">N/A</span>;
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-500' : 'text-muted-foreground';
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}><Icon className="h-3 w-3" />{value > 0 ? '+' : ''}{value}%</span>;
};

const StatCard = ({ label, value, prevValue, growth }: { label: string; value: number; prevValue?: number; growth?: number | null }) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    {growth !== undefined && (
      <div className="flex items-center gap-2 mt-2">
        <GrowthBadge value={growth} />
        {prevValue !== undefined && <span className="text-[10px] text-muted-foreground">vs {prevValue} prev</span>}
      </div>
    )}
  </div>
);

const PRESETS = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

const PACKAGE_LABELS: Record<string, string> = { '3m': '3 Months', '6m': '6 Months', '9m': '9 Months', '12m': '12 Months' };

const CHART_COLORS = {
  created: 'hsl(var(--primary))',
  edited: 'hsl(var(--accent))',
  subs: 'hsl(var(--primary))',
  revenue: '#10b981',
  leads: '#f97316',
  scans: '#06b6d4',
  '3m': '#3b82f6',
  '6m': '#8b5cf6',
  '9m': '#f59e0b',
  '12m': '#ef4444',
};

// Build time buckets based on range length
const buildBuckets = (from: Date, to: Date): TimePoint[] => {
  const days = differenceInDays(to, from);
  if (days <= 1) {
    // Hourly buckets (show every 4 hours)
    const buckets: TimePoint[] = [];
    for (let h = 0; h < 24; h += 4) {
      const s = new Date(from);
      s.setHours(h, 0, 0, 0);
      const e = new Date(from);
      e.setHours(h + 4, 0, 0, 0);
      if (isBefore(s, to)) buckets.push({ label: `${String(h).padStart(2, '0')}:00`, from: s, to: e });
    }
    return buckets;
  }
  if (days <= 31) {
    return eachDayOfInterval({ start: from, end: subDays(to, 1) }).map(d => ({
      label: format(d, 'MMM d'),
      from: startOfDay(d),
      to: startOfDay(addDays(d, 1)),
    }));
  }
  if (days <= 120) {
    const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
    return weeks.map((w, i) => {
      const end = i < weeks.length - 1 ? weeks[i + 1] : to;
      return { label: format(w, 'MMM d'), from: w, to: end };
    });
  }
  const months = eachMonthOfInterval({ start: from, end: to });
  return months.map((m, i) => {
    const end = i < months.length - 1 ? months[i + 1] : to;
    return { label: format(m, 'MMM yyyy'), from: m, to: end };
  });
};

const countInBucket = (rows: RawRow[], field: 'created_at' | 'updated_at' | 'occurred_at', from: Date, to: Date, filter?: (r: RawRow) => boolean) => {
  const f = from.toISOString();
  const t = to.toISOString();
  return rows.filter(r => {
    const v = (r as any)[field];
    if (!v || v < f || v >= t) return false;
    return filter ? filter(r) : true;
  }).length;
};

// ─── component ───
const AdminMetrics = () => {
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [data, setData] = useState<CustomMetrics | null>(null);
  const [rawListings, setRawListings] = useState<RawRow[]>([]);
  const [rawPurchases, setRawPurchases] = useState<RawRow[]>([]);
  const [rawLeads, setRawLeads] = useState<RawRow[]>([]);
  const [rawScans, setRawScans] = useState<RawRow[]>([]);
  const [packageMap, setPackageMap] = useState<Record<string, string>>({});
  const [packageKeys, setPackageKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cumulativeListings, setCumulativeListings] = useState(false);
  const [cumulativeSubs, setCumulativeSubs] = useState(false);
  const [cumulativeRevenue, setCumulativeRevenue] = useState(false);
  const [cumulativeScans, setCumulativeScans] = useState(false);

  const rangeDays = Math.max(1, differenceInDays(dateTo, dateFrom));

  const applyPreset = (days: number) => {
    setDateTo(new Date());
    setDateFrom(subDays(new Date(), days));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const db = supabase as any;

      const toISO = dateTo.toISOString();
      const fromISO = dateFrom.toISOString();
      const prevFrom = subDays(dateFrom, rangeDays).toISOString();
      const prevTo = fromISO;
      const nowISO = new Date().toISOString();

      const [{ data: allListings }, { data: allPurchases }, { data: pkgs }, { data: allLeads }, { data: allScans }] = await Promise.all([
        db.from('listings').select('id, created_at, updated_at'),
        db.from('purchases').select('id, created_at, status, package_id, end_at, amount_eur'),
        db.from('packages').select('id, duration_months'),
        db.from('leads').select('id, created_at'),
        db.from('scans').select('id, occurred_at'),
      ]);

      const listings: RawRow[] = allListings || [];
      const purchases: RawRow[] = allPurchases || [];
      const leads: RawRow[] = (allLeads || []).map((l: any) => ({ created_at: l.created_at }));
      const scans: RawRow[] = (allScans || []).map((s: any) => ({ created_at: s.occurred_at, occurred_at: s.occurred_at }));

      const pm: Record<string, string> = {};
      const pkgKeys: string[] = [];
      (pkgs || []).forEach((p: any) => {
        const key = `${p.duration_months}m`;
        pm[p.id] = key;
        if (!pkgKeys.includes(key)) pkgKeys.push(key);
      });
      pkgKeys.sort((a, b) => parseInt(a) - parseInt(b));

      setRawListings(listings);
      setRawPurchases(purchases);
      setRawLeads(leads);
      setRawScans(scans);
      setPackageMap(pm);
      setPackageKeys(pkgKeys);

      const createdIn = (f: string, t: string) => listings.filter(l => l.created_at >= f && l.created_at < t).length;
      const editedIn = (f: string, t: string) => listings.filter(l => {
        if (!l.updated_at || l.updated_at < f || l.updated_at >= t) return false;
        return l.created_at?.substring(0, 10) !== l.updated_at?.substring(0, 10);
      }).length;

      const paidPurchases = purchases.filter(p => p.status === 'paid');
      const paidIn = (f: string, t: string, pk?: string) =>
        paidPurchases.filter(p => {
          if (p.created_at < f || p.created_at >= t) return false;
          if (pk && pm[p.package_id!] !== pk) return false;
          return true;
        }).length;

      const cc = createdIn(fromISO, toISO), cp = createdIn(prevFrom, prevTo);
      const ec = editedIn(fromISO, toISO), ep = editedIn(prevFrom, prevTo);
      const sc = paidIn(fromISO, toISO), sp = paidIn(prevFrom, prevTo);

      const subsByPackage: Record<string, RangeMetric> = {};
      pkgKeys.forEach(k => {
        const c = paidIn(fromISO, toISO, k), p = paidIn(prevFrom, prevTo, k);
        subsByPackage[k] = { count: c, prevCount: p, growth: calcGrowth(c, p) };
      });

      const revenueIn = (f: string, t: string, pk?: string) =>
        paidPurchases.filter(p => {
          if (p.created_at < f || p.created_at >= t) return false;
          if (pk && pm[p.package_id!] !== pk) return false;
          return true;
        }).reduce((sum, p) => sum + (p.amount_eur || 0), 0);

      const rc = revenueIn(fromISO, toISO), rp = revenueIn(prevFrom, prevTo);
      const revenueByPackage: Record<string, RangeMetric> = {};
      pkgKeys.forEach(k => {
        const c = revenueIn(fromISO, toISO, k), p = revenueIn(prevFrom, prevTo, k);
        revenueByPackage[k] = { count: c, prevCount: p, growth: calcGrowth(c, p) };
      });

      const leadsIn = (f: string, t: string) => leads.filter(l => l.created_at >= f && l.created_at < t).length;
      const lc = leadsIn(fromISO, toISO), lp = leadsIn(prevFrom, prevTo);

      const scansIn = (f: string, t: string) => scans.filter(s => s.occurred_at && s.occurred_at >= f && s.occurred_at < t).length;
      const scanC = scansIn(fromISO, toISO), scanP = scansIn(prevFrom, prevTo);

      const activePurchases = paidPurchases.filter(p => p.end_at && p.end_at >= nowISO);
      const activeByPkg: Record<string, number> = {};
      pkgKeys.forEach(k => activeByPkg[k] = 0);
      activePurchases.forEach(p => { const k = pm[p.package_id!]; if (k && activeByPkg[k] !== undefined) activeByPkg[k]++; });

      setData({
        listingsCreated: { count: cc, prevCount: cp, growth: calcGrowth(cc, cp) },
        listingsEdited: { count: ec, prevCount: ep, growth: calcGrowth(ec, ep) },
        subscriptions: { count: sc, prevCount: sp, growth: calcGrowth(sc, sp) },
        subsByPackage,
        activeSubs: { total: activePurchases.length, byPackage: activeByPkg },
        revenue: { count: rc, prevCount: rp, growth: calcGrowth(rc, rp) },
        revenueByPackage,
        leads: { count: lc, prevCount: lp, growth: calcGrowth(lc, lp) },
        scans: { count: scanC, prevCount: scanP, growth: calcGrowth(scanC, scanP) },
      });
      setLoading(false);
    };
    load();
  }, [dateFrom, dateTo, rangeDays]);

  // Build chart data
  const buckets = useMemo(() => buildBuckets(dateFrom, dateTo), [dateFrom, dateTo]);

  const toCumulative = (data: any[], keys: string[]) => {
    const acc: Record<string, number> = {};
    keys.forEach(k => acc[k] = 0);
    return data.map(row => {
      const newRow: any = { label: row.label };
      keys.forEach(k => { acc[k] += row[k] || 0; newRow[k] = acc[k]; });
      return newRow;
    });
  };

  const listingsChartDataRaw = useMemo(() => {
    if (!rawListings.length && !loading) return [];
    return buckets.map(b => ({
      label: b.label,
      Created: countInBucket(rawListings, 'created_at', b.from, b.to),
      Edited: countInBucket(rawListings, 'updated_at', b.from, b.to, r => r.created_at?.substring(0, 10) !== r.updated_at?.substring(0, 10)),
    }));
  }, [buckets, rawListings, loading]);

  const listingsChartData = useMemo(
    () => cumulativeListings ? toCumulative(listingsChartDataRaw, ['Created', 'Edited']) : listingsChartDataRaw,
    [listingsChartDataRaw, cumulativeListings]
  );

  const subsChartDataRaw = useMemo(() => {
    if (!rawPurchases.length && !loading) return [];
    const paid = rawPurchases.filter(p => p.status === 'paid');
    return buckets.map(b => {
      const row: any = { label: b.label };
      row['Total'] = countInBucket(paid, 'created_at', b.from, b.to);
      packageKeys.forEach(k => {
        row[PACKAGE_LABELS[k] || k] = countInBucket(paid, 'created_at', b.from, b.to, r => packageMap[r.package_id!] === k);
      });
      return row;
    });
  }, [buckets, rawPurchases, packageMap, packageKeys, loading]);

  const subsChartKeys = useMemo(() => ['Total', ...packageKeys.map(k => PACKAGE_LABELS[k] || k)], [packageKeys]);
  const subsChartData = useMemo(
    () => cumulativeSubs ? toCumulative(subsChartDataRaw, subsChartKeys) : subsChartDataRaw,
    [subsChartDataRaw, cumulativeSubs, subsChartKeys]
  );

  const sumInBucket = (rows: RawRow[], from: Date, to: Date, filter?: (r: RawRow) => boolean) => {
    const f = from.toISOString();
    const t = to.toISOString();
    return rows.filter(r => {
      if (!r.created_at || r.created_at < f || r.created_at >= t) return false;
      return filter ? filter(r) : true;
    }).reduce((sum, r) => sum + ((r.amount_eur || 0) / 100), 0);
  };

  const revenueChartDataRaw = useMemo(() => {
    if (!rawPurchases.length && !loading) return [];
    const paid = rawPurchases.filter(p => p.status === 'paid');
    return buckets.map(b => {
      const row: any = { label: b.label };
      row['Total'] = Math.round(sumInBucket(paid, b.from, b.to) * 100) / 100;
      packageKeys.forEach(k => {
        row[PACKAGE_LABELS[k] || k] = Math.round(sumInBucket(paid, b.from, b.to, r => packageMap[r.package_id!] === k) * 100) / 100;
      });
      return row;
    });
  }, [buckets, rawPurchases, packageMap, packageKeys, loading]);

  const revenueChartData = useMemo(
    () => cumulativeRevenue ? toCumulative(revenueChartDataRaw, subsChartKeys) : revenueChartDataRaw,
    [revenueChartDataRaw, cumulativeRevenue, subsChartKeys]
  );

  const scansChartDataRaw = useMemo(() => {
    if (!rawScans.length && !loading) return [];
    return buckets.map(b => ({
      label: b.label,
      Scans: countInBucket(rawScans, 'occurred_at', b.from, b.to),
      Leads: countInBucket(rawLeads, 'created_at', b.from, b.to),
    }));
  }, [buckets, rawScans, rawLeads, loading]);

  const scansChartData = useMemo(
    () => cumulativeScans ? toCumulative(scansChartDataRaw, ['Scans', 'Leads']) : scansChartDataRaw,
    [scansChartDataRaw, cumulativeScans]
  );

  const DatePicker = ({ date, onChange }: { date: Date; onChange: (d: Date) => void }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal gap-2 h-9")}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {format(date, 'MMM d, yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(d) => d && onChange(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );

  const chartTooltipStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header + date controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Metrics</h1>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(p => (
            <Button key={p.label} variant="outline" size="sm" className="h-8 text-xs" onClick={() => applyPreset(p.days)}>{p.label}</Button>
          ))}
          <div className="flex items-center gap-1.5">
            <DatePicker date={dateFrom} onChange={setDateFrom} />
            <span className="text-xs text-muted-foreground">→</span>
            <DatePicker date={dateTo} onChange={setDateTo} />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {rangeDays} day{rangeDays !== 1 ? 's' : ''}: {format(dateFrom, 'MMM d, yyyy')} – {format(dateTo, 'MMM d, yyyy')}. Growth compares to the equivalent previous period.
      </p>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
      ) : data ? (
        <>
          {/* ── Listings Created ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" />Listings Created</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="In period" value={data.listingsCreated.count} />
                <StatCard label="Previous period" value={data.listingsCreated.prevCount} />
                <StatCard label="Growth" value={data.listingsCreated.count} growth={data.listingsCreated.growth} prevValue={data.listingsCreated.prevCount} />
              </div>
            </CardContent>
          </Card>

          {/* ── Listings Edited ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-primary" />Listings Edited (excl. creation day)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="In period" value={data.listingsEdited.count} />
                <StatCard label="Previous period" value={data.listingsEdited.prevCount} />
                <StatCard label="Growth" value={data.listingsEdited.count} growth={data.listingsEdited.growth} prevValue={data.listingsEdited.prevCount} />
              </div>
            </CardContent>
          </Card>

          {/* ── Listings Chart ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Listings Over Time</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="cum-listings" className="text-xs text-muted-foreground cursor-pointer">Cumulative</Label>
                <Switch id="cum-listings" checked={cumulativeListings} onCheckedChange={setCumulativeListings} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {cumulativeListings ? (
                    <AreaChart data={listingsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="Created" stroke={CHART_COLORS.created} fill={CHART_COLORS.created} fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="Edited" stroke={CHART_COLORS.edited} fill={CHART_COLORS.edited} fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  ) : (
                    <BarChart data={listingsChartData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Created" fill={CHART_COLORS.created} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Edited" fill={CHART_COLORS.edited} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ── Subscriptions KPIs ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-primary" />New Paid Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Total</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard label="In period" value={data.subscriptions.count} />
                  <StatCard label="Previous period" value={data.subscriptions.prevCount} />
                  <StatCard label="Growth" value={data.subscriptions.count} growth={data.subscriptions.growth} prevValue={data.subscriptions.prevCount} />
                </div>
              </div>
              {packageKeys.map(k => (
                <div key={k}>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{PACKAGE_LABELS[k] || k}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard label="In period" value={data.subsByPackage[k]?.count ?? 0} />
                    <StatCard label="Previous period" value={data.subsByPackage[k]?.prevCount ?? 0} />
                    <StatCard label="Growth" value={data.subsByPackage[k]?.count ?? 0} growth={data.subsByPackage[k]?.growth ?? null} prevValue={data.subsByPackage[k]?.prevCount ?? 0} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Subscriptions Chart ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Subscriptions Over Time</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="cum-subs" className="text-xs text-muted-foreground cursor-pointer">Cumulative</Label>
                <Switch id="cum-subs" checked={cumulativeSubs} onCheckedChange={setCumulativeSubs} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {cumulativeSubs ? (
                    <AreaChart data={subsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="Total" stroke={CHART_COLORS.subs} fill={CHART_COLORS.subs} fillOpacity={0.15} strokeWidth={2} />
                      {packageKeys.map(k => (
                        <Area key={k} type="monotone" dataKey={PACKAGE_LABELS[k] || k} stroke={CHART_COLORS[k as keyof typeof CHART_COLORS] || '#888'} fill={CHART_COLORS[k as keyof typeof CHART_COLORS] || '#888'} fillOpacity={0.1} strokeWidth={1.5} />
                      ))}
                    </AreaChart>
                  ) : (
                    <LineChart data={subsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="Total" stroke={CHART_COLORS.subs} strokeWidth={2} dot={false} />
                      {packageKeys.map(k => (
                        <Line key={k} type="monotone" dataKey={PACKAGE_LABELS[k] || k} stroke={CHART_COLORS[k as keyof typeof CHART_COLORS] || '#888'} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ── Revenue KPIs ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-primary" />Revenue (EUR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Total</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard label="In period" value={Math.round(data.revenue.count / 100)} />
                  <StatCard label="Previous period" value={Math.round(data.revenue.prevCount / 100)} />
                  <StatCard label="Growth" value={Math.round(data.revenue.count / 100)} growth={data.revenue.growth} prevValue={Math.round(data.revenue.prevCount / 100)} />
                </div>
              </div>
              {packageKeys.map(k => (
                <div key={k}>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{PACKAGE_LABELS[k] || k}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard label="In period" value={Math.round((data.revenueByPackage[k]?.count ?? 0) / 100)} />
                    <StatCard label="Previous period" value={Math.round((data.revenueByPackage[k]?.prevCount ?? 0) / 100)} />
                    <StatCard label="Growth" value={Math.round((data.revenueByPackage[k]?.count ?? 0) / 100)} growth={data.revenueByPackage[k]?.growth ?? null} prevValue={Math.round((data.revenueByPackage[k]?.prevCount ?? 0) / 100)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Revenue Chart ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Revenue Over Time (€)</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="cum-rev" className="text-xs text-muted-foreground cursor-pointer">Cumulative</Label>
                <Switch id="cum-rev" checked={cumulativeRevenue} onCheckedChange={setCumulativeRevenue} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {cumulativeRevenue ? (
                    <AreaChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `€${v.toFixed(2)}`} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="Total" stroke={CHART_COLORS.revenue} fill={CHART_COLORS.revenue} fillOpacity={0.15} strokeWidth={2} />
                      {packageKeys.map(k => (
                        <Area key={k} type="monotone" dataKey={PACKAGE_LABELS[k] || k} stroke={CHART_COLORS[k as keyof typeof CHART_COLORS] || '#888'} fill={CHART_COLORS[k as keyof typeof CHART_COLORS] || '#888'} fillOpacity={0.1} strokeWidth={1.5} />
                      ))}
                    </AreaChart>
                  ) : (
                    <BarChart data={revenueChartData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `€${v.toFixed(2)}`} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Total" fill={CHART_COLORS.revenue} radius={[3, 3, 0, 0]} />
                      {packageKeys.map(k => (
                        <Bar key={k} dataKey={PACKAGE_LABELS[k] || k} fill={CHART_COLORS[k as keyof typeof CHART_COLORS] || '#888'} radius={[3, 3, 0, 0]} />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ── Leads & Scans KPIs ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-primary" />Leads Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="In period" value={data.leads.count} />
                <StatCard label="Previous period" value={data.leads.prevCount} />
                <StatCard label="Growth" value={data.leads.count} growth={data.leads.growth} prevValue={data.leads.prevCount} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Eye className="h-4 w-4 text-primary" />QR Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="In period" value={data.scans.count} />
                <StatCard label="Previous period" value={data.scans.prevCount} />
                <StatCard label="Growth" value={data.scans.count} growth={data.scans.growth} prevValue={data.scans.prevCount} />
              </div>
            </CardContent>
          </Card>

          {/* ── Scans & Leads Chart ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Scans & Leads Over Time</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="cum-scans" className="text-xs text-muted-foreground cursor-pointer">Cumulative</Label>
                <Switch id="cum-scans" checked={cumulativeScans} onCheckedChange={setCumulativeScans} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {cumulativeScans ? (
                    <AreaChart data={scansChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="Scans" stroke={CHART_COLORS.scans} fill={CHART_COLORS.scans} fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="Leads" stroke={CHART_COLORS.leads} fill={CHART_COLORS.leads} fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  ) : (
                    <BarChart data={scansChartData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Scans" fill={CHART_COLORS.scans} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Leads" fill={CHART_COLORS.leads} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ── Active Subscriptions ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />Active Subscriptions (now)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total Active" value={data.activeSubs.total} />
                {packageKeys.map(k => (
                  <StatCard key={k} label={`Active ${PACKAGE_LABELS[k] || k}`} value={data.activeSubs.byPackage[k] ?? 0} />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default AdminMetrics;
