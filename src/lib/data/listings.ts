import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ListingWithSignCount = Tables<'listings'> & { sign_count?: number };

export const LISTINGS_QUERY_KEY = 'listings';

export async function fetchUserListings(userId: string): Promise<ListingWithSignCount[]> {
  const { data, error } = await (supabase as any)
    .from('listings')
    .select('*, signs(id)')
    .eq('owner_user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((l: any) => ({
    ...l,
    sign_count: Array.isArray(l.signs) ? l.signs.length : 0,
    signs: undefined,
  }));
}

export async function fetchListingById(id: string): Promise<Tables<'listings'> | null> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchListingSigns(listingId: string): Promise<Tables<'signs'>[]> {
  const { data, error } = await supabase
    .from('signs')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchListingPurchase(listingId: string): Promise<Tables<'purchases'> | null> {
  const { data, error } = await (supabase as any)
    .from('purchases')
    .select('*')
    .eq('listing_id', listingId)
    .eq('status', 'paid')
    .order('end_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchListingScans(listingId: string) {
  const { data, error } = await (supabase as any)
    .from('scans')
    .select('occurred_at')
    .eq('listing_id', listingId)
    .order('occurred_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchDashboardStats(userId: string) {
  const [{ count: activeCount }, { count: expiringCount }] = await Promise.all([
    (supabase as any)
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('owner_user_id', userId)
      .eq('status', 'active'),
    (() => {
      const in30 = new Date();
      in30.setDate(in30.getDate() + 30);
      return (supabase as any)
        .from('purchases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'paid')
        .lte('end_at', in30.toISOString())
        .gte('end_at', new Date().toISOString());
    })(),
  ]);

  return { activeCount: activeCount || 0, expiringCount: expiringCount || 0 };
}

export async function fetchDashboardScans(userId: string, rangeDays: number) {
  const since = new Date();
  since.setDate(since.getDate() - rangeDays);

  const { data: listings } = await (supabase as any)
    .from('listings')
    .select('id')
    .eq('owner_user_id', userId);

  if (!listings || listings.length === 0) return [];

  const ids = listings.map((l: any) => l.id);
  const { data, error } = await (supabase as any)
    .from('scans')
    .select('occurred_at, listing_id')
    .in('listing_id', ids)
    .gte('occurred_at', since.toISOString())
    .order('occurred_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
