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
  customerId?: string;
  transactionId?: string;
}

const reviewsCollectionRef = () => adminDb.collection(REVIEWS_COLLECTION);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, rating, rooster, comment, customerId, transactionId } = body;

    // Validation
    if (!customer || !rating || !rooster || !comment) {
      return jsonError(
        "INVALID_INPUT",
        "Missing required fields: customer, rating, rooster, comment",
        400
      );
    }

    if (rating < 1 || rating > 5) {
      return jsonError(
        "INVALID_RATING",
        "Rating must be between 1 and 5",
        400
      );
    }

    // Create new review with pending status (requires admin approval)
    const newReview = {
      customer,
      rating,
      rooster,
      comment,
      status: "pending",
      date: new Date().toISOString().split('T')[0],
      customerId,
      transactionId,
      createdAt: new Date().toISOString(),
    };

    const docRef = await reviewsCollectionRef().add(newReview);
    
    return jsonSuccess(
      { id: docRef.id, ...newReview },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/public/reviews error:", error);
    return jsonError(
      "REVIEW_CREATE_FAILED",
      "Failed to create review.",
      500
    );
  }
}
