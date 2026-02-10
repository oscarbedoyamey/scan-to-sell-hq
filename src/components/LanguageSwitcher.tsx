import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface LangOption {
  code: string;
  name: string;
  flag: string;
}

const DEFAULT_LANGS: LangOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

interface LanguageSwitcherProps {
  current: string;
  onChange: (code: string) => void;
  langs?: LangOption[];
  /** Compact mode shows only flag + code */
  compact?: boolean;
}

export const LanguageSwitcher = ({
  current,
  onChange,
  langs = DEFAULT_LANGS,
  compact = false,
}: LanguageSwitcherProps) => {
  const currentLang = langs.find((l) => l.code === current) || langs[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          {compact ? (
            <>
              <span>{currentLang.flag}</span>
              <span className="text-xs">{currentLang.code.toUpperCase()}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span className="text-sm">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
            </>
          )}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {langs.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`gap-2 ${lang.code === current ? 'bg-accent' : ''}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
