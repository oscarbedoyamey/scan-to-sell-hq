import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Sign = Database['public']['Tables']['signs']['Row'];
type SignAssignment = Database['public']['Tables']['sign_assignments']['Row'];

export interface SignWithAssignment extends Sign {
  listing?: {
    title: string;
    listing_code: string;
  };
  latest_assignment?: SignAssignment;
}

export const SIGNS_QUERY_KEY = 'signs';

export async function fetchUserSigns(userId: string): Promise<SignWithAssignment[]> {
  // Get user's listings first
  const { data: userListings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, listing_code')
    .eq('owner_user_id', userId);

  if (listingsError) throw listingsError;

  const userListingIds = new Set(userListings?.map(l => l.id) || []);

  // Get signs for user's listings
  const { data: signsData, error: signsError } = await supabase
    .from('signs')
    .select('*')
    .or(`listing_id.is.null,listing_id.not.is.null`);

  if (signsError) throw signsError;

  const filteredSigns = (signsData || []).filter(
    sign => !sign.listing_id || userListingIds.has(sign.listing_id)
  );

  // Enrich with listing info and assignments
  const enriched = await Promise.all(
    filteredSigns.map(async (sign) => {
      let listing: SignWithAssignment['listing'];
      if (sign.listing_id) {
        const listingData = userListings?.find(l => l.id === sign.listing_id);
        if (listingData) {
          listing = {
            title: listingData.title || 'Untitled',
            listing_code: listingData.listing_code || '',
          };
        }
      }

      const { data: assignmentData } = await supabase
        .from('sign_assignments')
        .select('*')
        .eq('sign_id', sign.id)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        ...sign,
        listing,
        latest_assignment: assignmentData || undefined,
      };
    })
  );

  return enriched;
}
