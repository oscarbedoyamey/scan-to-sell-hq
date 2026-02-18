/**
 * App version check — forces logout when version changes (e.g. after a deploy).
 * Bump APP_VERSION to invalidate all existing sessions.
 */
const APP_VERSION = '1';
const VERSION_KEY = 'zigno_app_version';

export const checkAppVersion = () => {
  const stored = localStorage.getItem(VERSION_KEY);
  if (stored && stored !== APP_VERSION) {
    // Version changed — clear all auth data
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-') || key.startsWith('_ss_mirror_')) {
        localStorage.removeItem(key);
      }
    }
    sessionStorage.clear();
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    return true; // session was cleared
  }
  localStorage.setItem(VERSION_KEY, APP_VERSION);
  return false;
};
