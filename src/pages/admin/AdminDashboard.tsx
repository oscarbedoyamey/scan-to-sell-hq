import { Users, FileText, CreditCard, BarChart3 } from 'lucide-react';

const kpis = [
  { label: 'Total Users', value: '—', icon: Users, color: 'text-primary' },
  { label: 'Active Listings', value: '—', icon: FileText, color: 'text-success' },
  { label: 'Revenue (€)', value: '—', icon: CreditCard, color: 'text-accent' },
  { label: 'Scans (30d)', value: '—', icon: BarChart3, color: 'text-primary' },
];

const AdminDashboard = () => {
  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-foreground mb-8">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-3">
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 text-center text-muted-foreground">
        <p>Admin features will be fully implemented in Phase 7.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
