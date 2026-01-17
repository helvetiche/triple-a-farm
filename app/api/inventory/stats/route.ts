import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getInventoryStats } from "@/lib/inventory";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    const stats = await getInventoryStats(sessionUser);

    return jsonSuccess(stats, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view inventory stats.",
          403
        );
      }
    }

    console.error("GET /api/inventory/stats error:", error);
    return jsonError(
      "INVENTORY_STATS_FAILED",
      "Failed to load inventory stats.",
      500
    );
  }
}


