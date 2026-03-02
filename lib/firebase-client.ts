// Firebase Client SDK Configuration
// This file is for client-side Firebase usage (if needed)
// Note: This app primarily uses Firebase Admin SDK on the server side

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Validate required environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Check for missing environment variables
const missingVars: string[] = [];
if (!apiKey) missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
if (!storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
if (!messagingSenderId)
  missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(
      ", "
    )}. ` +
      `Please configure them in your .env file or Vercel environment variables.`
  );
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: apiKey!,
  authDomain: authDomain!,
  projectId: projectId!,
  storageBucket: storageBucket!,
  messagingSenderId: messagingSenderId!,
  appId: appId!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp | undefined;
if (typeof window !== "undefined" && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
}

// Initialize Analytics (only in browser)
let analytics: Analytics | undefined;
if (typeof window !== "undefined" && app) {
  analytics = getAnalytics(app);
}

export { app, analytics };
export default app;
