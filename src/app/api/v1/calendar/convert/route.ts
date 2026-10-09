import { NextResponse } from "next/server";
import { z } from "zod";
import { buildCalendarSnapshot } from "@/lib/calendars";

const Input = z.object({ date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/), locale:z.enum(["en","ne"]).default("en") });

export async function POST(request:Request) {
  const parsed = Input.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({error:"Expected { date: YYYY-MM-DD, locale?: string }",issues:parsed.error.issues},{status:400});
  const date = new Date(`${parsed.data.date}T12:00:00Z`);
  if (Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==parsed.data.date)
    return NextResponse.json({error:"Invalid Gregorian date"},{status:400});
  return NextResponse.json({
    canonical:{date:parsed.data.date,instantUsed:date.toISOString(),precision:"date-only"},
    results:buildCalendarSnapshot(date,parsed.data.locale),
    limitation:"Reverse parsing from every non-Gregorian profile is intentionally deferred until each profile has a versioned parser and validation corpus."
  });
}
