"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDb = exports.adminAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const serviceAccountJson = process.env.NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountJson) {
    throw new Error("NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT is not set. Please configure it in your environment.");
}
let serviceAccount;
try {
    const trimmed = serviceAccountJson.trim();
    // Handle cases where the entire JSON was wrapped in extra quotes in .env
    const withoutOuterQuotes = (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ? trimmed.slice(1, -1)
        : trimmed;
    serviceAccount = JSON.parse(withoutOuterQuotes);
}
catch (error) {
    console.error("Failed to parse NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT:", error);
    throw new Error("NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT is not valid JSON. Paste the raw service account JSON as the value, with newlines in private_key encoded as \\n.");
}
const firebaseAdminApp = (0, app_1.getApps)().length === 0
    ? (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccount),
        projectId: process.env.NEXT_PRIVATE_FIREBASE_PROJECT_ID,
        databaseURL: process.env.NEXT_PRIVATE_FIREBASE_DATABASE_URL,
        storageBucket: process.env.NEXT_PRIVATE_FIREBASE_STORAGE_BUCKET,
    })
    : (0, app_1.getApps)()[0];
exports.adminAuth = (0, auth_1.getAuth)(firebaseAdminApp);
exports.adminDb = (0, firestore_1.getFirestore)(firebaseAdminApp);
