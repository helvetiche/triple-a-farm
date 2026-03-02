import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import {
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "@/lib/suppliers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const { id } = await params;
    const supplier = await getSupplierById(id);

    if (!supplier) {
      return jsonError("NOT_FOUND", "Supplier not found", 404);
    }

    return jsonSuccess(supplier, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view this supplier.",
          403
        );
      }
    }

    console.error("GET /api/suppliers/[id] error:", error);
    return jsonError(
      "SUPPLIER_FETCH_FAILED",
      "Failed to fetch supplier.",
      500
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const { id } = await params;
    const body = await request.json();

    const supplier = await updateSupplier(id, {
      name: body.name,
      contactPerson: body.contactPerson,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
    });

    return jsonSuccess(supplier, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to update suppliers.",
          403
        );
      }

      if (error.message === "Supplier not found") {
        return jsonError("NOT_FOUND", "Supplier not found", 404);
      }
    }

    console.error("PUT /api/suppliers/[id] error:", error);
    return jsonError(
      "SUPPLIER_UPDATE_FAILED",
      "Failed to update supplier.",
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const { id } = await params;
    await deleteSupplier(id);

    return jsonSuccess({ message: "Supplier deleted successfully" }, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to delete suppliers.",
          403
        );
      }
    }

    console.error("DELETE /api/suppliers/[id] error:", error);
    return jsonError(
      "SUPPLIER_DELETE_FAILED",
      "Failed to delete supplier.",
      500
    );
  }
}
