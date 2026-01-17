import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase";
import { jsonError, jsonSuccess } from "@/lib/auth";

interface ForgotPasswordRequestBody {
  email: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForgotPasswordRequestBody;

    if (!body?.email) {
      return jsonError("BAD_REQUEST", "Email is required.", 400);
    }

    const link = await adminAuth.generatePasswordResetLink(body.email);

    // In a production app, you would send this link via your own email provider.
    // For now we just return success if link generation worked.

    return jsonSuccess(
      {
        email: body.email,
        link,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return jsonError(
      "AUTH_FORGOT_PASSWORD_FAILED",
      error?.message || "Failed to send password reset link.",
      400
    );
  }
}


