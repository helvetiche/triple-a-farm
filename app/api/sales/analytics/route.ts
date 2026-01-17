import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getSalesStats, getRevenueTrend } from "@/lib/sales";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const [stats, trend] = await Promise.all([
      getSalesStats(sessionUser),
      getRevenueTrend(sessionUser, days),
    ]);

    return jsonSuccess(
      {
        stats,
        trend,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view sales analytics.",
          403
        );
      }
    }

    console.error("GET /api/sales/analytics error:", error);
    return jsonError(
      "SALES_ANALYTICS_FAILED",
      "Failed to load sales analytics.",
      500
    );
  }
}

