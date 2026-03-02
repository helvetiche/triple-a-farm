import { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/auth";
import { adminDb } from "@/lib/firebase";

const REVIEWS_COLLECTION = "reviews";

export interface Review {
  id: string;
  date: string;
  customer: string;
  rating: number;
  rooster: string;
  comment: string;
  status: "published" | "pending" | "hidden";
}

const reviewsCollectionRef = () => adminDb.collection(REVIEWS_COLLECTION);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit") || "10";
    const limit = Math.max(1, Math.min(50, Number.parseInt(limitParam, 10) || 10));

    // NOTE:
    // Using `.where('status','==','published').orderBy('date','desc')` requires a composite index.
    // To avoid requiring manual index creation for now, we fetch published reviews and sort in-memory.
    const snapshot = await reviewsCollectionRef()
      .where("status", "==", "published")
      .limit(200)
      .get();

    const reviews: Review[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date || "",
        customer: data.customer || "",
        rating: data.rating || 0,
        rooster: data.rooster || "",
        comment: data.comment || "",
        status: data.status || "published",
      };
    });

    const sorted = reviews
      .filter((r) => r.status === "published")
      .sort((a, b) => {
        const aTime = Date.parse(a.date);
        const bTime = Date.parse(b.date);
        const safeATime = Number.isFinite(aTime) ? aTime : 0;
        const safeBTime = Number.isFinite(bTime) ? bTime : 0;
        return safeBTime - safeATime;
      })
      .slice(0, limit);

    return jsonSuccess(sorted, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/public/testimonials error:", error);
    return jsonError(
      "TESTIMONIALS_FETCH_FAILED",
      "Failed to load testimonials.",
      500
    );
  }
}
