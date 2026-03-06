import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";
import type { Rooster } from "@/app/admin/data/roosters";

export interface RoosterStats {
  total: number;
  available: number;
  sold: number;
  reserved: number;
  averagePrice: number;
  totalValue: number;
}

export interface PaginatedRoostersResult {
  roosters: Rooster[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UseRoostersPaginatedOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  breedId?: string;
}

export function useRoosters() {
  const { data, error, isLoading, mutate } = useSWR<Rooster[]>(
    "/api/roosters",
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnMount: true, // Changed to true to fetch on mount
      dedupingInterval: 5000,
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  return {
    roosters: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRoostersPaginated(options: UseRoostersPaginatedOptions = {}) {
  const params = new URLSearchParams();
  
  if (options.page) params.append("page", String(options.page));
  if (options.limit) params.append("limit", String(options.limit));
  if (options.search) params.append("search", options.search);
  if (options.status && options.status !== "all") params.append("status", options.status);
  if (options.breedId && options.breedId !== "all") params.append("breedId", options.breedId);

  const key = `/api/roosters?${params.toString()}`;

  console.log("useRoostersPaginated key:", key); // Debug log

  const { data, error, isLoading, mutate } = useSWR<PaginatedRoostersResult>(
    key,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnMount: true, // Changed to true to ensure initial fetch
      keepPreviousData: true,
      dedupingInterval: 5000,
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  console.log("useRoostersPaginated data:", data, "error:", error, "isLoading:", isLoading); // Debug log

  return {
    roosters: data?.roosters,
    total: data?.total,
    page: data?.page,
    limit: data?.limit,
    totalPages: data?.totalPages,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRooster(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Rooster>(
    id ? `/api/roosters/${id}` : null,
    fetcher,
    {
      refreshInterval: CACHE_TIMES.MEDIUM,
    }
  );

  return {
    rooster: data,
    isLoading,
    isError: error,
    mutate,
  };
}
