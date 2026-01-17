import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return jsonError("INVALID_REQUEST", "No image file provided.", 400);
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return jsonError(
        "INVALID_REQUEST",
        "Image size exceeds 10MB limit.",
        400
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return jsonError(
        "INVALID_REQUEST",
        "Invalid image type. Only JPEG, PNG, and GIF are allowed.",
        400
      );
    }

    const imgbbApiKey = process.env.NEXT_PRIVATE_IMGBB_API_KEY;

    if (!imgbbApiKey) {
      console.error("NEXT_PRIVATE_IMGBB_API_KEY is not set.");
      return jsonError(
        "SERVER_MISCONFIGURED",
        "Image upload is not configured correctly.",
        500
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const imgbbFormData = new URLSearchParams();
    imgbbFormData.append("key", imgbbApiKey);
    imgbbFormData.append("image", base64Image);

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: imgbbFormData.toString(),
    });

    if (!imgbbResponse.ok) {
      const errorData = await imgbbResponse.json().catch(() => ({}));
      console.error("ImgBB API error:", errorData);
      return jsonError(
        "IMAGE_UPLOAD_FAILED",
        "Failed to upload image to imgbb.",
        500
      );
    }

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success || !imgbbData.data?.url) {
      console.error("ImgBB API returned error:", imgbbData);
      return jsonError(
        "IMAGE_UPLOAD_FAILED",
        "Failed to upload image to imgbb.",
        500
      );
    }

    return jsonSuccess(
      {
        url: imgbbData.data.url,
        deleteUrl: imgbbData.data.delete_url,
        thumb: imgbbData.data.thumb?.url || imgbbData.data.url,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }
    }

    console.error("POST /api/roosters/upload-image error:", error);
    return jsonError(
      "IMAGE_UPLOAD_FAILED",
      "Failed to upload image.",
      500
    );
  }
}

