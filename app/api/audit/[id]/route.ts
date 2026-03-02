import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getAuditLogById } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    const { id } = await params;

    const log = await getAuditLogById(sessionUser, id);

    if (!log) {
      return jsonError("NOT_FOUND", "Audit log not found.", 404);
    }

    return jsonSuccess(log, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view this audit log.",
          403
        );
      }
    }

    console.error("GET /api/audit/[id] error:", error);
    return jsonError("AUDIT_FETCH_FAILED", "Failed to load audit log.", 500);
  }
}
