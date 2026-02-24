import { useEffect, useRef, useState, useMemo } from 'react';
import { Users, LayoutGrid, Zap } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { getGrowthStats } from '@/lib/growthStats';

const labels: Record<string, Record<string, string>> = {
  clients: {
    en: 'Active clients',
    es: 'Clientes activos',
    fr: 'Clients actifs',
    de: 'Aktive Kunden',
    it: 'Clienti attivi',
    pt: 'Clientes ativos',
    pl: 'Aktywni klienci',
  },
  signs: {
    en: 'Signs deployed',
    es: 'Carteles desplegados',
    fr: 'Panneaux déployés',
    de: 'Schilder eingesetzt',
    it: 'Cartelli posizionati',
    pt: 'Cartazes implantados',
    pl: 'Tabliczki wdrożone',
  },
  leads: {
    en: 'Enquiries generated',
    es: 'Interesados generados',
    fr: 'Demandes générées',
    de: 'Anfragen generiert',
    it: 'Richieste generate',
    pt: 'Interessados gerados',
    pl: 'Zapytania wygenerowane',
  },
};

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return value;
}

const fmt = (n: number) => n.toLocaleString('es-ES');

export const SocialProof = () => {
  const { language } = useLanguage();
  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;
  const stats = useMemo(() => getGrowthStats(), []);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clients = useCountUp(stats.clients, 1800, visible);
  const signs = useCountUp(stats.signs, 1800, visible);
  const leads = useCountUp(stats.leads, 1800, visible);

  const items = [
    { icon: Users, value: clients, label: t('clients') },
    { icon: LayoutGrid, value: signs, label: t('signs') },
    { icon: Zap, value: leads, label: t('leads') },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: '#0F1F3D' }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      <div className="container-wide py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center">
          {items.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <Icon className="w-10 h-10 text-white/80" strokeWidth={1.5} />
              <span
                className="font-display font-extrabold text-white leading-none"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
              >
                {fmt(value)}
              </span>
              <span className="text-base" style={{ color: '#A8C4E8' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
