export type CalendarStatus = "calculated" | "official-table-required" | "ephemeris-required";

export type CalendarResult = {
  id: string;
  name: string;
  icon: string;
  value: string;
  native?: string;
  method: string;
  provenance: "CALCULATED" | "OFFICIAL TABLE REQUIRED" | "EPHEMERIS REQUIRED";
  status: CalendarStatus;
  note: string;
};

function safeFormat(date: Date, locale: string, calendar: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(`${locale}-u-ca-${calendar}`, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    ...options
  }).format(date);
}

export function buildCalendarSnapshot(input: Date, locale = "en"): CalendarResult[] {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");

  return [
    {
      id: "vedic",
      name: "Vedic Panchang",
      icon: "ॐ",
      value: "Location + ephemeris required",
      method: "Astronomical Panchang pipeline",
      provenance: "EPHEMERIS REQUIRED",
      status: "ephemeris-required",
      note: "Tithi, nakshatra, yoga, karana, sunrise and lagna depend on exact astronomical calculations and often location. This core does not invent them."
    },
    {
      id: "gregorian",
      name: "Gregorian",
      icon: "☀",
      value: safeFormat(date, locale, "gregory"),
      method: "ECMAScript Intl / Gregorian",
      provenance: "CALCULATED",
      status: "calculated",
      note: "Global civil calendar. Historical cutover policy should be selected explicitly for archival work."
    },
    {
      id: "bs",
      name: "Bikram Sambat",
      icon: "🇳🇵",
      value: "Authoritative Nepal BS table required",
      method: "Versioned Nepal civil-date table",
      provenance: "OFFICIAL TABLE REQUIRED",
      status: "official-table-required",
      note: "No fake arithmetic shortcut is used. Connect a validated BS dataset before emitting a date."
    },
    {
      id: "nepal-sambat",
      name: "Nepal Sambat",
      icon: "𑑛",
      value: "Curated Nepal Sambat ruleset required",
      method: "Expert-curated lunisolar rules + sources",
      provenance: "OFFICIAL TABLE REQUIRED",
      status: "official-table-required",
      note: "Era numbering and lunar calendrical practice must be modeled carefully and separately."
    },
    {
      id: "hijri",
      name: "Islamic Hijri",
      icon: "☾",
      value: safeFormat(date, locale, "islamic-civil"),
      method: "Islamic Civil (tabular)",
      provenance: "CALCULATED",
      status: "calculated",
      note: "Observed religious dates can differ by local moon sighting or official authority."
    },
    {
      id: "chinese",
      name: "Chinese",
      icon: "龍",
      value: safeFormat(date, locale, "chinese"),
      method: "ICU/Intl Chinese calendar",
      provenance: "CALCULATED",
      status: "calculated",
      note: "Historical and regional convention changes require a more specialized astronomy engine."
    },
    {
      id: "hebrew",
      name: "Hebrew",
      icon: "✡",
      value: safeFormat(date, locale, "hebrew"),
      method: "ICU/Intl Hebrew calendar",
      provenance: "CALCULATED",
      status: "calculated",
      note: "Religious observance can begin at sunset; date-only conversion is not a substitute for local halachic timing."
    },
    {
      id: "persian",
      name: "Persian Solar Hijri",
      icon: "✺",
      value: safeFormat(date, locale, "persian"),
      method: "ICU/Intl Persian calendar",
      provenance: "CALCULATED",
      status: "calculated",
      note: "Official practice and astronomical-equinox discussions should remain method-labeled."
    },
    {
      id: "buddhist",
      name: "Buddhist",
      icon: "☸",
      value: safeFormat(date, locale, "buddhist"),
      method: "Thai Buddhist Era via ICU/Intl",
      provenance: "CALCULATED",
      status: "calculated",
      note: "This is not a universal Buddhist calendar. Regional lunar systems belong in separate variants."
    }
  ];
}
