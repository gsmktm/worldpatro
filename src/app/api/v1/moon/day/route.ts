import { NextRequest, NextResponse } from "next/server";
import { buildPatroDay, PatroValidationError, readPatroQuery } from "@/lib/patro-day";
import { calculateMoonTimeline } from "@/lib/moon-timeline";

export const runtime="nodejs";
export const dynamic="force-dynamic";

/** Selected-day geocentric Moon, dated phase milestones, 14-day local-noon strip. */
export function GET(request:NextRequest){
  try{
    const input=readPatroQuery(request.nextUrl);
    const day=buildPatroDay(input);
    const moon=calculateMoonTimeline({
      date:day.canonical.date,
      instant:input.instant,
      tz:day.canonical.timezone,
      siderealLongitude:day.panchang.moon.siderealLongitude,
      moonrise:day.panchang.moonTimes.moonrise,
      moonset:day.panchang.moonTimes.moonset
    });
    return NextResponse.json({...moon,generatedAt:new Date().toISOString()},{
      headers:{"Cache-Control":"public, s-maxage=120, stale-while-revalidate=300","X-Content-Type-Options":"nosniff"}
    });
  }catch(err){
    if(err instanceof PatroValidationError)return NextResponse.json({error:err.message},{status:400});
    return NextResponse.json({error:"Moon astronomy is unavailable for this date and location."},{status:503});
  }
}
