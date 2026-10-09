import { NextRequest, NextResponse } from "next/server";
import { buildCalendarSnapshot } from "@/lib/calendars";

export const dynamic = "force-dynamic";

export async function GET(request:NextRequest) {
  const raw = request.nextUrl.searchParams.get("date");
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  const date = raw ? new Date(`${raw}T12:00:00Z`) : new Date();
  if (Number.isNaN(date.getTime())) return NextResponse.json({error:"Invalid date. Use YYYY-MM-DD."},{status:400});
  return NextResponse.json({
    canonical:{isoDate:date.toISOString(),generatedAt:new Date().toISOString(),precision:raw?"date":"instant"},
    calendars:buildCalendarSnapshot(date,locale),
    separationNotice:"Calculated, authority-released, astronomical and interpretive layers are deliberately distinct."
  });
}
