import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  getAnalyticsStats,
  getMonthlyTrends,
  getBreedPerformance,
  getHealthMetrics,
  getCustomerRatings,
} from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Validate dates
    if (startDate && isNaN(startDate.getTime())) {
      return jsonError("INVALID_DATE", "Invalid start date format.", 400);
    }

    if (endDate && isNaN(endDate.getTime())) {
      return jsonError("INVALID_DATE", "Invalid end date format.", 400);
    }

    if (startDate && endDate && startDate > endDate) {
      return jsonError(
        "INVALID_DATE_RANGE",
        "Start date must be before end date.",
        400
      );
    }

    // Fetch all analytics data in parallel with individual error handling
    const results = await Promise.allSettled([
      getAnalyticsStats(sessionUser, startDate, endDate),
      getMonthlyTrends(sessionUser, startDate, endDate),
      getBreedPerformance(sessionUser, startDate, endDate),
      getHealthMetrics(sessionUser, startDate, endDate),
      getCustomerRatings(sessionUser, startDate, endDate),
    ]);

    // Extract results or provide fallbacks for failed operations
    const stats = results[0].status === 'fulfilled' ? results[0].value : null;
    const monthlyTrends = results[1].status === 'fulfilled' ? results[1].value : [];
    const breedPerformance = results[2].status === 'fulfilled' ? results[2].value : [];
    const healthMetrics = results[3].status === 'fulfilled' ? results[3].value : null;
    const customerRatings = results[4].status === 'fulfilled' ? results[4].value : [];

    // Log any failures for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const names = ['stats', 'monthlyTrends', 'breedPerformance', 'healthMetrics', 'customerRatings'];
        console.error(`Analytics ${names[index]} failed:`, result.reason);
      }
    });

    return jsonSuccess(
      {
        stats,
        monthlyTrends,
        breedPerformance,
        healthMetrics,
        customerRatings,
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
          "You do not have permission to view analytics.",
          403
        );
      }
    }

    console.error("GET /api/analytics error:", error);
    return jsonError(
      "ANALYTICS_FETCH_FAILED",
      "Failed to load analytics data.",
      500
    );
  }
}

