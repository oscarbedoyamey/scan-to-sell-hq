import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { LISTINGS_QUERY_KEY } from '@/lib/data/listings';
import { SIGNS_QUERY_KEY } from '@/lib/data/signs';

/**
 * Provides cache invalidation helpers to be called after any listing/sign mutation.
 * This ensures ALL tabs/pages see fresh data.
 */
export function useListingMutations() {
  const queryClient = useQueryClient();

  /** Invalidate all listing-related queries */
  const invalidateListings = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY] });
  }, [queryClient]);

  /** Invalidate a specific listing detail + its sub-resources */
  const invalidateListingDetail = useCallback(
    (listingId: string) => {
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY, 'detail', listingId] });
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY, 'signs', listingId] });
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY, 'purchase', listingId] });
      queryClient.invalidateQueries({ queryKey: [LISTINGS_QUERY_KEY, 'scans', listingId] });
    },
    [queryClient]
  );

  /** Invalidate signs (MySigns page + per-listing signs) */
  const invalidateSigns = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [SIGNS_QUERY_KEY] });
    // Also invalidate listing signs sub-queries
    queryClient.invalidateQueries({
      queryKey: [LISTINGS_QUERY_KEY, 'signs'],
    });
  }, [queryClient]);

  /** Invalidate everything (after create/delete/major change) */
  const invalidateAll = useCallback(() => {
    invalidateListings();
    invalidateSigns();
  }, [invalidateListings, invalidateSigns]);

  return {
    invalidateListings,
    invalidateListingDetail,
    invalidateSigns,
    invalidateAll,
  };
}
