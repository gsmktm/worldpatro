import { NextRequest, NextResponse } from "next/server";
import { defaults } from "@/lib/env";
import { getRecentEarthquakes } from "@/lib/integrations/usgs";

export const dynamic = "force-dynamic";

function boundedNumber(value: string | null, fallback: number, min: number, max: number) {
  const parsed = value === null ? fallback : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const lat = boundedNumber(q.get("lat"), defaults.lat, -90, 90);
  const lon = boundedNumber(q.get("lon"), defaults.lon, -180, 180);
  const radiusKm = boundedNumber(q.get("radiusKm"), 500, 1, 2000);
  const days = boundedNumber(q.get("days"), 7, 1, 30);
  const minMagnitude = boundedNumber(q.get("minMagnitude"), 2.5, -1, 10);
  const limit = boundedNumber(q.get("limit"), 100, 1, 500);

  if ([lat, lon, radiusKm, days, minMagnitude, limit].some(value => value === null)) {
    return NextResponse.json({ error: "Invalid earthquake query parameters." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getRecentEarthquakes({
      lat: lat!,
      lon: lon!,
      radiusKm: radiusKm!,
      days: days!,
      minMagnitude: minMagnitude!,
      limit: Math.floor(limit!)
    }), {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" }
    });
  } catch {
    return NextResponse.json({ error: "USGS earthquake source unavailable." }, { status: 502 });
  }
}
