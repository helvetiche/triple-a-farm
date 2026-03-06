import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getRoosterStats } from "@/lib/roosters";
import { withCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    const stats = await withCache(
      CACHE_KEYS.ROOSTER_STATS,
      CACHE_TTL.MEDIUM,
      () => getRoosterStats(sessionUser)
    );

    return jsonSuccess(stats, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view rooster stats.",
          403
        );
      }
    }

    console.error("GET /api/roosters/stats error:", error);
    return jsonError(
      "ROOSTER_STATS_FAILED",
      "Failed to load rooster stats.",
      500
    );
  }
}
