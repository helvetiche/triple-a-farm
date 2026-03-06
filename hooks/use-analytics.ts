import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";
import type {
  AnalyticsStats,
  MonthlyData,
  BreedData,
  HealthMetrics,
  CustomerRating,
} from "@/app/admin/analytics/data/mock-data";

export interface AnalyticsData {
  stats: AnalyticsStats | null;
  monthlyTrends: MonthlyData[];
  breedPerformance: BreedData[];
  healthMetrics: HealthMetrics | null;
  customerRatings: CustomerRating[];
}

export function useAnalytics(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());

  const key = params.toString()
    ? `/api/analytics?${params.toString()}`
    : "/api/analytics";

  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    key,
    fetcher,
    {
      refreshInterval: CACHE_TIMES.MEDIUM,
      revalidateOnMount: true,
    }
  );

  return {
    analytics: data,
    isLoading,
    isError: error,
    mutate,
  };
}
