import { jsonError, jsonSuccess } from "@/lib/auth";

interface VerifyEmailRequestBody {
  uid: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyEmailRequestBody;

    if (!body?.uid) {
      return jsonError("BAD_REQUEST", "uid is required.", 400);
    }

    return jsonSuccess(
      {
        verified: true,
        message: "Email verification is handled client-side via Firebase Auth action links.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Verify email error:", error);
    return jsonError(
      "AUTH_VERIFY_EMAIL_FAILED",
      err?.message || "Failed to verify email.",
      400
    );
  }
}


