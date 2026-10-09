export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export const defaults = {
  lat: Number(process.env.WORLD_PATRO_DEFAULT_LAT ?? 27.7172),
  lon: Number(process.env.WORLD_PATRO_DEFAULT_LON ?? 85.3240),
  tz: process.env.WORLD_PATRO_DEFAULT_TZ ?? "Asia/Kathmandu"
};
