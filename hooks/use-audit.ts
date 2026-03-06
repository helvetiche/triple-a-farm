import useSWR from "swr";
import { fetcher } from "@/lib/swr-fetcher";
import { CACHE_TIMES } from "@/lib/swr-config";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  monthLogs: number;
}

export interface UseAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export function useAuditLogs(params?: UseAuditLogsParams) {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all") {
        searchParams.append(key, String(value));
      }
    });
  }

  const key = searchParams.toString()
    ? `/api/audit?${searchParams.toString()}`
    : "/api/audit";

  const { data, error, isLoading, mutate } = useSWR<{
    logs: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
  }>(key, fetcher, {
    refreshInterval: CACHE_TIMES.FAST,
    revalidateOnMount: true,
  });

  return {
    logs: data?.logs,
    total: data?.total,
    page: data?.page,
    limit: data?.limit,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAuditStats() {
  const { data, error, isLoading, mutate } = useSWR<AuditStats>(
    "/api/audit/stats",
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
