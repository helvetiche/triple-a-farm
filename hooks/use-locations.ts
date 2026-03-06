import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";

export interface FarmLocation {
  locationId: string;
  name: string;
  address?: string;
}

export function useLocations() {
  const { data, error, isLoading, mutate } = useSWR<FarmLocation[]>(
    "/api/roosters/locations",
    fetcher,
    {
      refreshInterval: CACHE_TIMES.STATIC,
      revalidateOnMount: true,
    }
  );

  return {
    locations: data,
    isLoading,
    isError: error,
    mutate,
  };
}
