import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getInventoryActivity } from "@/lib/inventory";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 100;

    const activities = await getInventoryActivity(sessionUser, undefined, limit);

    return jsonSuccess(activities, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view inventory activity.",
          403
        );
      }
    }

    console.error("GET /api/inventory/activity error:", error);
    return jsonError(
      "INVENTORY_ACTIVITY_FAILED",
      "Failed to load inventory activity.",
      500
    );
  }
}
