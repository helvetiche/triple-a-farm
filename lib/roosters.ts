import { adminDb } from "@/lib/firebase";
import type { SessionUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/roles";
import type { Rooster } from "@/app/admin/data/roosters";

type RoosterAction = "read" | "create" | "update" | "delete" | "readStats";

const ROOSTERS_COLLECTION = "roosters";

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
      age: (data.age as string) || "",
      weight: (data.weight as string) || "",
      price: (data.price as string) || "",
      status: (data.status as Rooster["status"]) || "Available",
      health: (data.health as Rooster["health"]) || "good",
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      dateAdded: (data.dateAdded as string) || new Date().toISOString().split("T")[0],
      owner: data.owner as string | undefined,
      image: data.image as string | undefined,
    };

    return rooster;
  });
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
    age: (data.age as string) || "",
    weight: (data.weight as string) || "",
    price: (data.price as string) || "",
    status: (data.status as Rooster["status"]) || "Available",
    health: (data.health as Rooster["health"]) || "good",
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    dateAdded: (data.dateAdded as string) || new Date().toISOString().split("T")[0],
    owner: data.owner as string | undefined,
    image: data.image as string | undefined,
  };

  return rooster;
};

export interface CreateRoosterInput {
  id: string;
  breedId: string;
  breed: string;
  age: string;
  weight: string;
  price: string;
  status: Rooster["status"];
  health: Rooster["health"];
  images: string[];
  dateAdded: string;
  owner?: string;
  image?: string;
}

export interface UpdateRoosterInput {
  id?: string;
  breedId?: string;
  breed?: string;
  age?: string;
  weight?: string;
  price?: string;
  status?: Rooster["status"];
  health?: Rooster["health"];
  images?: string[];
  dateAdded?: string;
  owner?: string | null;
  image?: string | null;
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
    age: input.age,
    weight: input.weight,
    price: input.price,
    status: input.status,
    health: input.health,
    images: input.images || [],
    dateAdded: input.dateAdded,
  };

  // Only add optional fields if they have values
  if (input.owner) {
    docData.owner = input.owner;
  }
  const imageUrl = input.image || (input.images && input.images[0]);
  if (imageUrl) {
    docData.image = imageUrl;
  }

  return docData as Omit<Rooster, "id">;
};

const applyUpdateToRooster = (
  existing: Rooster,
  input: UpdateRoosterInput
): Omit<Rooster, "id"> => {
  const docData: Record<string, unknown> = {
    breedId: input.breedId !== undefined ? input.breedId : existing.breedId,
    breed: input.breed !== undefined ? input.breed : existing.breed,
    age: input.age !== undefined ? input.age : existing.age,
    weight: input.weight !== undefined ? input.weight : existing.weight,
    price: input.price !== undefined ? input.price : existing.price,
    status: input.status !== undefined ? input.status : existing.status,
    health: input.health !== undefined ? input.health : existing.health,
    images: input.images !== undefined ? input.images : existing.images,
    dateAdded:
      input.dateAdded !== undefined ? input.dateAdded : existing.dateAdded,
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

  return {
    id: docRef.id,
    ...docData,
  };
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

  return updated;
};

export const deleteRooster = async (
  user: SessionUser | null,
  id: string
): Promise<void> => {
  assertRoosterPermission(user, "delete");

  const docRef = roostersCollectionRef().doc(id);

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    tx.delete(docRef);
  });
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

  const breedCounts = roosters.reduce((acc, r) => {
    acc[r.breed] = (acc[r.breed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
