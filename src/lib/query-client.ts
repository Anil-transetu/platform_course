import { QueryClient } from "@tanstack/react-query";

/**
 * Centralized QueryClient configuration
 * Used for both SSR and client-side data fetching
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error) {
            const status = (error as unknown as Record<string, unknown>).status as number;
            if (status && status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

export const queryClient = createQueryClient();
