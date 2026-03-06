import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";
import type { Review } from "@/lib/analytics";

export function useReviews() {
  const { data, error, isLoading, mutate } = useSWR<Review[]>(
    "/api/feedback/reviews",
    fetcher,
    {
      refreshInterval: CACHE_TIMES.MEDIUM,
      revalidateOnMount: true,
    }
  );

  return {
    reviews: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTestimonials() {
  const { data, error, isLoading, mutate } = useSWR<Review[]>(
    "/api/feedback/testimonials",
    fetcher,
    {
      refreshInterval: CACHE_TIMES.SLOW,
    }
  );

  return {
    testimonials: data,
    isLoading,
    isError: error,
    mutate,
  };
}
