import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import type { SalesTransaction } from "@/app/admin/sales/types";

export interface PaginatedSalesResult {
  transactions: SalesTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UseSalesPaginatedOptions {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: string;
}

export function useSalesPaginated(options: UseSalesPaginatedOptions = {}) {
  const params = new URLSearchParams();
  
  if (options.page) params.append("page", String(options.page));
  if (options.limit) params.append("limit", String(options.limit));
  if (options.search) params.append("search", options.search);
  if (options.paymentMethod && options.paymentMethod !== "all") params.append("paymentMethod", options.paymentMethod);

  const key = `/api/sales/transactions?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedSalesResult>(
    key,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnMount: true,
      keepPreviousData: true,
      dedupingInterval: 1000, // Reduced to 1 second
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: false,
    }
  );

  return {
    transactions: data?.transactions,
    total: data?.total,
    page: data?.page,
    limit: data?.limit,
    totalPages: data?.totalPages,
    isLoading,
    isError: error,
    mutate,
  };
}
