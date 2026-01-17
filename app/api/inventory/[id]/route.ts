import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  type UpdateInventoryItemInput,
} from "@/lib/inventory";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();

    const { id } = await params;
    const item = await getInventoryItemById(sessionUser, id);

    if (!item) {
      return jsonError("NOT_FOUND", "Inventory item not found.", 404);
    }

    return jsonSuccess(item, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view inventory.",
          403
        );
      }
    }

    console.error("GET /api/inventory/[id] error:", error);
    return jsonError(
      "INVENTORY_GET_FAILED",
      "Failed to load inventory item.",
      500
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    const body = (await request.json()) as Partial<UpdateInventoryItemInput>;

    const input: UpdateInventoryItemInput = {
      name: body.name,
      category: body.category,
      currentStock: body.currentStock,
      minStock: body.minStock,
      unit: body.unit,
      supplier: body.supplier,
      price: body.price,
      location: body.location,
      description: body.description,
      lastRestocked: body.lastRestocked,
      expiryDate: body.expiryDate,
    };

    const { id } = await params;
    const updated = await updateInventoryItem(sessionUser, id, input);

    return jsonSuccess(updated, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to update inventory items.",
          403
        );
      }

      if (error.message === "NOT_FOUND") {
        return jsonError("NOT_FOUND", "Inventory item not found.", 404);
      }
    }

    console.error("PATCH /api/inventory/[id] error:", error);
    return jsonError(
      "INVENTORY_UPDATE_FAILED",
      "Failed to update inventory item.",
      500
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();

    const { id } = await params;
    await deleteInventoryItem(sessionUser, id);

    return jsonSuccess({ deleted: true }, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to delete inventory items.",
          403
        );
      }

      if (error.message === "NOT_FOUND") {
        return jsonError("NOT_FOUND", "Inventory item not found.", 404);
      }
    }

    console.error("DELETE /api/inventory/[id] error:", error);
    return jsonError(
      "INVENTORY_DELETE_FAILED",
      "Failed to delete inventory item.",
      500
    );
  }
}


