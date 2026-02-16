import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { SIGNS_QUERY_KEY, fetchUserSigns } from '@/lib/data/signs';

export function useUserSigns(refetchWhilePending = false) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [SIGNS_QUERY_KEY, 'user', user?.id],
    queryFn: () => fetchUserSigns(user!.id),
    enabled: !!user,
    refetchInterval: refetchWhilePending ? 5000 : false,
  });
}
