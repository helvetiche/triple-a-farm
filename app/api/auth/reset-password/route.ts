import { NextResponse } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/auth";

interface ResetPasswordRequestBody {
  oobCode: string;
  newPassword: string;
}

const getApiKey = () => {
  const apiKey = process.env.NEXT_PRIVATE_FIREBASE_WEB_API_KEY;

  if (!apiKey) {
    console.error("NEXT_PRIVATE_FIREBASE_WEB_API_KEY is not set.");
    return null;
  }

  return apiKey;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResetPasswordRequestBody;

    if (!body?.oobCode || !body?.newPassword) {
      return jsonError(
        "BAD_REQUEST",
        "oobCode and newPassword are required.",
        400
      );
    }

    const apiKey = getApiKey();

    if (!apiKey) {
      return jsonError(
        "SERVER_MISCONFIGURED",
        "Authentication is not configured correctly.",
        500
      );
    }

    const resetResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oobCode: body.oobCode,
          newPassword: body.newPassword,
        }),
      }
    );

    const resetData = await resetResponse.json();

    if (!resetResponse.ok || resetData.error) {
      const errorMessage = resetData?.error?.message;

      let message = "Failed to reset password. Please try again.";
      let code = "AUTH_RESET_PASSWORD_FAILED";

      if (errorMessage === "EXPIRED_OOB_CODE") {
        code = "RESET_CODE_EXPIRED";
        message = "This reset link has expired. Please request a new one.";
      } else if (errorMessage === "INVALID_OOB_CODE") {
        code = "RESET_CODE_INVALID";
        message = "This reset link is invalid. Please request a new one.";
      } else if (errorMessage === "WEAK_PASSWORD") {
        code = "WEAK_PASSWORD";
        message = "Password is too weak. Please choose a stronger password.";
      }

      return jsonError(code, message, 400);
    }

    return jsonSuccess(
      {
        email: resetData.email ?? null,
        reset: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return jsonError(
      "AUTH_RESET_PASSWORD_FAILED",
      error?.message || "Failed to reset password.",
      400
    );
  }
}


