import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemsPaginated,
  type CreateInventoryItemInput,
} from "@/lib/inventory";
import { withCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;

    // If pagination is requested
    if (searchParams.has("page") || searchParams.has("limit")) {
      // Build cache key based on all query parameters
      const cacheKey = `inventory:paginated:${locationId || 'all'}:${page}:${limit}:${search || ''}:${category || ''}:${status || ''}`;
      
      const result = await withCache(
        cacheKey,
        CACHE_TTL.FAST,
        () => getInventoryItemsPaginated(sessionUser, {
          locationId,
          page,
          limit,
          search,
          category,
          status: status as "critical" | "low" | "normal" | "good" | "perfect" | "all" | undefined,
        })
      );

      return jsonSuccess(result, { status: 200 });
    }

    // Legacy: return all items (for backwards compatibility)
    const items = await withCache(
      CACHE_KEYS.INVENTORY(locationId),
      CACHE_TTL.FAST,
      () => getInventoryItems(sessionUser, { locationId })
    );

    return jsonSuccess(items, { status: 200 });
  } catch (error: unknown) {
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
      !body.supplier ||
      !body.locationId ||
      !body.locationName
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
      maxStock: body.maxStock,
      unit: body.unit,
      supplier: body.supplier,
      price: body.price,
      description: body.description,
      lastRestocked: body.lastRestocked,
      expiryDate: body.expiryDate,
      locationId: body.locationId,
      locationName: body.locationName,
      locationAddress: body.locationAddress,
    };

    const created = await createInventoryItem(sessionUser, input);

    return jsonSuccess(created, { status: 201 });
  } catch (error: unknown) {
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
