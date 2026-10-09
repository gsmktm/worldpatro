export type IntegrationTier = "A" | "B" | "C";
export type IntegrationAuth = "none" | "apiKey" | "conditional";
export type IntegrationState = "active" | "optional" | "development-only" | "authority-required";

export type IntegrationDefinition = {
  id: string;
  name: string;
  category: string;
  tier: IntegrationTier;
  auth: IntegrationAuth;
  baseUrl: string;
  sourceKind: "official_api" | "open_data_api" | "aggregator_api";
  state: IntegrationState;
  envKeys: string[];
  selectedFor: string[];
  note: string;
  catalogSource: "public-apis/public-apis" | "existing-world-patro";
  verifiedAt: string;
};

export const INTEGRATIONS: IntegrationDefinition[] = [
  {
    id: "world-bank",
    name: "World Bank Open Data",
    category: "economics",
    tier: "A",
    auth: "none",
    baseUrl: "https://api.worldbank.org",
    sourceKind: "official_api",
    state: "active",
    envKeys: [],
    selectedFor: ["country indicators", "population", "GDP"],
    note: "Already integrated. Keep as the primary source for World Bank indicators.",
    catalogSource: "existing-world-patro",
    verifiedAt: "2026-10-09"
  },
  {
    id: "usgs-earthquake",
    name: "USGS Earthquake Hazards Program",
    category: "hazards",
    tier: "A",
    auth: "none",
    baseUrl: "https://earthquake.usgs.gov/fdsnws/event/1",
    sourceKind: "official_api",
    state: "active",
    envKeys: [],
    selectedFor: ["earthquake events", "hazard map", "world alerts"],
    note: "Official USGS FDSN event service. GeoJSON responses are normalized by World Patro.",
    catalogSource: "public-apis/public-apis",
    verifiedAt: "2026-10-09"
  },
  {
    id: "frankfurter",
    name: "Frankfurter",
    category: "currency",
    tier: "B",
    auth: "none",
    baseUrl: "https://api.frankfurter.dev/v2",
    sourceKind: "aggregator_api",
    state: "active",
    envKeys: [],
    selectedFor: ["FX reference rates", "historical FX", "NPR pairs"],
    note: "Aggregates central-bank and official-source rates. Use a pinned provider when a jurisdiction requires one specific authority.",
    catalogSource: "public-apis/public-apis",
    verifiedAt: "2026-10-09"
  },
  {
    id: "nager-date",
    name: "Nager.Date",
    category: "calendar",
    tier: "C",
    auth: "none",
    baseUrl: "https://date.nager.at/api/v3",
    sourceKind: "aggregator_api",
    state: "authority-required",
    envKeys: [],
    selectedFor: ["global public-holiday fallback"],
    note: "Useful for many countries, but not treated as Nepal's holiday authority. Nepal holiday output remains authority-required.",
    catalogSource: "public-apis/public-apis",
    verifiedAt: "2026-10-09"
  },
  {
    id: "nasa-open-apis",
    name: "NASA Open APIs",
    category: "space",
    tier: "A",
    auth: "apiKey",
    baseUrl: "https://api.nasa.gov",
    sourceKind: "official_api",
    state: "optional",
    envKeys: ["NASA_API_KEY"],
    selectedFor: ["space events", "NASA imagery", "astronomy enrichment"],
    note: "Optional enrichment. Keep NASA API keys server-only; do not build new work on endpoints NASA marks as archived.",
    catalogSource: "public-apis/public-apis",
    verifiedAt: "2026-10-09"
  },
  {
    id: "rest-countries",
    name: "REST Countries",
    category: "countries",
    tier: "B",
    auth: "apiKey",
    baseUrl: "https://api.restcountries.com/countries/v5",
    sourceKind: "aggregator_api",
    state: "optional",
    envKeys: ["REST_COUNTRIES_API_KEY"],
    selectedFor: ["country metadata", "ISO/capital/language/currency metadata"],
    note: "Current v5 requires an API key. Use server-side only; World Bank remains primary for its own indicators.",
    catalogSource: "public-apis/public-apis",
    verifiedAt: "2026-10-09"
  },
  {
    id: "opencage",
    name: "OpenCage Geocoding",
    category: "geocoding",
    tier: "B",
    auth: "apiKey",
    baseUrl: "https://api.opencagedata.com/geocode/v1",
    sourceKind: "aggregator_api",
    state: "optional",
    envKeys: ["OPENCAGE_API_KEY"],
    selectedFor: ["production forward geocoding", "production reverse geocoding"],
    note: "Preferred hosted production geocoder when configured. Keep the key server-only.",
    catalogSource: "public-apis/public-apis",
    verifiedAt: "2026-10-09"
  },
  {
    id: "nominatim",
    name: "Nominatim / OpenStreetMap",
    category: "geocoding",
    tier: "B",
    auth: "none",
    baseUrl: "https://nominatim.openstreetmap.org",
    sourceKind: "open_data_api",
    state: "development-only",
    envKeys: ["WORLD_PATRO_ALLOW_PUBLIC_NOMINATIM"],
    selectedFor: ["development geocoding fallback"],
    note: "Public OSMF service has strict usage rules, including a maximum of 1 request/second, application identification and attribution. Disabled unless explicitly opted in.",
    catalogSource: "public-apis/public-apis",
    verifiedAt: "2026-10-09"
  },
  {
    id: "open-meteo",
    name: "Open-Meteo",
    category: "weather",
    tier: "B",
    auth: "conditional",
    baseUrl: "https://api.open-meteo.com",
    sourceKind: "aggregator_api",
    state: "optional",
    envKeys: ["OPEN_METEO_API_KEY", "WORLD_PATRO_ALLOW_NONCOMMERCIAL_APIS"],
    selectedFor: ["weather", "historical weather", "climate enrichment"],
    note: "Free hosted API is non-commercial. Production commercial use should configure OPEN_METEO_API_KEY and use the customer endpoint.",
    catalogSource: "public-apis/public-apis",
    verifiedAt: "2026-10-09"
  }
];

function hasEnv(key: string) {
  return Boolean(process.env[key]?.trim());
}

export function getIntegrationRuntimeState(definition: IntegrationDefinition) {
  switch (definition.id) {
    case "world-bank":
    case "usgs-earthquake":
    case "frankfurter":
    case "nager-date":
      return { configured: true, runtimeEnabled: true };
    case "nasa-open-apis":
      return { configured: hasEnv("NASA_API_KEY"), runtimeEnabled: hasEnv("NASA_API_KEY") };
    case "rest-countries":
      return { configured: hasEnv("REST_COUNTRIES_API_KEY"), runtimeEnabled: hasEnv("REST_COUNTRIES_API_KEY") };
    case "opencage":
      return { configured: hasEnv("OPENCAGE_API_KEY"), runtimeEnabled: hasEnv("OPENCAGE_API_KEY") };
    case "nominatim": {
      const allowed = process.env.WORLD_PATRO_ALLOW_PUBLIC_NOMINATIM === "true";
      return { configured: allowed, runtimeEnabled: allowed };
    }
    case "open-meteo": {
      const commercial = hasEnv("OPEN_METEO_API_KEY");
      const nonCommercialOptIn = process.env.WORLD_PATRO_ALLOW_NONCOMMERCIAL_APIS === "true";
      return {
        configured: commercial || nonCommercialOptIn,
        runtimeEnabled: commercial || nonCommercialOptIn,
        mode: commercial ? "commercial-customer-api" : nonCommercialOptIn ? "noncommercial-opt-in" : "disabled"
      };
    }
    default:
      return { configured: false, runtimeEnabled: false };
  }
}

export function publicIntegrationCatalog() {
  return INTEGRATIONS.map(definition => ({
    ...definition,
    ...getIntegrationRuntimeState(definition),
    envKeys: definition.envKeys.map(key => ({
      key,
      configured: hasEnv(key)
    }))
  }));
}

export function sourceRegistryIntegrations() {
  return INTEGRATIONS.map(definition => {
    const runtime = getIntegrationRuntimeState(definition);
    return {
      slug: definition.id,
      name: definition.name,
      tier: definition.tier,
      kind: definition.sourceKind,
      url: definition.baseUrl,
      status: runtime.runtimeEnabled ? "active" : definition.state
    };
  });
}
