import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase";
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  jsonError,
  jsonSuccess,
} from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    let userInfo: { uid: string; email: string } | null = null;

    if (sessionCookie) {
      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie);
        userInfo = {
          uid: decoded.sub as string,
          email: decoded.email ?? "Unknown",
        };
        await adminAuth.revokeRefreshTokens(decoded.sub as string);
      } catch (error) {
        console.warn("Failed to verify/revoke session cookie during logout:", error);
      }
    }

    await clearSessionCookie();

    if (userInfo) {
      logAuditEvent(
        {
          uid: userInfo.uid,
          email: userInfo.email,
          roles: [],
          claims: { uid: userInfo.uid } as import("firebase-admin/auth").DecodedIdToken,
        },
        {
          action: "logout",
          entity: "user",
          entityId: userInfo.uid,
          entityName: userInfo.email,
          description: `User logged out: ${userInfo.email}`,
        }
      );
    }

    return jsonSuccess({ loggedOut: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Logout error:", error);
    return jsonError("AUTH_LOGOUT_FAILED", "Failed to logout.", 500);
  }
}


