import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getAuditLogs, type GetAuditLogsOptions } from "@/lib/audit";
import type { AuditAction, AuditEntity, AuditSeverity } from "@/lib/audit-types";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    const { searchParams } = new URL(request.url);

    const options: GetAuditLogsOptions = {
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
      filters: {},
    };

    const action = searchParams.get("action");
    if (action) {
      options.filters!.action = action as AuditAction;
    }

    const entity = searchParams.get("entity");
    if (entity) {
      options.filters!.entity = entity as AuditEntity;
    }

    const severity = searchParams.get("severity");
    if (severity) {
      options.filters!.severity = severity as AuditSeverity;
    }

    const userId = searchParams.get("userId");
    if (userId) {
      options.filters!.userId = userId;
    }

    const startDate = searchParams.get("startDate");
    if (startDate) {
      options.filters!.startDate = startDate;
    }

    const endDate = searchParams.get("endDate");
    if (endDate) {
      options.filters!.endDate = endDate;
    }

    const search = searchParams.get("search");
    if (search) {
      options.filters!.search = search;
    }

    const result = await getAuditLogs(sessionUser, options);

    return jsonSuccess(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view audit logs.",
          403
        );
      }
    }

    console.error("GET /api/audit error:", error);
    return jsonError("AUDIT_FETCH_FAILED", "Failed to load audit logs.", 500);
  }
}
