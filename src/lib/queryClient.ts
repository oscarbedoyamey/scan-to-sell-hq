import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30s — data considered fresh
      gcTime: 5 * 60_000,     // 5min — garbage collect
      refetchOnWindowFocus: true,  // Refetch when tab gets focus (multi-tab sync!)
      retry: 1,
    },
  },
});
