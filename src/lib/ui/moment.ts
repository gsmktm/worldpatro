/** Shared date + place context for every /app module. The URL query is the source of truth. */
export type Moment = { date: string; lat: number; lon: number; tz: string; locale: "en" | "ne" };

export const CITIES = [
  { id: "ktm", name: "Kathmandu", lat: 27.7172, lon: 85.324, tz: "Asia/Kathmandu" },
  { id: "vns", name: "Varanasi", lat: 25.3176, lon: 82.9739, tz: "Asia/Kolkata" },
  { id: "lon", name: "London", lat: 51.5072, lon: -0.1276, tz: "Europe/London" },
  { id: "nyc", name: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" }
] as const;

export function defaultMoment(now = new Date()): Moment {
  const c = CITIES[0];
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: c.tz }).format(now);
  return { date, lat: c.lat, lon: c.lon, tz: c.tz, locale: "en" };
}

export function momentFromSearch(sp: URLSearchParams, fallback = defaultMoment()): Moment {
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const date = sp.get("date");
  return {
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallback.date,
    // patro-day.ts accepts latitude within ±66
    lat: Number.isFinite(lat) && sp.has("lat") && Math.abs(lat) <= 66 ? lat : fallback.lat,
    lon: Number.isFinite(lon) && sp.has("lon") && Math.abs(lon) <= 180 ? lon : fallback.lon,
    tz: sp.get("tz") || fallback.tz,
    locale: sp.get("locale") === "ne" ? "ne" : "en"
  };
}

export function momentQuery(m: Moment): string {
  return new URLSearchParams({ date: m.date, lat: String(m.lat), lon: String(m.lon), tz: m.tz, locale: m.locale }).toString();
}
