import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  getSalesTransactionById,
  updateSalesTransaction,
  deleteSalesTransaction,
  type UpdateSalesTransactionInput,
} from "@/lib/sales";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const { id } = await params;
    const transaction = await getSalesTransactionById(sessionUser, id);

    if (!transaction) {
      return jsonError("NOT_FOUND", "Sales transaction not found.", 404);
    }

    return jsonSuccess(transaction, { status: 200 });
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

    console.error("GET /api/sales/transactions/[id] error:", error);
    return jsonError(
      "SALES_GET_FAILED",
      `Failed to load sales transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
      500
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    const { id } = await params;
    const body = (await request.json()) as Partial<UpdateSalesTransactionInput>;

    const input: UpdateSalesTransactionInput = {
      notes: body.notes,
    };

    const updated = await updateSalesTransaction(sessionUser, id, input);

    return jsonSuccess(updated, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to update sales transactions.",
          403
        );
      }

      if (error.message === "NOT_FOUND") {
        return jsonError("NOT_FOUND", "Sales transaction not found.", 404);
      }
    }

    console.error("PATCH /api/sales/transactions/[id] error:", error);
    return jsonError(
      "SALES_UPDATE_FAILED",
      "Failed to update sales transaction.",
      500
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    const { id } = await params;

    await deleteSalesTransaction(sessionUser, id);

    return jsonSuccess({ deleted: true }, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to delete sales transactions.",
          403
        );
      }

      if (error.message === "NOT_FOUND") {
        return jsonError("NOT_FOUND", "Sales transaction not found.", 404);
      }
    }

    console.error("DELETE /api/sales/transactions/[id] error:", error);
    return jsonError(
      "SALES_DELETE_FAILED",
      "Failed to delete sales transaction.",
      500
    );
  }
}

