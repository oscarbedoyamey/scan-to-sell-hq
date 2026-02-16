import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  LISTINGS_QUERY_KEY,
  fetchUserListings,
  fetchListingById,
  fetchListingSigns,
  fetchListingPurchase,
  fetchListingScans,
  fetchDashboardStats,
  fetchDashboardScans,
} from '@/lib/data/listings';

/** All listings for current user */
export function useUserListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, 'user', user?.id],
    queryFn: () => fetchUserListings(user!.id),
    enabled: !!user,
  });
}

/** Single listing by ID */
export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, 'detail', id],
    queryFn: () => fetchListingById(id!),
    enabled: !!id,
  });
}

/** Signs for a specific listing */
export function useListingSigns(listingId: string | undefined, refetchWhilePending = false) {
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, 'signs', listingId],
    queryFn: () => fetchListingSigns(listingId!),
    enabled: !!listingId,
    refetchInterval: refetchWhilePending ? 5000 : false,
  });
}

/** Active purchase for a listing */
export function useListingPurchase(listingId: string | undefined) {
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, 'purchase', listingId],
    queryFn: () => fetchListingPurchase(listingId!),
    enabled: !!listingId,
  });
}

/** Scans for a listing */
export function useListingScans(listingId: string | undefined) {
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, 'scans', listingId],
    queryFn: () => fetchListingScans(listingId!),
    enabled: !!listingId,
  });
}

/** Dashboard stats */
export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, 'dashboard-stats', user?.id],
    queryFn: () => fetchDashboardStats(user!.id),
    enabled: !!user,
  });
}

/** Dashboard scans with range */
export function useDashboardScans(rangeDays: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [LISTINGS_QUERY_KEY, 'dashboard-scans', user?.id, rangeDays],
    queryFn: () => fetchDashboardScans(user!.id, rangeDays),
    enabled: !!user,
  });
}
