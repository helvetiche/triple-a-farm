## Server Architecture – Firebase Admin (Server-Only)

This document describes how the backend/server layer of Triple A is implemented using **Firebase Admin SDK only** (no client SDK), driven by a **service account**.

---

## 1. Goals

- **100% server-only Firebase access**
  - No Firebase browser SDK.
  - All reads/writes go through our Next.js server (Route Handlers, server components, or server actions).
- **Production-grade security stance**
  - This is a **live, working system**, not a prototype.
  - Always send **secure and complete HTTP headers** on every response (e.g. `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, robust `Cache-Control`, and appropriate CORS headers where applicable).
  - Review headers regularly to ensure they align with current security best practices and deployment environment.
- **Strict separation of concerns**
  - Auth, authorization, and business logic live on the server.
  - The UI only talks to our `/api/...` endpoints.
- **Security-first**
  - Service account credentials are never exposed to the client and never committed to git.

---

## 2. Service Account (Firebase Admin)

We use a **Google service account** to authenticate our server to Firebase. The file you downloaded from the Firebase console looks like:

- Example filename: `tripe-a-firebase-adminsdk-fbsvc-de99bb7a10.json`
- Example fields:
  - `type`
  - `project_id`
  - `private_key_id`
  - `private_key`
  - `client_email`
  - `client_id`
  - `auth_uri`
  - `token_uri`
  - `auth_provider_x509_cert_url`
  - `client_x509_cert_url`
  - `universe_domain`

**Important:**

- Do **not** commit this JSON file to git.
- If it has been committed or shared, **revoke/rotate** the key in the Google Cloud console and download a new one.

We will not read this JSON file directly in production. Instead, we load its contents from an environment variable.

---

## 3. Environment Variables

We store the service account JSON in a **single private env variable**. In `.env`:

- `NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT=`\
  The entire JSON content from `tripe-a-firebase-adminsdk-fbsvc-de99bb7a10.json` as a single string.

Other recommended env vars:

- `NEXT_PRIVATE_FIREBASE_PROJECT_ID=tripe-a`
- `NEXT_PRIVATE_FIREBASE_DATABASE_URL=` (if using Realtime Database)
- `NEXT_PRIVATE_FIREBASE_STORAGE_BUCKET=tripe-a.firebasestorage.app`

Implementation notes:

- When pasting the JSON into `.env`, make sure newlines in `private_key` are preserved or escaped correctly.
- The `NEXT_PRIVATE_` prefix ensures this value is **never** exposed to the browser.

---

## 4. Firebase Admin Initialization (`lib/firebase.ts`)

We create a single initialization module to avoid multiple app instances:

- File: `lib/firebase.ts`
- Responsibilities:
  - Parse `process.env.NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT`.
  - Initialize `firebase-admin` only once (singleton).
  - Export:
    - `adminAuth` – Firebase Auth Admin instance.
    - `adminDb` – Firestore or RTDB instance.
    - `adminStorage` – Storage instance (optional).

High-level pseudocode:

- Read env variable `NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT`.
- `JSON.parse` it into a `serviceAccount` object.
- If no existing `admin.app`, call `initializeApp` with `credential.cert(serviceAccount)` and other options (e.g. `storageBucket`).
- Export initialized services.

This module is used by all API routes and server-side utilities that talk to Firebase.

---

## 5. Auth & Session Model

### 5.1 Authentication

- All authentication is handled on the server using Firebase Admin:
  - For email/password: verify credentials and fetch user using Admin SDK.
  - For other providers (if added later): verify provider tokens on the server.

### 5.2 Sessions (Cookies)

- After a successful login:
  - Create a server-side session token (e.g. Firebase session cookie or custom JWT).
  - Store it in an **HttpOnly, Secure** cookie.
- On each request to protected routes:
  - Middleware or the API route reads the cookie.
  - Verifies the token using Admin SDK or a secret key.
  - Attaches the user context (e.g. `uid`, roles) to the request handling logic.

All session logic remains in the server and no tokens are directly exposed to the client JavaScript.

---

## 6. Authorization & Roles

- Roles are used to control access to modules (e.g. admin, staff, viewer).
- Roles can be stored as:
  - Fields in a `users` document in Firestore, and/or
  - Custom claims on the Firebase user.
- Each API route checks:
  - That a valid session exists.
  - That the user has the appropriate role/permission for the requested operation.

The UI may hide or disable features based on role, but **real enforcement** happens in the server layer.

---

## 7. API Layer (`app/api/*`)

We expose business logic through Next.js Route Handlers:

- Group endpoints by domain:
  - `/api/auth/*`
  - `/api/roosters/*`
  - `/api/inventory/*`
  - `/api/sales/*`
  - `/api/settings/*`
- Every handler:
  - Validates input (e.g. with Zod).
  - Reads the current session from cookies.
  - Calls Firebase Admin SDK via shared utilities.
  - Returns a standardized JSON shape:
    - Success: `{ success: true, data }`
    - Error: `{ success: false, error: { code, message } }`

Frontend components only communicate with these endpoints, never directly with Firebase.

---

## 8. Frontend Usage (No Client SDK)

- **Server components/pages**
  - May import server-only data utilities that call Firebase Admin directly.
  - Or call internal API routes.
- **Client components**
  - Use `fetch`/SWR/React Query against `/api/...` routes.
  - Never initialize Firebase client SDK or call `firebase.auth()` in the browser.

The result is a clean separation: the browser is a thin client; all sensitive logic and credentials live on the server.

---

## 9. Data Modeling & Security Rules

- Data is modeled around the modules:
  - `users`, `roosters`, `inventoryItems`, `sales`, `feedback`, `settings`, etc.
- Admin SDK bypasses Firestore/RTDB security rules, but we still:
  - Keep rules conservative for any accidental direct access.
  - Rely on the API layer for fine-grained authorization.

This aligns with the principle that **all database operations must go through the server first**.

---

## 10. Implementation Checklist

1. Generate a Firebase service account JSON and download it (e.g. `tripe-a-firebase-adminsdk-fbsvc-de99bb7a10.json`).
2. Paste its full JSON content into `.env` under `NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT`.
3. Ensure the JSON file is **ignored** by git and removed from version control if already tracked.
4. Implement `lib/firebase.ts` to initialize Firebase Admin from the env variable.
5. Implement server-side auth:
   - Login endpoint.
   - Session cookie creation and verification.
6. Implement role-based authorization in API routes.
7. Update frontend to use `/api/...` instead of any direct Firebase access.

Once these steps are completed, the app will be running on a fully server-only Firebase Admin architecture.
