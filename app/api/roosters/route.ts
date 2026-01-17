import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  createRooster,
  getRoosters,
  type CreateRoosterInput,
} from "@/lib/roosters";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    const roosters = await getRoosters(sessionUser);

    return jsonSuccess(roosters, { status: 200 });
  } catch (error: any) {
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
    return jsonError(
      "ROOSTERS_LIST_FAILED",
      "Failed to load roosters.",
      500
    );
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
      !body.health
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
      age: body.age,
      weight: body.weight,
      price: body.price,
      status: body.status,
      health: body.health,
      images: body.images || [],
      dateAdded: body.dateAdded || new Date().toISOString().split("T")[0],
      owner: body.owner,
      image: body.image,
    };

    const created = await createRooster(sessionUser, input);

    return jsonSuccess(created, { status: 201 });
  } catch (error: any) {
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
    return jsonError(
      "ROOSTER_CREATE_FAILED",
      "Failed to create rooster.",
      500
    );
  }
}

