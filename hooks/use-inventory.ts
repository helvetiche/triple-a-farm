import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";
import type {
  InventoryItem,
  InventoryStats,
  InventoryActivity,
} from "@/lib/inventory-types";

export interface PaginatedInventoryResult {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UseInventoryPaginatedOptions {
  locationId?: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export function useInventory(locationId?: string) {
  const key = locationId
    ? `/api/inventory?locationId=${locationId}`
    : "/api/inventory";

  const { data, error, isLoading, mutate } = useSWR<InventoryItem[]>(
    key,
    fetcher,
    {
      refreshInterval: CACHE_TIMES.FAST,
      revalidateOnMount: false, // Use cache if available
      dedupingInterval: 5000,
    }
  );

  return {
    items: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useInventoryPaginated(options: UseInventoryPaginatedOptions = {}) {
  const params = new URLSearchParams();
  
  if (options.locationId) params.append("locationId", options.locationId);
  if (options.page) params.append("page", String(options.page));
  if (options.limit) params.append("limit", String(options.limit));
  if (options.search) params.append("search", options.search);
  if (options.category && options.category !== "all") params.append("category", options.category);
  if (options.status && options.status !== "all") params.append("status", options.status);

  const key = `/api/inventory?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedInventoryResult>(
    key,
    fetcher,
    {
      refreshInterval: 0, // Disable auto-refresh, rely on manual mutate
      revalidateOnMount: true, // Changed to true to ensure initial fetch
      keepPreviousData: true, // Keep previous data while loading new page
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      revalidateOnFocus: false, // Don't revalidate on focus
      revalidateIfStale: false, // Don't revalidate if data exists
    }
  );

  return {
    items: data?.items,
    total: data?.total,
    page: data?.page,
    limit: data?.limit,
    totalPages: data?.totalPages,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useInventoryStats(locationId?: string) {
  const key = locationId
    ? `/api/inventory/stats?locationId=${locationId}`
    : "/api/inventory/stats";

  const { data, error, isLoading, mutate } = useSWR<InventoryStats>(
    key,
    fetcher,
    {
      refreshInterval: CACHE_TIMES.MEDIUM,
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useInventoryItem(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<InventoryItem>(
    id ? `/api/inventory/${id}` : null,
    fetcher,
    {
      refreshInterval: CACHE_TIMES.MEDIUM,
    }
  );

  return {
    item: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useInventoryActivities(limit?: number) {
  const key = limit
    ? `/api/inventory/activity?limit=${limit}`
    : "/api/inventory/activity";

  const { data, error, isLoading, mutate } = useSWR<InventoryActivity[]>(
    key,
    fetcher,
    {
      refreshInterval: CACHE_TIMES.FAST,
    }
  );

  return {
    activities: data,
    isLoading,
    isError: error,
    mutate,
  };
}
