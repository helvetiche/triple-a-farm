import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase";
import {
  createSessionFromIdToken,
  jsonError,
  jsonSuccess,
  setSessionCookie,
} from "@/lib/auth";
import { validateRequestBody, withTimeout } from "@/lib/utils";

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = validateRequestBody<LoginRequestBody>(
      body,
      ['email', 'password']
    );
    
    if (!validation.isValid) {
      return jsonError("BAD_REQUEST", validation.errors.join(', '), 400);
    }
    
    const { email, password } = validation.data!;

    const apiKey = process.env.NEXT_PRIVATE_FIREBASE_WEB_API_KEY;

    if (!apiKey) {
      console.error("[LOGIN] NEXT_PRIVATE_FIREBASE_WEB_API_KEY is not set.");
      return jsonError(
        "SERVER_MISCONFIGURED",
        "Authentication is not configured correctly.",
        500
      );
    }

    // Add timeout to Firebase Identity Platform call
    const idpResponse = await withTimeout(
      fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      ),
      10000, // 10 second timeout
      "Authentication request timed out"
    );

    const idpData = await idpResponse.json();

    if (!idpResponse.ok || !idpData.idToken) {
      console.error("[LOGIN] Firebase Identity Platform error:", {
        status: idpResponse.status,
        error: idpData?.error,
        message: idpData?.error?.message,
      });
      
      // More specific error handling
      if (idpData?.error?.message === "INVALID_PASSWORD") {
        return jsonError("INVALID_CREDENTIALS", "Invalid password.", 401);
      }
      
      if (idpData?.error?.message === "EMAIL_NOT_FOUND") {
        return jsonError("INVALID_CREDENTIALS", "Email not found.", 401);
      }
      
      if (idpData?.error?.message === "USER_DISABLED") {
        return jsonError("ACCOUNT_DISABLED", "Account has been disabled.", 403);
      }
      
      if (idpData?.error?.message === "TOO_MANY_ATTEMPTS_TRY_LATER") {
        return jsonError("RATE_LIMITED", "Too many failed attempts. Please try again later.", 429);
      }

      return jsonError("AUTH_LOGIN_FAILED", "Failed to sign in. Please try again.", 401);
    }

    const decodedIdToken = await adminAuth.verifyIdToken(idpData.idToken);

    if (!decodedIdToken.email_verified) {
      return jsonError(
        "EMAIL_NOT_VERIFIED",
        "Please verify your email before logging in. Check your inbox for a verification link.",
        403
      );
    }

    const { sessionCookie, decodedClaims } = await createSessionFromIdToken(
      idpData.idToken
    );

    // Update user record with retry logic
    try {
      await withTimeout(
        adminDb
          .collection("users")
          .doc(decodedClaims.uid)
          .set(
            {
              emailVerified: true,
              lastLogin: new Date(),
            },
            { merge: true }
          ),
        5000,
        "User record update timed out"
      );
    } catch (updateError) {
      console.error("Failed to update user record:", updateError);
      // Don't fail the login for this
    }

    await setSessionCookie(sessionCookie);
    
    console.log("[LOGIN] Successfully created session for:", decodedClaims.email);

    return jsonSuccess(
      {
        uid: decodedClaims.uid,
        email: decodedClaims.email ?? null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // More specific error handling
    if (error.message === "Authentication request timed out") {
      console.error("[LOGIN] Authentication timeout:", error);
      return jsonError("TIMEOUT", "Authentication request timed out. Please try again.", 408);
    }
    
    if (error.message === "User record update timed out") {
      console.error("[LOGIN] User update timeout:", error);
      // Continue with login since session was created successfully
    }
    
    console.error("[LOGIN] Unexpected login error:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    return jsonError(
      "AUTH_LOGIN_FAILED",
      "An unexpected error occurred during login.",
      500
    );
  }
}
