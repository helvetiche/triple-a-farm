import { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/auth";
import { adminDb } from "@/lib/firebase";

const LOCATIONS_COLLECTION = "farm_locations";

export interface FarmLocation {
  locationId: string;
  name: string;
  address?: string;
}

const locationsCollectionRef = () => adminDb.collection(LOCATIONS_COLLECTION);

export async function GET() {
  try {
    const snapshot = await locationsCollectionRef()
      .orderBy("name", "asc")
      .get();

    const locations: FarmLocation[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        locationId: data.locationId || doc.id,
        name: data.name || "",
        address: data.address,
      };
    });

    return jsonSuccess(locations, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/public/locations error:", error);
    return jsonError("LOCATIONS_FETCH_FAILED", "Failed to load locations.", 500);
  }
}