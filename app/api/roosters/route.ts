import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  createRooster,
  getRoosters,
  getRoostersPaginated,
  type CreateRoosterInput,
} from "@/lib/roosters";
import { withCache, CACHE_KEYS, CACHE_TTL, invalidatePattern } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const breedId = searchParams.get("breedId") || undefined;

    // If pagination is requested
    if (searchParams.has("page") || searchParams.has("limit")) {
      const cacheKey = `roosters:paginated:v3:${page}:${limit}:${search || ''}:${status || ''}:${breedId || ''}`;
      
      const result = await withCache(
        cacheKey,
        CACHE_TTL.FAST,
        () => getRoostersPaginated(sessionUser, {
          page,
          limit,
          search,
          status: status as "Available" | "Sold" | "Reserved" | "Quarantine" | "Deceased" | undefined,
          breedId,
        })
      );

      return jsonSuccess(result, { status: 200 });
    }

    // Legacy: return all roosters
    const roosters = await withCache(
      CACHE_KEYS.ROOSTERS,
      CACHE_TTL.FAST,
      () => getRoosters(sessionUser)
    );

    return jsonSuccess(roosters, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view roosters.",
          403
        );
      }
    }

    console.error("GET /api/roosters error:", error);
    return jsonError("ROOSTERS_LIST_FAILED", "Failed to load roosters.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const body = (await request.json()) as Partial<CreateRoosterInput>;

    if (
      !body.id ||
      !body.breedId ||
      !body.breed ||
      !body.age ||
      !body.weight ||
      !body.price ||
      !body.status ||
      !body.health ||
      !body.locationId ||
      !body.location
    ) {
      return jsonError(
        "INVALID_REQUEST",
        "Missing required rooster fields.",
        400
      );
    }

    const input: CreateRoosterInput = {
      id: body.id,
      breedId: body.breedId,
      breed: body.breed,
      name: body.name || body.breed,
      age: body.age,
      weight: body.weight,
      price: body.price,
      status: body.status,
      health: body.health,
      images: body.images || [],
      dateAdded: body.dateAdded || new Date().toISOString().split("T")[0],
      description: body.description || "",
      locationId: body.locationId,
      location: body.location,
      owner: body.owner,
      image: body.image,
      vaccinations: body.vaccinations,
    };

    const created = await createRooster(sessionUser, input);

    // Invalidate rooster caches
    await invalidatePattern("roosters:*");
    await invalidatePattern("rooster:*");

    return jsonSuccess(created, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to create roosters.",
          403
        );
      }
    }

    console.error("POST /api/roosters error:", error);
    return jsonError("ROOSTER_CREATE_FAILED", "Failed to create rooster.", 500);
  }
}
