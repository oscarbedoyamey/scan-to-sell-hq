import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';

/**
 * Sends a custom "carteles_page_view" event for every navigation
 * to /carteles/... routes so it can be marked as a conversion in GA4.
 */
export const CartelesPageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/carteles')) {
      trackEvent('carteles_page_view', {
        page_path: location.pathname,
      });
    }
  }, [location.pathname]);

  return null;
};
