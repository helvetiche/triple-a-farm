import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { adminDb } from "@/lib/firebase";
import { hasRequiredRole } from "@/lib/roles";

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

const assertReviewPermission = (user: Awaited<ReturnType<typeof getSessionUser>>) => {
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const canRead = hasRequiredRole(user.roles, ["admin", "staff"]);
  if (!canRead) {
    throw new Error("FORBIDDEN");
  }
};

const reviewsCollectionRef = () => adminDb.collection(REVIEWS_COLLECTION);

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    assertReviewPermission(sessionUser);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "published" | "pending" | "hidden" | null;

    let query = reviewsCollectionRef().orderBy("date", "desc");

    if (status) {
      query = query.where("status", "==", status) as typeof query;
    }

    const snapshot = await query.get();

    const reviews: Review[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date || "",
        customer: data.customer || "",
        rating: data.rating || 0,
        rooster: data.rooster || "",
        comment: data.comment || "",
        status: data.status || "pending",
        customerId: data.customerId,
        transactionId: data.transactionId,
      };
    });

    return jsonSuccess(reviews, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view reviews.",
          403
        );
      }
    }

    console.error("GET /api/feedback/reviews error:", error);
    return jsonError(
      "REVIEWS_FETCH_FAILED",
      "Failed to load reviews.",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

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

    // Create new review
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
    console.error("POST /api/feedback/reviews error:", error);
    return jsonError(
      "REVIEW_CREATE_FAILED",
      "Failed to create review.",
      500
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    assertReviewPermission(sessionUser);

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return jsonError(
        "INVALID_INPUT",
        "Missing required fields: id, status",
        400
      );
    }

    if (!["published", "pending", "hidden"].includes(status)) {
      return jsonError(
        "INVALID_STATUS",
        "Status must be one of: published, pending, hidden",
        400
      );
    }

    const docRef = reviewsCollectionRef().doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return jsonError(
        "REVIEW_NOT_FOUND",
        "Review not found.",
        404
      );
    }

    await docRef.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return jsonSuccess(
      { id, status, message: "Review status updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/feedback/reviews error:", error);
    return jsonError(
      "REVIEW_UPDATE_FAILED",
      "Failed to update review.",
      500
    );
  }
}

