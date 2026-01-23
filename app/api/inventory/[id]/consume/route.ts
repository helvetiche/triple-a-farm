import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { consumeInventoryItem } from "@/lib/inventory";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    const body = await request.json();

    const { amount, reason } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return jsonError(
        "INVALID_REQUEST",
        "Amount must be a positive number.",
        400
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim() === "") {
      return jsonError("INVALID_REQUEST", "Reason is required.", 400);
    }

    const { id } = await params;
    const updated = await consumeInventoryItem(sessionUser, id, amount, reason);

    return jsonSuccess(updated, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to consume inventory items.",
          403
        );
      }

      if (error.message === "NOT_FOUND") {
        return jsonError("NOT_FOUND", "Inventory item not found.", 404);
      }

      if (error.message === "INVALID_CONSUME_AMOUNT") {
        return jsonError(
          "INVALID_REQUEST",
          "Amount must be a positive number.",
          400
        );
      }

      if (error.message === "REASON_REQUIRED") {
        return jsonError("INVALID_REQUEST", "Reason is required.", 400);
      }
    }

    console.error("POST /api/inventory/[id]/consume error:", error);
    return jsonError(
      "INVENTORY_CONSUME_FAILED",
      "Failed to consume inventory item.",
      500
    );
  }
}
