/**
 * Thin wrapper around gtag / dataLayer for custom GA4 events.
 * Safe to call even if gtag hasn't loaded yet.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>,
) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
  // Also push to dataLayer for GTM triggers
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
};
