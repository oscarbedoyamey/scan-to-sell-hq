import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useState } from 'react';
import zignoLogo from '@/assets/zigno-logo.png';

const navItems = [
  { path: '/app', icon: LayoutDashboard, labelKey: 'dashboard' },
  { path: '/app/listings', icon: FileText, labelKey: 'listings' },
  { path: '/app/settings', icon: Settings, labelKey: 'settings' },
];

const labels: Record<string, Record<string, string>> = {
  dashboard: { en: 'Dashboard', es: 'Panel', fr: 'Tableau de bord', de: 'Dashboard', it: 'Pannello', pt: 'Painel', pl: 'Panel' },
  listings: { en: 'My Listings', es: 'Mis anuncios', fr: 'Mes annonces', de: 'Meine Inserate', it: 'I miei annunci', pt: 'Meus anúncios', pl: 'Moje ogłoszenia' },
  settings: { en: 'Settings', es: 'Ajustes', fr: 'Paramètres', de: 'Einstellungen', it: 'Impostazioni', pt: 'Configurações', pl: 'Ustawienia' },
  admin: { en: 'Admin Panel', es: 'Panel Admin', fr: 'Admin', de: 'Admin', it: 'Admin', pt: 'Admin', pl: 'Admin' },
  logout: { en: 'Log out', es: 'Cerrar sesión', fr: 'Déconnexion', de: 'Abmelden', it: 'Esci', pt: 'Sair', pl: 'Wyloguj' },
  newListing: { en: '+ New Listing', es: '+ Nuevo anuncio', fr: '+ Nouvelle annonce', de: '+ Neues Inserat', it: '+ Nuovo annuncio', pt: '+ Novo anúncio', pl: '+ Nowe ogłoszenie' },
};

export const AppLayout = () => {
  const { profile, isAdmin, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getLabel = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center">
          <img src={zignoLogo} alt="ZIGNO" className="h-8 w-auto" />
        </Link>
      </div>

      {/* New listing CTA */}
      <div className="p-4">
        <Button asChild variant="hero" className="w-full" size="lg">
          <Link to="/app/listings/new">{getLabel('newListing')}</Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
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
            {getLabel(item.labelKey)}
          </Link>
        ))}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Shield className="h-4 w-4" />
            {getLabel('admin')}
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border space-y-3">
        <LanguageSwitcher current={language} onChange={(c) => setLanguage(c as any)} compact />
        <div>
          <p className="text-sm font-medium text-foreground truncate">
            {profile?.full_name || profile?.email || '—'}
          </p>
          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          {getLabel('logout')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-xl z-50">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <img src={zignoLogo} alt="ZIGNO" className="h-6 w-auto" />
          <div className="w-5" />
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
