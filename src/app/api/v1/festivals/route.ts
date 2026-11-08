import { NextResponse } from "next/server";
import { FESTIVALS,FESTIVAL_SOURCE } from "@/lib/festivals";
import { eventsToIcs } from "@/lib/ical";
import { validCivilDate } from "@/lib/ui/moment";
export const dynamic="force-dynamic";
export function GET(request:Request){
  const q=new URL(request.url).searchParams,from=q.get("from")||FESTIVAL_SOURCE.coverageStart,to=q.get("to")||FESTIVAL_SOURCE.coverageEnd;
  if(!validCivilDate(from)||!validCivilDate(to)||from>to)return NextResponse.json({error:"Use a valid from/to civil-date range."},{status:400});
  const festivals=FESTIVALS.filter(x=>x.date>=from&&x.date<=to);
  const headers={"Cache-Control":"public, s-maxage=3600","X-Content-Type-Options":"nosniff"};
  if(q.get("format")==="ics")return new Response(eventsToIcs(festivals.map(f=>({...f,description:f.description+" Source: "+FESTIVAL_SOURCE.url}))),{headers:{...headers,"Content-Type":"text/calendar;charset=utf-8","Content-Disposition":'attachment; filename="worldpatro-festivals.ics"'}});
  return NextResponse.json({festivals,source:FESTIVAL_SOURCE,scope:"municipality-published observance dates",completeYear:false,warning:"Coverage is limited to the reviewed release. No event outside it is inferred; absence does not mean there is no festival."},{headers});
}
