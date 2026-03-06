import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  getSalesTransactions,
  getSalesTransactionsPaginated,
  createSalesTransaction,
  type CreateSalesTransactionInput,
} from "@/lib/sales";
import { withCache, CACHE_TTL } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const paymentMethod = searchParams.get("paymentMethod") || undefined;

    // If pagination is requested
    if (searchParams.has("page") || searchParams.has("limit")) {
      const cacheKey = `sales:paginated:${page}:${limit}:${search || ''}:${paymentMethod || ''}`;
      
      const result = await withCache(
        cacheKey,
        CACHE_TTL.FAST,
        () => getSalesTransactionsPaginated(sessionUser, {
          page,
          limit,
          search,
          paymentMethod,
        })
      );

      return jsonSuccess(result, { status: 200 });
    }

    // Legacy: return all transactions
    const cacheKey = "sales:transactions:all";
    const transactions = await withCache(
      cacheKey,
      CACHE_TTL.FAST,
      () => getSalesTransactions(sessionUser)
    );

    return jsonSuccess(transactions, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view sales transactions.",
          403
        );
      }
    }

    console.error("GET /api/sales/transactions error:", error);
    return jsonError(
      "SALES_LIST_FAILED",
      "Failed to load sales transactions.",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const body = (await request.json()) as Partial<CreateSalesTransactionInput>;

    if (
      !body.roosterId ||
      !body.breed ||
      !body.customerName ||
      !body.customerContact ||
      !body.amount ||
      !body.paymentMethod
    ) {
      return jsonError(
        "INVALID_REQUEST",
        "Missing required sales transaction fields.",
        400
      );
    }

    const input: CreateSalesTransactionInput = {
      roosterId: body.roosterId,
      breed: body.breed,
      customerName: body.customerName,
      customerContact: body.customerContact,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      commission: body.commission,
      agentName: body.agentName,
    };

    const created = await createSalesTransaction(sessionUser, input);

    return jsonSuccess(created, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to create sales transactions.",
          403
        );
      }
    }

    console.error("POST /api/sales/transactions error:", error);
    return jsonError(
      "SALES_CREATE_FAILED",
      "Failed to create sales transaction.",
      500
    );
  }
}
