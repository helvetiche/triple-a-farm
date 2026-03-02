import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { adminDb } from "@/lib/firebase";
import { hasRequiredRole } from "@/lib/roles";

const LOCATIONS_COLLECTION = "farm_locations";

export interface FarmLocation {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

const assertLocationPermission = async (action: "read" | "create" | "update" | "delete") => {
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

const locationsCollectionRef = () => adminDb.collection(LOCATIONS_COLLECTION);

export async function GET() {
  try {
    await assertLocationPermission("read");

    const snapshot = await locationsCollectionRef().orderBy("name", "asc").get();

    const locations: FarmLocation[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        address: data.address,
        createdAt: data.createdAt || "",
        updatedAt: data.updatedAt || "",
        createdBy: data.createdBy,
      };
    });

    return jsonSuccess(locations, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to view locations.", 403);
      }
    }

    console.error("GET /api/roosters/locations error:", error);
    return jsonError("LOCATIONS_FETCH_FAILED", "Failed to load locations.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await assertLocationPermission("create");

    const body = await request.json();
    const { name, address } = body;

    if (!name || name.trim() === "") {
      return jsonError("INVALID_INPUT", "Location name is required.", 400);
    }

    // Check if location already exists
    const existingSnapshot = await locationsCollectionRef()
      .where("name", "==", name.trim())
      .get();

    if (!existingSnapshot.empty) {
      return jsonError("LOCATION_EXISTS", "A location with this name already exists.", 409);
    }

    const newLocation: Omit<FarmLocation, "id"> = {
      name: name.trim(),
      address: address?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: sessionUser.uid,
    };

    const docRef = await locationsCollectionRef().add(newLocation);

    return jsonSuccess(
      { id: docRef.id, ...newLocation },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to create locations.", 403);
      }
    }

    console.error("POST /api/roosters/locations error:", error);
    return jsonError("LOCATION_CREATE_FAILED", "Failed to create location.", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await assertLocationPermission("update");

    const body = await request.json();
    const { id, name, address } = body;

    if (!id) {
      return jsonError("INVALID_INPUT", "Location ID is required.", 400);
    }

    if (!name || name.trim() === "") {
      return jsonError("INVALID_INPUT", "Location name is required.", 400);
    }

    const docRef = locationsCollectionRef().doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return jsonError("LOCATION_NOT_FOUND", "Location not found.", 404);
    }

    // Check if another location with the same name exists
    const existingSnapshot = await locationsCollectionRef()
      .where("name", "==", name.trim())
      .get();

    const conflictingLocation = existingSnapshot.docs.find(
      (doc) => doc.id !== id
    );

    if (conflictingLocation) {
      return jsonError("LOCATION_EXISTS", "A location with this name already exists.", 409);
    }

    const updatedLocation = {
      name: name.trim(),
      address: address?.trim() || "",
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updatedLocation);

    return jsonSuccess(
      { id, ...updatedLocation },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to update locations.", 403);
      }
    }

    console.error("PUT /api/roosters/locations error:", error);
    return jsonError("LOCATION_UPDATE_FAILED", "Failed to update location.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionUser = await assertLocationPermission("delete");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return jsonError("INVALID_INPUT", "Location ID is required.", 400);
    }

    const docRef = locationsCollectionRef().doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return jsonError("LOCATION_NOT_FOUND", "Location not found.", 404);
    }

    // Check if any roosters are using this location
    const roostersSnapshot = await adminDb
      .collection("roosters")
      .where("locationId", "==", id)
      .limit(1)
      .get();

    if (!roostersSnapshot.empty) {
      return jsonError(
        "LOCATION_IN_USE",
        "Cannot delete location that is assigned to roosters.",
        409
      );
    }

    await docRef.delete();

    return jsonSuccess(
      { message: "Location deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to delete locations.", 403);
      }
    }

    console.error("DELETE /api/roosters/locations error:", error);
    return jsonError("LOCATION_DELETE_FAILED", "Failed to delete location.", 500);
  }
}