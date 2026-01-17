import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  getRoosterById,
  updateRooster,
  deleteRooster,
  type UpdateRoosterInput,
} from "@/lib/roosters";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const { id } = await params;
    const rooster = await getRoosterById(sessionUser, id);

    if (!rooster) {
      return jsonError("NOT_FOUND", "Rooster not found.", 404);
    }

    return jsonSuccess(rooster, { status: 200 });
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

    console.error("GET /api/roosters/[id] error:", error);
    return jsonError(
      "ROOSTER_GET_FAILED",
      `Failed to load rooster: ${error instanceof Error ? error.message : "Unknown error"}`,
      500
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    const { id } = await params;
    const body = (await request.json()) as Partial<UpdateRoosterInput>;

    const input: UpdateRoosterInput = {
      id: body.id,
      breedId: body.breedId,
      breed: body.breed,
      age: body.age,
      weight: body.weight,
      price: body.price,
      status: body.status,
      health: body.health,
      images: body.images,
      dateAdded: body.dateAdded,
      owner: body.owner,
      image: body.image,
    };

    const updated = await updateRooster(sessionUser, id, input);

    return jsonSuccess(updated, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to update roosters.",
          403
        );
      }

      if (error.message === "NOT_FOUND") {
        return jsonError("NOT_FOUND", "Rooster not found.", 404);
      }
    }

    console.error("PATCH /api/roosters/[id] error:", error);
    return jsonError(
      "ROOSTER_UPDATE_FAILED",
      "Failed to update rooster.",
      500
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    const { id } = await params;

    await deleteRooster(sessionUser, id);

    return jsonSuccess({ deleted: true }, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to delete roosters.",
          403
        );
      }

      if (error.message === "NOT_FOUND") {
        return jsonError("NOT_FOUND", "Rooster not found.", 404);
      }
    }

    console.error("DELETE /api/roosters/[id] error:", error);
    return jsonError(
      "ROOSTER_DELETE_FAILED",
      "Failed to delete rooster.",
      500
    );
  }
}

