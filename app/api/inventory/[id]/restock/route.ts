import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { restockInventoryItem } from "@/lib/inventory";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    const body = (await request.json()) as { amount?: number };

    if (typeof body.amount !== "number" || body.amount <= 0) {
      return jsonError(
        "INVALID_REQUEST",
        "Restock amount must be a positive number.",
        400
      );
    }

    const { id } = await params;
    const updated = await restockInventoryItem(
      sessionUser,
      id,
      body.amount
    );

    return jsonSuccess(updated, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to restock inventory items.",
          403
        );
      }

      if (error.message === "NOT_FOUND") {
        return jsonError("NOT_FOUND", "Inventory item not found.", 404);
      }

      if (error.message === "INVALID_RESTOCK_AMOUNT") {
        return jsonError(
          "INVALID_REQUEST",
          "Restock amount must be a positive number.",
          400
        );
      }
    }

    console.error("POST /api/inventory/[id]/restock error:", error);
    return jsonError(
      "INVENTORY_RESTOCK_FAILED",
      "Failed to restock inventory item.",
      500
    );
  }
}


