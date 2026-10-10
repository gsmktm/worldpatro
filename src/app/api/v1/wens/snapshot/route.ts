import { NextRequest, NextResponse } from "next/server";
import { makeBirthChart } from "@/lib/jyotish/birth-chart";
import { buildPatroDay, PatroValidationError, readPatroQuery } from "@/lib/patro-day";
import { WENS_DISCLOSURE, WENS_GRAHAS, WENS_LAYERS, WENS_ORIGIN, WENS_POWERS, WENS_TRADITIONS, WBGR109, datedRegistryGate } from "@/lib/wens";
import { GATES } from "@/lib/wbe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request:NextRequest) {
  try {
    // The default observer is the UNESCO-listed monument-zone reference.
    // Callers can supply a different real location; the heritage origin stays symbolic.
    const url=new URL(request.url);
    if(!url.searchParams.has("lat"))url.searchParams.set("lat",String(WENS_ORIGIN.latitude));
    if(!url.searchParams.has("lon"))url.searchParams.set("lon",String(WENS_ORIGIN.longitude));
    if(!url.searchParams.has("elevation"))url.searchParams.set("elevation",String(WENS_ORIGIN.elevationMeters));
    if(!url.searchParams.has("tz"))url.searchParams.set("tz",WENS_ORIGIN.timezone);
    const query=readPatroQuery(url);
    const day=buildPatroDay(query);
    // These are transits sampled at 12:00 civil time, NOT a natal chart or forecast.
    const chart=makeBirthChart({
      date:query.date,
      time:"12:00:00",
      timezone:query.tz,
      latitude:query.lat,
      longitude:query.lon,
      elevation:query.elevation,
      houseSystem:"whole_sign"
    });
    const navagraha=WENS_GRAHAS.map(g=>{
      const planet=chart.planets[g.index-1];
      return {
        ...g,
        key:planet.key,
        siderealLongitude:planet.siderealLongitude,
        tropicalLongitude:planet.tropicalLongitude,
        sign:planet.signName,
        degreesInSign:planet.degreesInSign,
        nakshatra:planet.nakshatra.name,
        retrograde:planet.retrograde,
        isMeanLunarNode:planet.isMeanLunarNode
      };
    });
    return NextResponse.json({
      system:"WENS · World Equilibrium & Navagraha System",
      registry:"WBGR-109",
      status:"calculated-with-symbolic-overlay",
      origin:WENS_ORIGIN,
      instant:day.canonical,
      layers:WENS_LAYERS,
      calendarProfiles:day.calendars,
      panchang:day.panchang,
      navagraha,
      traditions:WENS_TRADITIONS,
      powers:WENS_POWERS,
      gates:{all:GATES.length,registry:WBGR109.length,keynotes:9,gateOfDate:datedRegistryGate(query.date)},
      observanceData:{status:"authority-dependent",endpoint:"/api/v1/religions/observances",warning:WENS_DISCLOSURE.authority},
      truthBoundary:WENS_DISCLOSURE,
      calculation:chart.calculation,
      updatedAt:new Date().toISOString()
    },{
      headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}
    });
  } catch(error) {
    if(error instanceof PatroValidationError)return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({error:error instanceof Error?error.message:"WENS calculation unavailable."},{status:422});
  }
}
