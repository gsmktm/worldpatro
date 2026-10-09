export type EarthquakeQuery = {
  lat: number;
  lon: number;
  radiusKm: number;
  days: number;
  minMagnitude: number;
  limit: number;
};

type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    updated: number;
    url: string;
    alert: string | null;
    status: string;
    type: string;
    title: string;
    sig: number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
};

type UsgsResponse = {
  type: "FeatureCollection";
  metadata: {
    generated: number;
    count: number;
    url: string;
    title: string;
    status: number;
    api: string;
    limit: number;
    offset: number;
  };
  features: UsgsFeature[];
};

export async function getRecentEarthquakes(query: EarthquakeQuery) {
  const start = new Date(Date.now() - query.days * 86_400_000).toISOString();
  const params = new URLSearchParams({
    format: "geojson",
    starttime: start,
    latitude: String(query.lat),
    longitude: String(query.lon),
    maxradiuskm: String(query.radiusKm),
    minmagnitude: String(query.minMagnitude),
    limit: String(query.limit),
    orderby: "time",
    eventtype: "earthquake"
  });

  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`;
  const response = await fetch(url, {
    headers: { "accept": "application/geo+json, application/json" },
    next: { revalidate: 300 }
  });

  if (!response.ok) throw new Error(`USGS returned HTTP ${response.status}`);

  const payload = await response.json() as UsgsResponse;
  return {
    query,
    count: payload.features.length,
    generatedAt: new Date(payload.metadata.generated).toISOString(),
    events: payload.features.map(feature => ({
      id: feature.id,
      magnitude: feature.properties.mag,
      place: feature.properties.place,
      occurredAt: new Date(feature.properties.time).toISOString(),
      updatedAt: new Date(feature.properties.updated).toISOString(),
      coordinates: {
        lon: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
        depthKm: feature.geometry.coordinates[2]
      },
      alert: feature.properties.alert,
      status: feature.properties.status,
      significance: feature.properties.sig,
      title: feature.properties.title,
      detailUrl: feature.properties.url
    })),
    provenance: {
      publisher: "USGS Earthquake Hazards Program",
      service: "FDSN Event Web Service",
      sourceClass: "official_api",
      retrievedAt: new Date().toISOString()
    }
  };
}
