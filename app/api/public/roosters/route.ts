import { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/auth";
import { adminDb } from "@/lib/firebase";
import type { Rooster } from "@/app/admin/data/roosters";

const ROOSTERS_COLLECTION = "roosters";

// Public endpoint - no authentication required
export async function GET() {
  try {
    const snapshot = await adminDb.collection(ROOSTERS_COLLECTION).get();

    const roosters: Rooster[] = snapshot.docs.map((doc) => {
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

    return jsonSuccess(roosters, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/public/roosters error:", error);
    return jsonError(
      "ROOSTERS_LIST_FAILED",
      "Failed to load roosters.",
      500
    );
  }
}
