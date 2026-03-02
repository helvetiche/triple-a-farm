import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { adminDb } from "@/lib/firebase";
import { hasRequiredRole } from "@/lib/roles";

const BREEDS_COLLECTION = "rooster_breeds";

export interface RoosterBreed {
  id: string;
  name: string;
  description?: string;
  characteristics?: string[];
  origin?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

const assertBreedPermission = async (action: "read" | "create" | "update" | "delete") => {
  const sessionUser = await getSessionUser();
  
  if (!sessionUser) {
    throw new Error("UNAUTHENTICATED");
  }

  const canRead = hasRequiredRole(sessionUser.roles, ["admin", "staff"]);
  const canWrite = hasRequiredRole(sessionUser.roles, "admin");

  switch (action) {
    case "read":
      if (!canRead) {
        throw new Error("FORBIDDEN");
      }
      break;
    case "create":
    case "update":
    case "delete":
      if (!canWrite) {
        throw new Error("FORBIDDEN");
      }
      break;
  }

  return sessionUser;
};

const breedsCollectionRef = () => adminDb.collection(BREEDS_COLLECTION);

export async function GET() {
  try {
    await assertBreedPermission("read");

    const snapshot = await breedsCollectionRef().orderBy("name", "asc").get();

    const breeds: RoosterBreed[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description,
        characteristics: data.characteristics || [],
        origin: data.origin,
        createdAt: data.createdAt || "",
        updatedAt: data.updatedAt || "",
        createdBy: data.createdBy,
      };
    });

    return jsonSuccess(breeds, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to view breeds.", 403);
      }
    }

    console.error("GET /api/roosters/breeds error:", error);
    return jsonError("BREEDS_FETCH_FAILED", "Failed to load breeds.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await assertBreedPermission("create");

    const body = await request.json();
    const { name, description, characteristics, origin } = body;

    if (!name || name.trim() === "") {
      return jsonError("INVALID_INPUT", "Breed name is required.", 400);
    }

    // Check if breed already exists
    const existingSnapshot = await breedsCollectionRef()
      .where("name", "==", name.trim())
      .get();

    if (!existingSnapshot.empty) {
      return jsonError("BREED_EXISTS", "A breed with this name already exists.", 409);
    }

    const newBreed: Omit<RoosterBreed, "id"> = {
      name: name.trim(),
      description: description?.trim() || "",
      characteristics: characteristics || [],
      origin: origin?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: sessionUser.uid,
    };

    const docRef = await breedsCollectionRef().add(newBreed);

    return jsonSuccess(
      { id: docRef.id, ...newBreed },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to create breeds.", 403);
      }
    }

    console.error("POST /api/roosters/breeds error:", error);
    return jsonError("BREED_CREATE_FAILED", "Failed to create breed.", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await assertBreedPermission("update");

    const body = await request.json();
    const { id, name, description, characteristics, origin } = body;

    if (!id) {
      return jsonError("INVALID_INPUT", "Breed ID is required.", 400);
    }

    if (!name || name.trim() === "") {
      return jsonError("INVALID_INPUT", "Breed name is required.", 400);
    }

    const docRef = breedsCollectionRef().doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return jsonError("BREED_NOT_FOUND", "Breed not found.", 404);
    }

    // Check if another breed with the same name exists
    const existingSnapshot = await breedsCollectionRef()
      .where("name", "==", name.trim())
      .get();

    const conflictingBreed = existingSnapshot.docs.find(
      (doc) => doc.id !== id
    );

    if (conflictingBreed) {
      return jsonError("BREED_EXISTS", "A breed with this name already exists.", 409);
    }

    const updatedBreed = {
      name: name.trim(),
      description: description?.trim() || "",
      characteristics: characteristics || [],
      origin: origin?.trim() || "",
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updatedBreed);

    return jsonSuccess(
      { id, ...updatedBreed },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to update breeds.", 403);
      }
    }

    console.error("PUT /api/roosters/breeds error:", error);
    return jsonError("BREED_UPDATE_FAILED", "Failed to update breed.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionUser = await assertBreedPermission("delete");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return jsonError("INVALID_INPUT", "Breed ID is required.", 400);
    }

    const docRef = breedsCollectionRef().doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return jsonError("BREED_NOT_FOUND", "Breed not found.", 404);
    }

    // Check if any roosters are using this breed
    const roostersSnapshot = await adminDb
      .collection("roosters")
      .where("breed", "==", doc.data()!.name)
      .limit(1)
      .get();

    if (!roostersSnapshot.empty) {
      return jsonError(
        "BREED_IN_USE",
        "Cannot delete breed that is assigned to roosters.",
        409
      );
    }

    await docRef.delete();

    return jsonSuccess(
      { message: "Breed deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to delete breeds.", 403);
      }
    }

    console.error("DELETE /api/roosters/breeds error:", error);
    return jsonError("BREED_DELETE_FAILED", "Failed to delete breed.", 500);
  }
}
