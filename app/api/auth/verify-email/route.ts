import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase";
import { jsonError, jsonSuccess } from "@/lib/auth";

interface VerifyEmailRequestBody {
  oobCode: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyEmailRequestBody;

    if (!body?.oobCode) {
      return jsonError("BAD_REQUEST", "oobCode is required.", 400);
    }

    await adminAuth.applyActionCode(body.oobCode);

    return jsonSuccess(
      {
        verified: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify email error:", error);
    return jsonError(
      "AUTH_VERIFY_EMAIL_FAILED",
      error?.message || "Failed to verify email.",
      400
    );
  }
}


