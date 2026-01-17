import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase";
import { DEFAULT_ROLE, type AppRole } from "@/lib/roles";
import { jsonError, jsonSuccess } from "@/lib/auth";

interface SignUpRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignUpRequestBody;

    if (!body?.email || !body?.password || !body?.firstName || !body?.lastName) {
      return jsonError("BAD_REQUEST", "Missing required fields.", 400);
    }

    const userRecord = await adminAuth.createUser({
      email: body.email,
      password: body.password,
      displayName: `${body.firstName} ${body.lastName}`,
      emailVerified: false,
    });

    const initialRoles: AppRole[] = [DEFAULT_ROLE];

    await adminAuth.setCustomUserClaims(userRecord.uid, {
      roles: initialRoles,
    });

    const verificationLink = await adminAuth.generateEmailVerificationLink(
      body.email
    );

    const userDoc = adminDb.collection("users").doc(userRecord.uid);
    await userDoc.set({
      uid: userRecord.uid,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      verificationLink,
      roles: initialRoles,
    });

    return jsonSuccess(
      {
        uid: userRecord.uid,
        email: body.email,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Sign up error:", error);
    return jsonError(
      "AUTH_SIGN_UP_FAILED",
      error?.message || "Failed to create account.",
      400
    );
  }
}


