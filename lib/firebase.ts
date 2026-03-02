import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccountJson = process.env.NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error(
    "NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT is not set. Please configure it in your environment."
  );
}

let serviceAccount: Record<string, unknown>;

try {
  const trimmed = serviceAccountJson.trim();

  // Handle cases where the entire JSON was wrapped in extra quotes in .env
  const withoutOuterQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  serviceAccount = JSON.parse(withoutOuterQuotes);
} catch (error) {
  console.error(
    "Failed to parse NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT:",
    error
  );
  throw new Error(
    "NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT is not valid JSON. Paste the raw service account JSON as the value, with newlines in private_key encoded as \\n."
  );
}

const firebaseAdminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount as any),
        projectId: process.env.NEXT_PRIVATE_FIREBASE_PROJECT_ID,
        databaseURL: process.env.NEXT_PRIVATE_FIREBASE_DATABASE_URL,
        storageBucket: process.env.NEXT_PRIVATE_FIREBASE_STORAGE_BUCKET,
      })
    : getApps()[0];

export const adminAuth = getAuth(firebaseAdminApp);
export const adminDb = getFirestore(firebaseAdminApp);
