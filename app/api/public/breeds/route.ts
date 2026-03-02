import { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/auth";
import { adminDb } from "@/lib/firebase";

const BREEDS_COLLECTION = "rooster_breeds";

export interface RoosterBreed {
  breedId: string;
  name: string;
  description: string;
  characteristics: string[];
}

const breedsCollectionRef = () => adminDb.collection(BREEDS_COLLECTION);

export async function GET() {
  try {
    const snapshot = await breedsCollectionRef()
      .orderBy("name", "asc")
      .get();

    const breeds: RoosterBreed[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        breedId: data.breedId || doc.id,
        name: data.name || "",
        description: data.description || "",
        characteristics: data.characteristics || [],
      };
    });

    return jsonSuccess(breeds, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/public/breeds error:", error);
    return jsonError("BREEDS_FETCH_FAILED", "Failed to load breeds.", 500);
  }
}
