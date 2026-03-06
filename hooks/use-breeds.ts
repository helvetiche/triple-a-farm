import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";

export interface Breed {
  breedId: string;
  name: string;
  description?: string;
}

export function useBreeds() {
  const { data, error, isLoading, mutate } = useSWR<Breed[]>(
    "/api/roosters/breeds",
    fetcher,
    {
      refreshInterval: CACHE_TIMES.STATIC,
      revalidateOnMount: true,
    }
  );

  return {
    breeds: data,
    isLoading,
    isError: error,
    mutate,
  };
}
