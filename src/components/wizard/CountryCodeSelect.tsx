import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+40', flag: '🇷🇴', name: 'Romania' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
}

export const CountryCodeSelect = ({ value, onChange }: CountryCodeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className={cn(
          'flex items-center gap-1.5 h-10 px-2.5 rounded-md border border-input bg-background text-sm',
          'hover:bg-muted/50 transition-colors min-w-[90px] justify-between'
        )}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-medium text-foreground">{selected.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2.5 py-1.5 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code + c.name}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left',
                  c.code === value && 'bg-accent/50 font-medium'
                )}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="text-muted-foreground font-mono text-xs w-10">{c.code}</span>
                <span className="text-foreground truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { COUNTRIES };
