import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getInventoryActivity } from "@/lib/inventory";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();

    const { id } = await params;
    const activities = await getInventoryActivity(sessionUser, id, 100);

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

    console.error("GET /api/inventory/[id]/activity error:", error);
    return jsonError(
      "INVENTORY_ACTIVITY_FAILED",
      "Failed to load inventory activity.",
      500
    );
  }
}
