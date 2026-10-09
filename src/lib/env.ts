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
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    )
  );
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function databaseProvider() {
  if (process.env.NEXT_PUBLIC_DATABASE_PROVIDER === "supabase" && isSupabaseConfigured()) return "supabase";
  if (isFirebaseClientConfigured()) return "firebase";
  if (isSupabaseConfigured()) return "supabase";
  return "unconfigured";
}

export const defaults = {
  lat: Number(process.env.WORLD_PATRO_DEFAULT_LAT ?? 27.7172),
  lon: Number(process.env.WORLD_PATRO_DEFAULT_LON ?? 85.3240),
  tz: process.env.WORLD_PATRO_DEFAULT_TZ ?? "Asia/Kathmandu"
};
