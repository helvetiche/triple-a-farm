import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth, adminDb } from "./firebase";
import { mergeRoles, type AppRole } from "./roles";

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

// Detect production environment more reliably
// Vercel sets VERCEL=1 and VERCEL_ENV=production in production
// Also check NODE_ENV as fallback
const IS_PRODUCTION =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production" ||
  (process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "development");

export interface SessionUser {
  uid: string;
  email: string | null;
  roles: AppRole[];
  claims: DecodedIdToken;
  profile?: Record<string, unknown> | null;
}

const BASE_SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "X-XSS-Protection": "0",
};

const AUTH_CACHE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  Expires: "0",
};

const AUTH_CSP_HEADER =
  "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'";

const buildAuthHeaders = (extraHeaders?: HeadersInit): HeadersInit => {
  const headers = new Headers();

  Object.entries(BASE_SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  Object.entries(AUTH_CACHE_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  headers.set("Content-Security-Policy", AUTH_CSP_HEADER);

  if (extraHeaders) {
    const extra = new Headers(extraHeaders);
    extra.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
};

export const createSessionFromIdToken = async (idToken: string) => {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });
  const decodedClaims = await adminAuth.verifySessionCookie(
    sessionCookie,
    true
  );

  return { sessionCookie, decodedClaims };
};

export const setSessionCookie = async (sessionCookie: string) => {
  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
  };

  console.log("[AUTH] Setting session cookie:", {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    isProduction: IS_PRODUCTION,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });

  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, cookieOptions);
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const getDecodedSessionClaims =
  async (): Promise<DecodedIdToken | null> => {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    try {
      const decodedClaims = await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      );
      return decodedClaims;
    } catch (error) {
      console.error("Failed to verify session cookie:", error);
      return null;
    }
  };

export const getSessionUser = async (): Promise<SessionUser | null> => {
  const decodedClaims = await getDecodedSessionClaims();

  if (!decodedClaims) {
    return null;
  }

  const userDoc = await adminDb
    .collection("users")
    .doc(decodedClaims.uid)
    .get();
  const userData = userDoc.exists
    ? (userDoc.data() as Record<string, unknown>)
    : null;
  const rolesFromClaims =
    (decodedClaims as unknown as { roles?: AppRole[] }).roles ?? [];
  const rolesFromDoc = (userData?.roles as AppRole[] | undefined) ?? [];

  const mergedRoles = mergeRoles(rolesFromClaims, rolesFromDoc);

  return {
    uid: decodedClaims.uid,
    email: decodedClaims.email ?? null,
    roles: mergedRoles,
    claims: decodedClaims,
    profile: userData,
  };
};

export const jsonSuccess = <T>(data: T, init?: ResponseInit): NextResponse => {
  const headers = buildAuthHeaders(init?.headers);

  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      ...init,
      headers,
    }
  );
};

export const jsonError = (
  code: string,
  message: string,
  status: number
): NextResponse => {
  const headers = buildAuthHeaders();

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    {
      status,
      headers,
    }
  );
};
