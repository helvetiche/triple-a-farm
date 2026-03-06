import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";

export interface Supplier {
  supplierId: string;
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export function useSuppliers() {
  const { data, error, isLoading, mutate } = useSWR<Supplier[]>(
    "/api/suppliers",
    fetcher,
    {
      refreshInterval: CACHE_TIMES.SLOW,
      revalidateOnMount: true,
    }
  );

  return {
    suppliers: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSupplier(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Supplier>(
    id ? `/api/suppliers/${id}` : null,
    fetcher,
    {
      refreshInterval: CACHE_TIMES.SLOW,
    }
  );

  return {
    supplier: data,
    isLoading,
    isError: error,
    mutate,
  };
}
