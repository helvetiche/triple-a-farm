import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";

export interface DashboardActivity {
  action: string;
  detail: string;
  time: string;
  timestamp: number;
  icon: string;
}

export function useDashboardActivity() {
  const { data, error, isLoading, mutate } = useSWR<DashboardActivity[]>(
    "/api/dashboard/activity",
    fetcher,
    {
      refreshInterval: CACHE_TIMES.FAST,
      revalidateOnMount: false, // Use cache if available
      dedupingInterval: 5000,
    }
  );

  return {
    activities: data,
    isLoading,
    isError: error,
    mutate,
  };
}
