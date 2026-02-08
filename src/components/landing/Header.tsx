import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t, languages } = useLanguage();

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - ZIGNO wordmark with red QR module on 'i' */}
          <a href="/" className="flex items-center gap-1">
            <span className="font-display font-bold text-2xl text-foreground tracking-tight">Z</span>
            <span className="font-display font-bold text-2xl text-foreground tracking-tight">I</span>
            <span className="relative font-display font-bold text-2xl text-foreground tracking-tight">
              <span className="invisible">G</span>
              <span className="absolute inset-0 flex items-center justify-center">G</span>
            </span>
            <span className="font-display font-bold text-2xl text-foreground tracking-tight">N</span>
            <span className="font-display font-bold text-2xl text-foreground tracking-tight">O</span>
            {/* Red QR module as dot of 'i' is integrated into the typography */}
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#examples" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.examples}
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.pricing}
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.faq}
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span>{currentLanguage?.flag}</span>
                  <span className="text-sm">{currentLanguage?.code.toUpperCase()}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="gap-2"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm">
              {t.nav.login}
            </Button>
            <Button variant="default" size="sm">
              {t.nav.signup}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {t.nav.howItWorks}
              </a>
              <a href="#examples" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {t.nav.examples}
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {t.nav.pricing}
              </a>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {t.nav.faq}
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="justify-start">
                  {t.nav.login}
                </Button>
                <Button variant="default">
                  {t.nav.signup}
                </Button>
              </div>
              {/* Mobile Language Selector */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      language === lang.code
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {lang.flag} {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
