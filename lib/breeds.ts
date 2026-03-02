import { adminDb } from "@/lib/firebase";
import { getSessionUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/roles";

export interface RoosterBreed {
  breedId: string;
  name: string;
  description: string;
  characteristics: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

const BREEDS_COLLECTION = "rooster_breeds";

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

export const getBreeds = async (): Promise<string[]> => {
  try {
    const snapshot = await breedsCollectionRef()
      .orderBy("name", "asc")
      .get();

    const breeds = snapshot.docs.map((doc) => {
      const data = doc.data();
      return data.name as string;
    }).filter(name => name && name.trim() !== "");

    return breeds;
  } catch (error) {
    console.error("Error fetching breeds:", error);
    // Fallback to hardcoded breeds if there's an error
    return [
      "Kelso",
      "Sweater", 
      "Roundhead",
      "Hatch",
      "Grey",
      "Butcher",
      "Lemon",
      "Claret"
    ];
  }
};

export const getBreedsWithDetails = async (): Promise<RoosterBreed[]> => {
  await assertBreedPermission("read");

  const snapshot = await breedsCollectionRef()
    .orderBy("name", "asc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      breedId: data.breedId || doc.id,
      name: data.name || "",
      description: data.description || "",
      characteristics: data.characteristics || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
    };
  });
};
