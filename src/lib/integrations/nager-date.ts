export type PublicHoliday = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  types: string[];
};

export async function getPublicHolidays(year: number, countryCode: string) {
  const country = countryCode.toUpperCase();

  if (country === "NP") {
    return {
      status: "authority_required" as const,
      countryCode: country,
      year,
      holidays: [] as PublicHoliday[],
      provenance: {
        provider: "World Patro authority policy",
        sourceClass: "authority_required",
        authoritative: false
      },
      note: "Nepal public holidays are not sourced from Nager.Date. World Patro requires an official Nepal government release or a reviewed authority dataset."
    };
  }

  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${encodeURIComponent(country)}`;
  const response = await fetch(url, {
    headers: { "accept": "application/json" },
    next: { revalidate: 21_600 }
  });

  if (response.status === 404) {
    return {
      status: "unsupported" as const,
      countryCode: country,
      year,
      holidays: [] as PublicHoliday[],
      provenance: {
        provider: "Nager.Date",
        sourceClass: "community_aggregator",
        authoritative: false
      },
      note: "No holiday dataset is available from this fallback provider for the requested country/year."
    };
  }

  if (!response.ok) throw new Error(`Nager.Date returned HTTP ${response.status}`);

  const holidays = await response.json() as PublicHoliday[];
  return {
    status: "reported" as const,
    countryCode: country,
    year,
    holidays,
    provenance: {
      provider: "Nager.Date",
      sourceClass: "community_aggregator",
      authoritative: false,
      retrievedAt: new Date().toISOString()
    },
    note: "Treat these as provider-reported civil holidays, not as a universal religious-calendar authority."
  };
}
