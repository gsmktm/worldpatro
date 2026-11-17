import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildCalendarMonth, CALENDAR_IDS } from "@/lib/calendar-month";
import { dateInNepal } from "@/lib/patro-day";

const Query=z.object({
 date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(dateInNepal()),
 calendar:z.enum(CALENDAR_IDS).default("bs"),
 locale:z.enum(["en","ne"]).default("en")
});

export async function GET(request:NextRequest){
 const input=Query.safeParse({
  date:request.nextUrl.searchParams.get("date")||undefined,
  calendar:request.nextUrl.searchParams.get("calendar")||undefined,
  locale:request.nextUrl.searchParams.get("locale")||undefined
 });
 if(!input.success)return NextResponse.json({error:"Use calendar, date YYYY-MM-DD and locale en/ne.",issues:input.error.issues},{status:400});
 try{
  const month=buildCalendarMonth(input.data.date,input.data.calendar,input.data.locale);
  return NextResponse.json({
   selectedDate:input.data.date,calendar:month,
   disclosure:"Civil date mappings and Gregorian reference navigation do not certify a Vedic observance, Nepal Sambat lunar month or public holiday."
  },{headers:{"Cache-Control":"public, s-maxage=300"}});
 }catch(error){
  return NextResponse.json({error:error instanceof Error?error.message:"Invalid calendar request."},{status:400});
 }
}
