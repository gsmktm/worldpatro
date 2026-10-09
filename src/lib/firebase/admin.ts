import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { isFirebaseAdminConfigured } from "@/lib/firebase/config";

type ServiceAccountShape = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function readServiceAccount(): ServiceAccountShape {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is missing.");

  const decoded = Buffer.from(raw, "base64").toString("utf8");
  const parsed = JSON.parse(decoded) as Partial<ServiceAccountShape>;
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error("Firebase service-account JSON is incomplete.");
  }

  return parsed as ServiceAccountShape;
}

export function getFirebaseAdminApp(): App {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured.");
  }

  if (getApps().length) return getApp();

  const account = readServiceAccount();
  return initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key
    }),
    projectId: account.project_id
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

let cachedFirestore: ReturnType<typeof getFirestore> | null = null;

export function getFirebaseAdminFirestore() {
  // Firestore settings must be applied only once, before first use.
  if (!cachedFirestore) {
    cachedFirestore = getFirestore(getFirebaseAdminApp());
    cachedFirestore.settings({ ignoreUndefinedProperties: true });
  }
  return cachedFirestore;
}
