export type FxRateResult = {
  date: string;
  base: string;
  quote: string;
  rate: number;
  providers?: Array<{
    key?: string;
    date?: string;
    rate?: number;
    excluded?: boolean;
  }>;
};

export async function getFxRate(base: string, quote: string, provider?: string) {
  const from = base.toUpperCase();
  const to = quote.toUpperCase();

  if (from === to) {
    return {
      date: new Date().toISOString().slice(0, 10),
      base: from,
      quote: to,
      rate: 1,
      provenance: {
        provider: "World Patro",
        method: "currency identity"
      }
    };
  }

  const params = new URLSearchParams();
  if (provider) params.set("providers", provider.toLowerCase());
  params.set("expand", "providers");

  const url = `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(from.toLowerCase())}/${encodeURIComponent(to.toLowerCase())}?${params}`;
  const response = await fetch(url, {
    headers: { "accept": "application/json" },
    next: { revalidate: 3_600 }
  });

  if (!response.ok) {
    throw new Error(`Frankfurter returned HTTP ${response.status}`);
  }

  const data = await response.json() as FxRateResult;
  return {
    ...data,
    provenance: {
      provider: "Frankfurter",
      sourceClass: "central-bank/official-source aggregator",
      requestedProvider: provider || null,
      retrievedAt: new Date().toISOString()
    }
  };
}
