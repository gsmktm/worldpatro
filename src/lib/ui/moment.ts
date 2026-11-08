/** A civil date and location shared through portable URLs. */
export type Moment = { date: string; lat: number; lon: number; tz: string; locale: "en" | "ne" };
export const CITIES = [
  { id: "ktm", name: "Kathmandu", ne: "काठमाडौँ", country: "Nepal", lat: 27.7172, lon: 85.324, tz: "Asia/Kathmandu" },
  { id: "pkr", name: "Pokhara", ne: "पोखरा", country: "Nepal", lat: 28.2096, lon: 83.9856, tz: "Asia/Kathmandu" },
  { id: "jnp", name: "Janakpur", ne: "जनकपुर", country: "Nepal", lat: 26.7271, lon: 85.9407, tz: "Asia/Kathmandu" },
  { id: "lon", name: "London", ne: "लन्डन", country: "UK", lat: 51.5072, lon: -0.1276, tz: "Europe/London" },
  { id: "nyc", name: "New York", ne: "न्युयोर्क", country: "USA", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { id: "syd", name: "Sydney", ne: "सिड्नी", country: "Australia", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" }
] as const;
export function civilDate(now = new Date(), tz = "Asia/Kathmandu") {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).map(x => [x.type, x.value]));
  return p.year + "-" + p.month + "-" + p.day;
}
export function validCivilDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + "T12:00:00Z");
  return Number.isFinite(d.valueOf()) && d.toISOString().slice(0, 10) === date && +date.slice(0, 4) >= 1900 && +date.slice(0, 4) <= 2100;
}
export function defaultMoment(now = new Date()): Moment {
  const c = CITIES[0];
  return { date: civilDate(now, c.tz), lat: c.lat, lon: c.lon, tz: c.tz, locale: "en" };
}
export function momentFromSearch(sp: URLSearchParams, fallback = defaultMoment()): Moment {
  const lat = Number(sp.get("lat")), lon = Number(sp.get("lon"));
  const date = sp.get("date") || fallback.date;
  let tz = sp.get("tz") || fallback.tz;
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); } catch { tz = fallback.tz; }
  return {
    date: validCivilDate(date) ? date : fallback.date,
    lat: sp.has("lat") && Number.isFinite(lat) && Math.abs(lat) <= 66 ? lat : fallback.lat,
    lon: sp.has("lon") && Number.isFinite(lon) && Math.abs(lon) <= 180 ? lon : fallback.lon,
    tz, locale: sp.get("locale") === "ne" ? "ne" : fallback.locale
  };
}
export function momentQuery(m: Moment) {
  return new URLSearchParams({ date: m.date, lat: String(m.lat), lon: String(m.lon), tz: m.tz, locale: m.locale }).toString();
}
