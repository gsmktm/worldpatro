import { NextRequest, NextResponse } from "next/server";
import { buildCalendarSnapshot } from "@/lib/calendars";

export const dynamic = "force-dynamic";

function dateForNepalToday(){
  const parts = new Intl.DateTimeFormat("en-US",{
    timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(new Date());
  const p=Object.fromEntries(parts.map(item=>[item.type,item.value]));
  return p.year+"-"+p.month+"-"+p.day;
}

export async function GET(request:NextRequest) {
  const raw = request.nextUrl.searchParams.get("date") || dateForNepalToday();
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)||!["en","ne"].includes(locale)){
    return NextResponse.json({error:"Use a valid YYYY-MM-DD date and locale en/ne."},{status:400});
  }
  const date = new Date(raw+"T12:00:00Z");
  if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==raw){
    return NextResponse.json({error:"Invalid Gregorian date."},{status:400});
  }
  return NextResponse.json({
    canonical:{isoDate:date.toISOString(),generatedAt:new Date().toISOString(),precision:"date"},
    calendars:buildCalendarSnapshot(date,locale),
    separationNotice:"Calculated, authority-released, astronomical and interpretive layers are deliberately distinct."
  },{headers:{"Cache-Control":"public, s-maxage=300"}});
}
