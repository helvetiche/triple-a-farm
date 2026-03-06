import { SWRConfiguration } from "swr";

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't revalidate when window regains focus
  revalidateOnReconnect: true, // Revalidate when network reconnects
  revalidateOnMount: true, // Revalidate on mount to ensure fresh data
  dedupingInterval: 5000, // Dedupe requests within 5 seconds (increased for better caching)
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 5000, // Wait 5 seconds between retries
  shouldRetryOnError: true,
  focusThrottleInterval: 5000, // Throttle focus events to 5 seconds
  loadingTimeout: 3000,
  // Keep data fresh - revalidate if stale
  revalidateIfStale: false, // Don't revalidate if data exists (rely on cache)
  onError: (error, key) => {
    console.error(`SWR Error for key "${key}":`, error);
  },
};
// Cache time configurations (in milliseconds)
export const CACHE_TIMES = {
  FAST: 30000, // 30 seconds - frequently changing data
  MEDIUM: 60000, // 1 minute - moderate changes
  SLOW: 300000, // 5 minutes - rarely changing data
  STATIC: 600000, // 10 minutes - static/reference data
} as const;
