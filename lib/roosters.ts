import { adminDb } from "@/lib/firebase";
import type { SessionUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/roles";
import type { Rooster, Vaccination } from "@/app/admin/data/roosters";
import { logAuditEvent } from "@/lib/audit";
import { invalidatePattern } from "@/lib/redis";

type RoosterAction = "read" | "create" | "update" | "delete" | "readStats";

const ROOSTERS_COLLECTION = "roosters";

// Helper to invalidate all rooster-related caches
const invalidateRoosterCaches = async () => {
  try {
    await invalidatePattern("roosters:*");
    await invalidatePattern("rooster:*");
  } catch (error) {
    console.error("Failed to invalidate rooster caches:", error);
  }
};

const assertRoosterPermission = (
  user: SessionUser | null,
  action: RoosterAction
) => {
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const roles = user.roles;

  const canRead = hasRequiredRole(roles, ["admin", "staff"]);
  const canWriteAdminOnly = hasRequiredRole(roles, "admin");

  switch (action) {
    case "read":
    case "readStats":
      if (!canRead) {
        throw new Error("FORBIDDEN");
      }
      return;
    case "create":
    case "update":
    case "delete":
      if (!canWriteAdminOnly) {
        throw new Error("FORBIDDEN");
      }
      return;
    default:
      throw new Error("FORBIDDEN");
  }
};

const roostersCollectionRef = () => adminDb.collection(ROOSTERS_COLLECTION);

export interface GetRoostersPaginatedOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: Rooster["status"] | "all";
  breedId?: string;
}

export interface PaginatedRoostersResult {
  roosters: Rooster[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getRoosters = async (
  user: SessionUser | null
): Promise<Rooster[]> => {
  assertRoosterPermission(user, "read");

  const snapshot = await roostersCollectionRef().get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;

    // Ensure all required fields exist, provide defaults if missing
    const rooster: Rooster = {
      id: doc.id,
      breedId: (data.breedId as string) || "",
      breed: (data.breed as string) || "",
      name: (data.name as string) || "",
      age: (data.age as string) || "",
      weight: (data.weight as string) || "",
      price: (data.price as string) || "",
      status: (data.status as Rooster["status"]) || "Available",
      health: (data.health as Rooster["health"]) || "good",
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      dateAdded:
        (data.dateAdded as string) || new Date().toISOString().split("T")[0],
      description: (data.description as string) || "",
      locationId: (data.locationId as string) || "",
      location: (data.location as string) || "",
      locationAddress: (data.locationAddress as string) || undefined,
      owner: data.owner as string | undefined,
      image: data.image as string | undefined,
      vaccinations: Array.isArray(data.vaccinations)
        ? (data.vaccinations as Vaccination[])
        : undefined,
    };

    return rooster;
  });
};

export const getRoostersPaginated = async (
  user: SessionUser | null,
  options: GetRoostersPaginatedOptions = {}
): Promise<PaginatedRoostersResult> => {
  assertRoosterPermission(user, "read");

  const {
    page = 1,
    limit = 10,
    search,
    status,
    breedId,
  } = options;

  // Build base query with filters
  let query: FirebaseFirestore.Query = roostersCollectionRef();

  // Apply filters
  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }

  if (breedId && breedId !== "all") {
    query = query.where("breedId", "==", breedId);
  }

  // Order by dateAdded for consistent pagination
  query = query.orderBy("dateAdded", "desc");

  // If search is provided, use prefix matching with limited fetch
  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    
    // Try prefix search on name field
    const searchEnd = searchLower.slice(0, -1) + String.fromCharCode(searchLower.charCodeAt(searchLower.length - 1) + 1);
    
    const searchQuery = query
      .where("nameLower", ">=", searchLower)
      .where("nameLower", "<", searchEnd)
      .limit(limit * 3); // Get more results for additional filtering
    
    const snapshot = await searchQuery.get();
    
    // Additional client-side filtering for other fields
    const filteredDocs = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return (
        data.name?.toLowerCase().includes(searchLower) ||
        data.breed?.toLowerCase().includes(searchLower) ||
        data.id?.toLowerCase().includes(searchLower) ||
        data.description?.toLowerCase().includes(searchLower)
      );
    });

    const filteredTotal = filteredDocs.length;
    const totalPages = Math.ceil(filteredTotal / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

    const roosters: Rooster[] = paginatedDocs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        breedId: (data.breedId as string) || "",
        breed: (data.breed as string) || "",
        name: (data.name as string) || "",
        age: (data.age as string) || "",
        weight: (data.weight as string) || "",
        price: (data.price as string) || "",
        status: (data.status as Rooster["status"]) || "Available",
        health: (data.health as Rooster["health"]) || "good",
        images: Array.isArray(data.images) ? (data.images as string[]) : [],
        dateAdded: (data.dateAdded as string) || new Date().toISOString().split("T")[0],
        description: (data.description as string) || "",
        locationId: (data.locationId as string) || "",
        location: (data.location as string) || "",
        locationAddress: (data.locationAddress as string) || undefined,
        owner: data.owner as string | undefined,
        image: data.image as string | undefined,
        vaccinations: Array.isArray(data.vaccinations) ? (data.vaccinations as Vaccination[]) : undefined,
      };
    });

    return {
      roosters,
      total: filteredTotal,
      page,
      limit,
      totalPages,
    };
  }

  // No search - use proper Firestore pagination
  const offset = (page - 1) * limit;
  
  const paginatedQuery = query.limit(limit).offset(offset);
  const snapshot = await paginatedQuery.get();

  const roosters: Rooster[] = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      breedId: (data.breedId as string) || "",
      breed: (data.breed as string) || "",
      name: (data.name as string) || "",
      age: (data.age as string) || "",
      weight: (data.weight as string) || "",
      price: (data.price as string) || "",
      status: (data.status as Rooster["status"]) || "Available",
      health: (data.health as Rooster["health"]) || "good",
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      dateAdded: (data.dateAdded as string) || new Date().toISOString().split("T")[0],
      description: (data.description as string) || "",
      locationId: (data.locationId as string) || "",
      location: (data.location as string) || "",
      locationAddress: (data.locationAddress as string) || undefined,
      owner: data.owner as string | undefined,
      image: data.image as string | undefined,
      vaccinations: Array.isArray(data.vaccinations) ? (data.vaccinations as Vaccination[]) : undefined,
    };
  });

  // Get total count
  let total = 0;
  try {
    const countQuery = query.count();
    const countSnapshot = await countQuery.get();
    total = countSnapshot.data().count;
  } catch (error) {
    console.warn("Count query failed, using estimation:", error);
    total = roosters.length < limit ? (page - 1) * limit + roosters.length : page * limit + 1;
  }
  
  const totalPages = Math.ceil(total / limit);

  return {
    roosters,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getRoosterById = async (
  user: SessionUser | null,
  id: string
): Promise<Rooster | null> => {
  assertRoosterPermission(user, "read");

  const doc = await roostersCollectionRef().doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as Record<string, unknown>;

  // Ensure all required fields exist, provide defaults if missing
  const rooster: Rooster = {
    id: doc.id,
    breedId: (data.breedId as string) || "",
    breed: (data.breed as string) || "",
    name: (data.name as string) || "",
    age: (data.age as string) || "",
    weight: (data.weight as string) || "",
    price: (data.price as string) || "",
    status: (data.status as Rooster["status"]) || "Available",
    health: (data.health as Rooster["health"]) || "good",
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    dateAdded:
      (data.dateAdded as string) || new Date().toISOString().split("T")[0],
    description: (data.description as string) || "",
    locationId: (data.locationId as string) || "",
    location: (data.location as string) || "",
    locationAddress: (data.locationAddress as string) || undefined,
    owner: data.owner as string | undefined,
    image: data.image as string | undefined,
    vaccinations: Array.isArray(data.vaccinations)
      ? (data.vaccinations as Vaccination[])
      : undefined,
  };

  return rooster;
};

export interface CreateRoosterInput {
  id: string;
  breedId: string;
  breed: string;
  name: string;
  age: string;
  weight: string;
  price: string;
  status: Rooster["status"];
  health: Rooster["health"];
  images: string[];
  dateAdded: string;
  description: string;
  locationId: string;
  location: string;
  locationAddress?: string;
  owner?: string;
  image?: string;
  vaccinations?: Array<{ name: string; date: string }>;
}

export interface UpdateRoosterInput {
  id?: string;
  breedId?: string;
  breed?: string;
  name?: string;
  age?: string;
  weight?: string;
  price?: string;
  status?: Rooster["status"];
  health?: Rooster["health"];
  images?: string[];
  locationId?: string;
  location?: string;
  locationAddress?: string;
  dateAdded?: string;
  description?: string;
  owner?: string | null;
  image?: string | null;
  vaccinations?: Array<{ name: string; date: string }> | null;
}

// Helper function to remove undefined values for Firestore
const removeUndefined = (
  obj: Record<string, unknown>
): Record<string, unknown> => {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

const buildRoosterDocFromCreate = (
  input: CreateRoosterInput
): Omit<Rooster, "id"> => {
  const docData: Record<string, unknown> = {
    breedId: input.breedId,
    breed: input.breed,
    name: input.name,
    nameLower: input.name.toLowerCase(), // For search indexing
    age: input.age,
    weight: input.weight,
    price: input.price,
    status: input.status,
    health: input.health,
    images: input.images || [],
    dateAdded: input.dateAdded,
    description: input.description,
    locationId: input.locationId,
    location: input.location,
    locationAddress: input.locationAddress,
  };

  // Only add optional fields if they have values
  if (input.owner) {
    docData.owner = input.owner;
  }
  const imageUrl = input.image || (input.images && input.images[0]);
  if (imageUrl) {
    docData.image = imageUrl;
  }
  if (input.vaccinations && input.vaccinations.length > 0) {
    docData.vaccinations = input.vaccinations;
  }

  return docData as Omit<Rooster, "id">;
};

const applyUpdateToRooster = (
  existing: Rooster,
  input: UpdateRoosterInput
): Omit<Rooster, "id"> => {
  const updatedName = input.name !== undefined ? input.name : existing.name;
  
  const docData: Record<string, unknown> = {
    breedId: input.breedId !== undefined ? input.breedId : existing.breedId,
    breed: input.breed !== undefined ? input.breed : existing.breed,
    name: updatedName,
    nameLower: updatedName.toLowerCase(), // Update search index
    age: input.age !== undefined ? input.age : existing.age,
    weight: input.weight !== undefined ? input.weight : existing.weight,
    price: input.price !== undefined ? input.price : existing.price,
    status: input.status !== undefined ? input.status : existing.status,
    health: input.health !== undefined ? input.health : existing.health,
    images: input.images !== undefined ? input.images : existing.images,
    dateAdded:
      input.dateAdded !== undefined ? input.dateAdded : existing.dateAdded,
    description:
      input.description !== undefined
        ? input.description
        : existing.description,
    location: input.location !== undefined ? input.location : existing.location,
  };

  // Handle optional fields - only include if they have values
  // If undefined, use existing value; if null/empty, remove field
  if (input.owner !== undefined) {
    if (input.owner !== null && input.owner !== "") {
      docData.owner = input.owner;
    }
    // If null or empty string, don't include (will be removed from Firestore with merge)
  } else if (existing.owner !== undefined && existing.owner !== null) {
    docData.owner = existing.owner;
  }

  // Handle image
  if (input.image !== undefined) {
    if (input.image !== null && input.image !== "") {
      docData.image = input.image;
    }
  } else if (input.images && input.images.length > 0 && input.images[0]) {
    docData.image = input.images[0];
  } else if (existing.image !== undefined && existing.image !== null) {
    docData.image = existing.image;
  }

  // Handle vaccinations
  if (input.vaccinations !== undefined) {
    if (input.vaccinations !== null && input.vaccinations.length > 0) {
      docData.vaccinations = input.vaccinations;
    }
    // If null or empty array, don't include (will be removed from Firestore with merge)
  } else if (
    existing.vaccinations !== undefined &&
    existing.vaccinations !== null
  ) {
    docData.vaccinations = existing.vaccinations;
  }

  return docData as Omit<Rooster, "id">;
};

export const createRooster = async (
  user: SessionUser | null,
  input: CreateRoosterInput
): Promise<Rooster> => {
  assertRoosterPermission(user, "create");

  const docRef = roostersCollectionRef().doc(input.id);

  const docData = buildRoosterDocFromCreate(input);

  // Remove undefined values before saving to Firestore
  const cleanedData = removeUndefined(docData as Record<string, unknown>);

  await docRef.set(cleanedData);

  // Invalidate caches
  await invalidateRoosterCaches();

  const createdRooster: Rooster = {
    id: docRef.id,
    ...docData,
  };

  logAuditEvent(user, {
    action: "create",
    entity: "rooster",
    entityId: createdRooster.id,
    entityName: createdRooster.name,
    description: `Created rooster: ${createdRooster.name} (${createdRooster.breed})`,
    details: {
      metadata: {
        breed: createdRooster.breed,
        status: createdRooster.status,
        price: createdRooster.price,
        location: createdRooster.location,
      },
    },
  });

  return createdRooster;
};

export const updateRooster = async (
  user: SessionUser | null,
  id: string,
  input: UpdateRoosterInput
): Promise<Rooster> => {
  assertRoosterPermission(user, "update");

  const docRef = roostersCollectionRef().doc(id);

  let updated: Rooster | null = null;

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    const existing = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Rooster, "id">),
    } as Rooster;

    const updatedDoc = applyUpdateToRooster(existing, input);

    // Remove undefined values before saving to Firestore
    const cleanedDoc = removeUndefined(updatedDoc as Record<string, unknown>);

    tx.set(docRef, cleanedDoc, { merge: true });

    updated = {
      id: snapshot.id,
      ...updatedDoc,
    };
  });

  if (!updated) {
    throw new Error("UNKNOWN_ERROR");
  }

  // Invalidate caches
  await invalidateRoosterCaches();

  const updatedRooster = updated as Rooster;

  logAuditEvent(user, {
    action: "update",
    entity: "rooster",
    entityId: updatedRooster.id,
    entityName: updatedRooster.name,
    description: `Updated rooster: ${updatedRooster.name}`,
    details: {
      metadata: {
        breed: updatedRooster.breed,
        status: updatedRooster.status,
        price: updatedRooster.price,
        location: updatedRooster.location,
      },
    },
  });

  return updatedRooster;
};

export const deleteRooster = async (
  user: SessionUser | null,
  id: string
): Promise<void> => {
  assertRoosterPermission(user, "delete");

  const docRef = roostersCollectionRef().doc(id);
  let deletedRooster: Rooster | null = null;

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    deletedRooster = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Rooster, "id">),
    } as Rooster;

    tx.delete(docRef);
  });

  // Invalidate caches
  await invalidateRoosterCaches();

  if (deletedRooster) {
    const rooster = deletedRooster as Rooster;
    logAuditEvent(user, {
      action: "delete",
      entity: "rooster",
      entityId: rooster.id,
      entityName: rooster.name,
      description: `Deleted rooster: ${rooster.name}`,
      details: {
        metadata: {
          breed: rooster.breed,
          status: rooster.status,
          price: rooster.price,
        },
      },
    });
  }
};

export interface RoosterStats {
  total: number;
  available: number;
  sold: number;
  reserved: number;
  quarantine: number;
  totalValue: number;
  availableValue: number;
  averagePrice: number;
  topBreed: string;
}

export const getRoosterStats = async (
  user: SessionUser | null
): Promise<RoosterStats> => {
  assertRoosterPermission(user, "readStats");

  const roosters = await getRoosters(user);

  const total = roosters.length;
  const available = roosters.filter((r) => r.status === "Available").length;
  const sold = roosters.filter((r) => r.status === "Sold").length;
  const reserved = roosters.filter((r) => r.status === "Reserved").length;
  const quarantine = roosters.filter((r) => r.status === "Quarantine").length;

  const totalValue = roosters.reduce(
    (sum, r) => sum + parseFloat(r.price || "0"),
    0
  );
  const availableValue = roosters
    .filter((r) => r.status === "Available")
    .reduce((sum, r) => sum + parseFloat(r.price || "0"), 0);

  const averagePrice = total > 0 ? totalValue / total : 0;

  const breedCounts = roosters.reduce(
    (acc, r) => {
      acc[r.breed] = (acc[r.breed] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topBreed =
    Object.entries(breedCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

  return {
    total,
    available,
    sold,
    reserved,
    quarantine,
    totalValue,
    availableValue,
    averagePrice,
    topBreed,
  };
};
