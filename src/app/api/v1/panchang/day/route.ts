import { NextRequest, NextResponse } from "next/server";
import { calculatePanchang } from "@/lib/astro";
import { defaults } from "@/lib/env";

export const dynamic = "force-dynamic";

export function GET(request:NextRequest) {
  const q = request.nextUrl.searchParams;
  const raw = q.get("date") ?? new Date().toISOString().slice(0,10);
  const date = new Date(`${raw}T06:15:00Z`);
  const lat = Number(q.get("lat") ?? defaults.lat);
  const lon = Number(q.get("lon") ?? defaults.lon);
  const elevation = Number(q.get("elevation") ?? 1400);
  const tz = q.get("tz") ?? defaults.tz;
  if ([date.getTime(),lat,lon,elevation].some(Number.isNaN)) return NextResponse.json({error:"Invalid date/location parameters"},{status:400});
  return NextResponse.json({date:raw,...calculatePanchang({date,lat,lon,elevation,tz})});
}
