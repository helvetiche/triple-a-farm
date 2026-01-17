import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser, jsonError, jsonSuccess, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      console.log("[AUTH/ME] No session cookie found");
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      console.error("[AUTH/ME] Session cookie exists but verification failed");
      return jsonError("SESSION_INVALID", "Failed to verify session.", 401);
    }

    return jsonSuccess(
      {
        uid: sessionUser.uid,
        email: sessionUser.email,
        roles: sessionUser.roles,
        claims: sessionUser.claims,
        profile: sessionUser.profile,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH/ME] Get current user error:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return jsonError(
      "SESSION_INVALID",
      "Failed to verify session.",
      401
    );
  }
}


