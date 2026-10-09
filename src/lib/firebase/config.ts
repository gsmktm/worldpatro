export function isFirebaseClientConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

export function isFirebaseAdminConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
  );
}

export function useFirebaseBackend() {
  return process.env.WORLD_PATRO_DATA_BACKEND === "firebase" && isFirebaseAdminConfigured();
}

export const firebaseSessionCookieName =
  process.env.FIREBASE_SESSION_COOKIE_NAME || "worldpatro_session";
