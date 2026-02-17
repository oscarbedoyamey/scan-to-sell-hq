/**
 * Utilities to persist the Supabase session to localStorage
 * before external redirects (e.g. Stripe checkout) and restore
 * it on return, since sessionStorage is lost on some browsers
 * during cross-origin navigations.
 */

const BACKUP_KEY = 'zigno_session_backup';

interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

export function backupSession() {
  // Find the supabase auth token in sessionStorage
  const keys = Object.keys(sessionStorage).filter(
    (k) => k.startsWith('sb-') && k.includes('-auth-token')
  );
  if (keys.length === 0) return;

  // Extract the actual tokens from the stored session data
  for (const k of keys) {
    const raw = sessionStorage.getItem(k);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const tokens: SessionTokens = {
        access_token: parsed.access_token || parsed.currentSession?.access_token,
        refresh_token: parsed.refresh_token || parsed.currentSession?.refresh_token,
      };
      if (tokens.access_token && tokens.refresh_token) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(tokens));
        console.log('[SessionBackup] Session backed up before redirect');
        return;
      }
    } catch {
      // try next key
    }
  }
}

/**
 * Returns the backed-up session tokens if available, or null.
 * Cleans up the backup after reading.
 */
export function getBackedUpTokens(): SessionTokens | null {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) return null;

  try {
    const tokens = JSON.parse(raw) as SessionTokens;
    if (tokens.access_token && tokens.refresh_token) {
      localStorage.removeItem(BACKUP_KEY);
      console.log('[SessionBackup] Tokens retrieved from backup');
      return tokens;
    }
  } catch {
    // corrupted
  }
  localStorage.removeItem(BACKUP_KEY);
  return null;
}

export function clearSessionBackup() {
  localStorage.removeItem(BACKUP_KEY);
}
