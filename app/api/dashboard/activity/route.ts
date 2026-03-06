import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";

export interface DashboardActivity {
  action: string;
  detail: string;
  time: string;
  timestamp: number;
  icon: string;
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    // For now, return empty array - can be populated with real activity data later
    const activities: DashboardActivity[] = [];

    return jsonSuccess(activities, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view dashboard activity.",
          403
        );
      }
    }

    console.error("GET /api/dashboard/activity error:", error);
    return jsonError(
      "DASHBOARD_ACTIVITY_FAILED",
      "Failed to load dashboard activity.",
      500
    );
  }
}
