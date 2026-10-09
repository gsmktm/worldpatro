type Indicator = { id:string; name:string; value:number|null; year:string|null; source:"World Bank" };

async function latestWorldBankIndicator(iso3:string, indicator:string, name:string): Promise<Indicator> {
  const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(iso3)}/indicator/${indicator}?format=json&per_page=10`;
  const res = await fetch(url, { next:{ revalidate: 21600 } });
  if (!res.ok) return { id:indicator, name, value:null, year:null, source:"World Bank" };
  const payload = await res.json() as [unknown, Array<{date:string;value:number|null}>?];
  const row = payload?.[1]?.find(r => r.value !== null);
  return { id:indicator, name, value:row?.value ?? null, year:row?.date ?? null, source:"World Bank" };
}

export async function getCountrySnapshot(iso3:string) {
  const code = iso3.toUpperCase();
  const [population,gdp,gdpPerCapita] = await Promise.all([
    latestWorldBankIndicator(code,"SP.POP.TOTL","Population"),
    latestWorldBankIndicator(code,"NY.GDP.MKTP.CD","GDP (current US$)"),
    latestWorldBankIndicator(code,"NY.GDP.PCAP.CD","GDP per capita (current US$)")
  ]);
  return {
    iso3:code,
    retrievedAt:new Date().toISOString(),
    indicators:[population,gdp,gdpPerCapita],
    provenance:{ publisher:"World Bank", api:"api.worldbank.org", freshness:"latest non-null annual observation" }
  };
}
