import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  createInventoryItem,
  getInventoryItems,
  type CreateInventoryItemInput,
} from "@/lib/inventory";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    const items = await getInventoryItems(sessionUser);

    return jsonSuccess(items, { status: 200 });
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

    console.error("GET /api/inventory error:", error);
    return jsonError(
      "INVENTORY_LIST_FAILED",
      "Failed to load inventory items.",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const body = (await request.json()) as Partial<CreateInventoryItemInput>;

    if (
      !body.name ||
      !body.category ||
      typeof body.currentStock !== "number" ||
      typeof body.minStock !== "number" ||
      !body.unit ||
      !body.supplier
    ) {
      return jsonError(
        "INVALID_REQUEST",
        "Missing required inventory fields.",
        400
      );
    }

    const input: CreateInventoryItemInput = {
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

    const created = await createInventoryItem(sessionUser, input);

    return jsonSuccess(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to create inventory items.",
          403
        );
      }
    }

    console.error("POST /api/inventory error:", error);
    return jsonError(
      "INVENTORY_CREATE_FAILED",
      "Failed to create inventory item.",
      500
    );
  }
}


