import { NextRequest, NextResponse } from "next/server";
import { getCountrySnapshot } from "@/lib/world-data";
export const dynamic = "force-dynamic";
export async function GET(request:NextRequest) {
  const iso3 = (request.nextUrl.searchParams.get("iso3") ?? "NPL").toUpperCase();
  if (!/^[A-Z]{3}$/.test(iso3)) return NextResponse.json({error:"Use a three-letter ISO country code."},{status:400});
  try { return NextResponse.json(await getCountrySnapshot(iso3)); }
  catch { return NextResponse.json({error:"Public source unavailable",iso3},{status:502}); }
}
