export type CalendarStatus = "calculated" | "authority-required" | "astronomy-required";

export type CalendarResult = {
  id: string;
  name: string;
  icon: string;
  value: string;
  method: string;
  provenance: "CALCULATED" | "AUTHORITY / CURATED DATA REQUIRED" | "ASTRONOMICAL";
  status: CalendarStatus;
  note: string;
};

function fmt(date: Date, locale: string, calendar: string) {
  return new Intl.DateTimeFormat(`${locale}-u-ca-${calendar}`, {
    year: "numeric", month: "long", day: "numeric", weekday: "long", timeZone: "UTC"
  }).format(date);
}

export function buildCalendarSnapshot(input: Date, locale = "en"): CalendarResult[] {
  if (Number.isNaN(input.getTime())) throw new Error("Invalid date.");
  return [
    {
      id: "vedic", name: "Vedic Panchang", icon: "ॐ",
      value: "Open Panchang for location-specific reading",
      method: "Astronomical Sun/Moon + location + tradition profile",
      provenance: "ASTRONOMICAL", status: "astronomy-required",
      note: "Tithi, Nakshatra, Yoga, sunrise and related values are location/time dependent."
    },
    {
      id: "gregorian", name: "Gregorian", icon: "☀",
      value: fmt(input, locale, "gregory"), method: "Gregorian / ISO-oriented civil date",
      provenance: "CALCULATED", status: "calculated",
      note: "Historical archival work should explicitly select proleptic or jurisdictional cutover mode."
    },
    {
      id: "bs", name: "Bikram Sambat (Nepal)", icon: "🇳🇵",
      value: "Versioned Nepal BS authority table required",
      method: "Authority-first Nepal civil calendar profile",
      provenance: "AUTHORITY / CURATED DATA REQUIRED", status: "authority-required",
      note: "World Patro will not invent a universal arithmetic BS date outside a validated data release."
    },
    {
      id: "nepal-sambat", name: "Nepal Sambat", icon: "𑐣",
      value: "Expert-reviewed lunisolar profile required",
      method: "Nepal Sambat era + lunisolar rules + cultural authority sources",
      provenance: "AUTHORITY / CURATED DATA REQUIRED", status: "authority-required",
      note: "Era numbering and lunar observance rules are modeled separately to avoid false precision."
    },
    {
      id: "hijri", name: "Islamic Hijri (Civil)", icon: "☾",
      value: fmt(input, locale, "islamic-civil"), method: "Islamic Civil / tabular",
      provenance: "CALCULATED", status: "calculated",
      note: "Observed dates can differ by jurisdiction, moon sighting or official declaration."
    },
    {
      id: "chinese", name: "Chinese Lunisolar", icon: "龍",
      value: fmt(input, locale, "chinese"), method: "ICU/Intl Chinese profile",
      provenance: "CALCULATED", status: "calculated",
      note: "Historical convention changes and precision near boundaries require specialist astronomy validation."
    },
    {
      id: "hebrew", name: "Hebrew", icon: "✡",
      value: fmt(input, locale, "hebrew"), method: "Arithmetic Hebrew calendar via ICU/Intl",
      provenance: "CALCULATED", status: "calculated",
      note: "Religious days begin at sunset; date-only correspondence does not replace local observance timing."
    },
    {
      id: "persian", name: "Persian Solar Hijri", icon: "✺",
      value: fmt(input, locale, "persian"), method: "ICU/Intl Persian profile",
      provenance: "CALCULATED", status: "calculated",
      note: "Official jurisdiction profiles can be layered separately from algorithmic correspondence."
    },
    {
      id: "buddhist", name: "Buddhist Era (Thai)", icon: "☸",
      value: fmt(input, locale, "buddhist"), method: "Thai Buddhist Era via ICU/Intl",
      provenance: "CALCULATED", status: "calculated",
      note: "Buddhist is not one universal calendar; Myanmar and other regional systems require distinct profiles."
    }
  ];
}
