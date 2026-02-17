/**
 * Transparent sessionStorage patch for Supabase auth persistence.
 *
 * Problem: The Supabase client uses sessionStorage for auth tokens.
 * When the user is redirected to Stripe (cross-origin), some browsers
 * clear sessionStorage entirely. This causes session loss on return.
 *
 * Solution: We intercept sessionStorage.setItem/getItem/removeItem for
 * keys matching the Supabase auth pattern (sb-*-auth-token) and mirror
 * them to localStorage. On getItem, if sessionStorage is empty (cleared
 * by the browser), we transparently fall back to localStorage.
 *
 * This is completely invisible to the Supabase SDK — it thinks it's
 * using sessionStorage normally. No backup/restore mechanism needed.
 *
 * MUST be imported before the Supabase client is created.
 */

const SUPABASE_KEY_PATTERN = /^sb-.*-auth-token$/;
const MIRROR_PREFIX = '_ss_mirror_';

const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
const originalGetItem = sessionStorage.getItem.bind(sessionStorage);
const originalRemoveItem = sessionStorage.removeItem.bind(sessionStorage);

sessionStorage.setItem = (key: string, value: string) => {
  originalSetItem(key, value);
  if (SUPABASE_KEY_PATTERN.test(key)) {
    try {
      localStorage.setItem(MIRROR_PREFIX + key, value);
    } catch {
      // localStorage full or unavailable — ignore silently
    }
  }
};

sessionStorage.getItem = (key: string): string | null => {
  const value = originalGetItem(key);
  if (value !== null) return value;

  // sessionStorage was cleared (cross-origin redirect) — try mirror
  if (SUPABASE_KEY_PATTERN.test(key)) {
    const mirrored = localStorage.getItem(MIRROR_PREFIX + key);
    if (mirrored !== null) {
      // Restore to sessionStorage so subsequent reads are fast
      originalSetItem(key, mirrored);
      return mirrored;
    }
  }
  return null;
};

sessionStorage.removeItem = (key: string) => {
  originalRemoveItem(key);
  if (SUPABASE_KEY_PATTERN.test(key)) {
    localStorage.removeItem(MIRROR_PREFIX + key);
  }
};
