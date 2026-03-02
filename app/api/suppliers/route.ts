import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getAllSuppliers, createSupplier } from "@/lib/suppliers";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const suppliers = await getAllSuppliers();
    return jsonSuccess(suppliers, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view suppliers.",
          403
        );
      }
    }

    console.error("GET /api/suppliers error:", error);
    return jsonError(
      "SUPPLIERS_LIST_FAILED",
      "Failed to load suppliers.",
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

    // Validate required fields
    if (!body.name || !body.phone) {
      return jsonError(
        "VALIDATION_ERROR",
        "Name and phone are required",
        400
      );
    }

    const supplier = await createSupplier({
      name: body.name,
      contactPerson: body.contactPerson,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
    });

    return jsonSuccess(supplier, { status: 201 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to create suppliers.",
          403
        );
      }
    }

    console.error("POST /api/suppliers error:", error);
    return jsonError(
      "SUPPLIER_CREATE_FAILED",
      "Failed to create supplier.",
      500
    );
  }
}
