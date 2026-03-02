import { adminDb } from "@/lib/firebase";
import { getSessionUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/roles";
import { logAuditEvent } from "@/lib/audit";

export interface FarmLocation {
  locationId: string;
  name: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

const LOCATIONS_COLLECTION = "farm_locations";

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

export const getLocations = async (): Promise<string[]> => {
  try {
    const snapshot = await locationsCollectionRef()
      .orderBy("name", "asc")
      .get();

    const locations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return data.name as string;
    }).filter(name => name && name.trim() !== "");

    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    // Fallback to default location if there's an error
    return ["Main Farm"];
  }
};

export const getLocationsWithDetails = async (): Promise<FarmLocation[]> => {
  await assertLocationPermission("read");

  const snapshot = await locationsCollectionRef()
    .orderBy("name", "asc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      locationId: data.locationId || doc.id,
      name: data.name || "",
      address: data.address || "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
    };
  });
};

export const createLocation = async (locationData: Omit<FarmLocation, "locationId" | "createdAt" | "updatedAt">): Promise<FarmLocation> => {
  const sessionUser = await assertLocationPermission("create");

  const locationId = `LOC-${Date.now()}`;
  const now = new Date().toISOString();

  const newLocation: FarmLocation = {
    ...locationData,
    locationId,
    createdAt: now,
    updatedAt: now,
    createdBy: sessionUser.uid,
  };

  await locationsCollectionRef().doc(locationId).set(newLocation);

  logAuditEvent(sessionUser, {
    action: "create",
    entity: "location",
    entityId: newLocation.locationId,
    entityName: newLocation.name,
    description: `Created farm location: ${newLocation.name}`,
    details: {
      metadata: {
        address: newLocation.address,
      },
    },
  });

  return newLocation;
};

export const updateLocation = async (locationId: string, locationData: Partial<Omit<FarmLocation, "locationId" | "createdAt" | "updatedAt">>): Promise<FarmLocation> => {
  const sessionUser = await assertLocationPermission("update");

  const now = new Date().toISOString();
  const updateData = {
    ...locationData,
    updatedAt: now,
  };

  await locationsCollectionRef().doc(locationId).update(updateData);

  const doc = await locationsCollectionRef().doc(locationId).get();
  const data = doc.data();
  if (!data) {
    throw new Error("Location not found");
  }

  const updatedLocation: FarmLocation = {
    locationId: data.locationId || locationId,
    name: data.name || "",
    address: data.address || "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy,
  };

  logAuditEvent(sessionUser, {
    action: "update",
    entity: "location",
    entityId: updatedLocation.locationId,
    entityName: updatedLocation.name,
    description: `Updated farm location: ${updatedLocation.name}`,
    details: {
      metadata: {
        address: updatedLocation.address,
      },
    },
  });

  return updatedLocation;
};

export const deleteLocation = async (locationId: string): Promise<void> => {
  const sessionUser = await assertLocationPermission("delete");

  // Check if location is being used by any roosters
  const roostersSnapshot = await adminDb.collection("roosters").where("locationId", "==", locationId).get();
  if (!roostersSnapshot.empty) {
    throw new Error("Cannot delete location that is assigned to roosters");
  }

  const doc = await locationsCollectionRef().doc(locationId).get();
  const data = doc.data();
  const locationName = data?.name || locationId;

  await locationsCollectionRef().doc(locationId).delete();

  logAuditEvent(sessionUser, {
    action: "delete",
    entity: "location",
    entityId: locationId,
    entityName: locationName,
    description: `Deleted farm location: ${locationName}`,
    details: {
      metadata: {
        address: data?.address,
      },
    },
  });
};

export const getLocationById = async (locationId: string): Promise<FarmLocation | null> => {
  await assertLocationPermission("read");

  const doc = await locationsCollectionRef().doc(locationId).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  if (!data) {
    return null;
  }

  return {
    locationId: data.locationId || locationId,
    name: data.name || "",
    address: data.address || "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy,
  };
};