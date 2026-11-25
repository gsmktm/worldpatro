import { NextRequest, NextResponse } from "next/server";
import { buildPatroDay, readPatroQuery, PatroValidationError } from "@/lib/patro-day";
import { daylightVedicWindows } from "@/lib/vedic-windows";

export const runtime="nodejs";
export const dynamic="force-dynamic";

/**
 * GET /api/v1/vedic/day?date=2026-11-25&lat=27.7172&lon=85.324&tz=Asia/Kathmandu
 * Reuses the canonical World Patro engine; does not scrape or proxy VedicPatro.
 * Astro details refer to the selected local noon, while windows are sunrise-based.
 */
export function GET(request:NextRequest){
  try{
    const day=buildPatroDay(readPatroQuery(request.nextUrl));
    const daylight=daylightVedicWindows({
      date:day.canonical.date,
      sunrise:day.panchang.sunTimes.sunrise,
      sunset:day.panchang.sunTimes.sunset
    });
    return NextResponse.json({
      canonical:day.canonical,
      calendars:day.calendars,
      panchang:day.panchang,
      daylight,
      generatedAt:day.generatedAt,
      boundaries:{
        astronomy:"Calculation at local civil noon with location-specific sunrise/sunset.",
        tradition:"Indicative daytime windows. Neither festival authority nor natal/event suitability is certified.",
        publisher:"No third-party proprietary calendar is scraped or copied."
      }
    },{headers:{"Cache-Control":"public, s-maxage=120, stale-while-revalidate=300","X-Content-Type-Options":"nosniff"}});
  }catch(error){
    if(error instanceof PatroValidationError)return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({error:"Vedic day calculation unavailable."},{status:503});
  }
}
