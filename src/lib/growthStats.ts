/**
 * Deterministic daily growth stats for social proof counters.
 * Uses a seeded PRNG so the same day always produces the same numbers.
 */

const BASE_DATE = new Date(2026, 1, 24); // Feb 24, 2026
const BASE_SIGNS = 4800;

// mulberry32 seeded PRNG
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.max(0, Math.floor((utcB - utcA) / msPerDay));
}

export interface GrowthStats {
  clients: number;
  signs: number;
  leads: number;
}

export function getGrowthStats(today: Date = new Date()): GrowthStats {
  const days = daysBetween(BASE_DATE, today);
  let totalSigns = BASE_SIGNS;

  for (let i = 0; i < days; i++) {
    const d = new Date(BASE_DATE);
    d.setDate(d.getDate() + i + 1);
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const rng = mulberry32(seed);
    const increment = 30 + Math.floor(rng() * 46); // 30–75
    totalSigns += increment;
  }

  return {
    clients: Math.round(totalSigns / 2.2),
    signs: totalSigns,
    leads: Math.round(totalSigns * 11.3),
  };
}
