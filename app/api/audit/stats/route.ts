import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getAuditStats } from "@/lib/audit";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    const stats = await getAuditStats(sessionUser);

    return jsonSuccess(stats, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError(
          "FORBIDDEN",
          "You do not have permission to view audit stats.",
          403
        );
      }
    }

    console.error("GET /api/audit/stats error:", error);
    return jsonError("AUDIT_STATS_FAILED", "Failed to load audit stats.", 500);
  }
}
