import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase";
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  jsonError,
  jsonSuccess,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie);
        await adminAuth.revokeRefreshTokens(decoded.sub as string);
      } catch (error) {
        console.warn("Failed to verify/revoke session cookie during logout:", error);
      }
    }

    await clearSessionCookie();

    return jsonSuccess({ loggedOut: true }, { status: 200 });
  } catch (error: any) {
    console.error("Logout error:", error);
    return jsonError("AUTH_LOGOUT_FAILED", "Failed to logout.", 500);
  }
}


