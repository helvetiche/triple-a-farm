import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  getSalesTransactions,
  createSalesTransaction,
  type CreateSalesTransactionInput,
} from "@/lib/sales";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    const transactions = await getSalesTransactions(sessionUser);

    return jsonSuccess(transactions, { status: 200 });
  } catch (error: any) {
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
  } catch (error: any) {
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

