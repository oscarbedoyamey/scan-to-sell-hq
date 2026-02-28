import { useEffect, useState } from 'react';
import { format, differenceInDays, startOfDay, subDays } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown, Minus, FileText, CreditCard, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface RangeMetric {
  count: number;
  prevCount: number;
  growth: number | null;
}

interface CustomMetrics {
  listingsCreated: RangeMetric;
  listingsEdited: RangeMetric;
  subscriptions: RangeMetric;
  subsByPackage: Record<string, RangeMetric>;
  activeSubs: { total: number; byPackage: Record<string, number> };
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

const StatCard = ({ label, value, prevValue, growth }: { label: string; value: number; prevValue?: number; growth?: number | null }) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    {growth !== undefined && (
      <div className="flex items-center gap-2 mt-2">
        <GrowthBadge value={growth} />
        {prevValue !== undefined && (
          <span className="text-[10px] text-muted-foreground">vs {prevValue} prev</span>
        )}
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

const PACKAGE_LABELS: Record<string, string> = {
  '3m': '3 Months',
  '6m': '6 Months',
  '9m': '9 Months',
};

const AdminMetrics = () => {
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [data, setData] = useState<CustomMetrics | null>(null);
  const [loading, setLoading] = useState(true);

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

      const [{ data: allListings }, { data: allPurchases }, { data: pkgs }] = await Promise.all([
        db.from('listings').select('id, created_at, updated_at'),
        db.from('purchases').select('id, created_at, status, package_id, end_at'),
        db.from('packages').select('id, duration_months'),
      ]);

      const listings = allListings || [];
      const purchases = allPurchases || [];

      const packageMap: Record<string, string> = {};
      (pkgs || []).forEach((p: any) => {
        if (p.duration_months === 3) packageMap[p.id] = '3m';
        else if (p.duration_months === 6) packageMap[p.id] = '6m';
        else if (p.duration_months === 9) packageMap[p.id] = '9m';
        else packageMap[p.id] = `${p.duration_months}m`;
      });

      // Listings created
      const createdIn = (from: string, to: string) => listings.filter((l: any) => l.created_at >= from && l.created_at < to).length;
      const createdCount = createdIn(fromISO, toISO);
      const createdPrev = createdIn(prevFrom, prevTo);

      // Listings edited (excl. creation day)
      const editedIn = (from: string, to: string) => listings.filter((l: any) => {
        if (!l.updated_at || l.updated_at < from || l.updated_at >= to) return false;
        return l.created_at?.substring(0, 10) !== l.updated_at?.substring(0, 10);
      }).length;
      const editedCount = editedIn(fromISO, toISO);
      const editedPrev = editedIn(prevFrom, prevTo);

      // Paid purchases
      const paidPurchases = purchases.filter((p: any) => p.status === 'paid');
      const paidIn = (from: string, to: string, pkgKey?: string) =>
        paidPurchases.filter((p: any) => {
          if (p.created_at < from || p.created_at >= to) return false;
          if (pkgKey && packageMap[p.package_id] !== pkgKey) return false;
          return true;
        }).length;

      const subsCount = paidIn(fromISO, toISO);
      const subsPrev = paidIn(prevFrom, prevTo);

      const subsByPackage: Record<string, RangeMetric> = {};
      ['3m', '6m', '9m'].forEach(k => {
        const c = paidIn(fromISO, toISO, k);
        const p = paidIn(prevFrom, prevTo, k);
        subsByPackage[k] = { count: c, prevCount: p, growth: calcGrowth(c, p) };
      });

      // Active subs (as of now)
      const activePurchases = paidPurchases.filter((p: any) => p.end_at && p.end_at >= nowISO);
      const activeByPkg: Record<string, number> = { '3m': 0, '6m': 0, '9m': 0 };
      activePurchases.forEach((p: any) => {
        const k = packageMap[p.package_id];
        if (k && activeByPkg[k] !== undefined) activeByPkg[k]++;
      });

      setData({
        listingsCreated: { count: createdCount, prevCount: createdPrev, growth: calcGrowth(createdCount, createdPrev) },
        listingsEdited: { count: editedCount, prevCount: editedPrev, growth: calcGrowth(editedCount, editedPrev) },
        subscriptions: { count: subsCount, prevCount: subsPrev, growth: calcGrowth(subsCount, subsPrev) },
        subsByPackage,
        activeSubs: { total: activePurchases.length, byPackage: activeByPkg },
      });
      setLoading(false);
    };
    load();
  }, [dateFrom, dateTo, rangeDays]);

  const DatePicker = ({ date, onChange, label }: { date: Date; onChange: (d: Date) => void; label: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal gap-2 h-9", !date && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {format(date, 'MMM d, yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && onChange(d)}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Metrics</h1>

        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(p => (
            <Button key={p.label} variant="outline" size="sm" className="h-8 text-xs" onClick={() => applyPreset(p.days)}>
              {p.label}
            </Button>
          ))}
          <div className="flex items-center gap-1.5">
            <DatePicker date={dateFrom} onChange={setDateFrom} label="From" />
            <span className="text-xs text-muted-foreground">→</span>
            <DatePicker date={dateTo} onChange={setDateTo} label="To" />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {rangeDays} day{rangeDays !== 1 ? 's' : ''}: {format(dateFrom, 'MMM d, yyyy')} – {format(dateTo, 'MMM d, yyyy')}. Growth compares to the equivalent previous period.
      </p>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : data ? (
        <>
          {/* Listings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" />Listings Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="In period" value={data.listingsCreated.count} />
                <StatCard label="Previous period" value={data.listingsCreated.prevCount} />
                <StatCard label="Growth" value={data.listingsCreated.count} growth={data.listingsCreated.growth} prevValue={data.listingsCreated.prevCount} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-primary" />Listings Edited (excl. creation day)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="In period" value={data.listingsEdited.count} />
                <StatCard label="Previous period" value={data.listingsEdited.prevCount} />
                <StatCard label="Growth" value={data.listingsEdited.count} growth={data.listingsEdited.growth} prevValue={data.listingsEdited.prevCount} />
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions */}
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
              {['3m', '6m', '9m'].map(k => (
                <div key={k}>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{PACKAGE_LABELS[k]}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard label="In period" value={data.subsByPackage[k].count} />
                    <StatCard label="Previous period" value={data.subsByPackage[k].prevCount} />
                    <StatCard label="Growth" value={data.subsByPackage[k].count} growth={data.subsByPackage[k].growth} prevValue={data.subsByPackage[k].prevCount} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />Active Subscriptions (now)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total Active" value={data.activeSubs.total} />
                {['3m', '6m', '9m'].map(k => (
                  <StatCard key={k} label={`Active ${PACKAGE_LABELS[k]}`} value={data.activeSubs.byPackage[k]} />
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
