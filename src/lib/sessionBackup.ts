/**
 * Utilities to persist the Supabase session to localStorage
 * before external redirects (e.g. Stripe checkout) and restore
 * it on return, since sessionStorage is lost on some browsers
 * during cross-origin navigations.
 */

const BACKUP_KEY = 'zigno_session_backup';

export function backupSession() {
  // Copy all supabase auth keys from sessionStorage to localStorage
  const keys = Object.keys(sessionStorage).filter(
    (k) => k.startsWith('sb-') && k.includes('-auth-token')
  );
  if (keys.length === 0) return;

  const backup: Record<string, string> = {};
  for (const k of keys) {
    const v = sessionStorage.getItem(k);
    if (v) backup[k] = v;
  }
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
}

export function restoreSession(): boolean {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) return false;

  try {
    const backup = JSON.parse(raw) as Record<string, string>;
    let restored = false;
    for (const [k, v] of Object.entries(backup)) {
      // Only restore if sessionStorage doesn't already have it
      if (!sessionStorage.getItem(k)) {
        sessionStorage.setItem(k, v);
        restored = true;
      }
    }
    // Clean up backup after restoration
    localStorage.removeItem(BACKUP_KEY);
    return restored;
  } catch {
    localStorage.removeItem(BACKUP_KEY);
    return false;
  }
}

export function clearSessionBackup() {
  localStorage.removeItem(BACKUP_KEY);
}
