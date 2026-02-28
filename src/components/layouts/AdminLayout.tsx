import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Palette,
  QrCode,
  Package,
  BarChart3,
  ArrowLeft,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import zignoLogo from '@/assets/zigno-logo.png';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/listings', icon: FileText, label: 'Listings' },
  { path: '/admin/purchases', icon: CreditCard, label: 'Purchases' },
  { path: '/admin/signs', icon: QrCode, label: 'Signs' },
  { path: '/admin/templates', icon: Palette, label: 'Templates' },
  { path: '/admin/unassigned-signs', icon: Package, label: 'Unassigned Signs' },
  { path: '/admin/metrics', icon: BarChart3, label: 'Metrics' },
];

export const AdminLayout = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo + Admin badge */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src={zignoLogo} alt="ZIGNO" className="h-8 w-auto" />
        </Link>
        <span className="mt-2 inline-block text-xs font-bold uppercase tracking-wider bg-accent text-accent-foreground px-2 py-0.5 rounded">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Back to app + logout */}
      <div className="p-4 border-t border-border space-y-2">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Link to="/app">
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </Button>
        <div className="mb-2">
          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-xl z-50">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64">
        <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold text-foreground">Admin Panel</span>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
