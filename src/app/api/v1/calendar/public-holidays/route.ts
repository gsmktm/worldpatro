import { NextRequest, NextResponse } from "next/server";
import { getPublicHolidays } from "@/lib/integrations/nager-date";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const country = (request.nextUrl.searchParams.get("country") || "NP").toUpperCase();
  const year = Number(request.nextUrl.searchParams.get("year") || new Date().getUTCFullYear());

  if (!/^[A-Z]{2}$/.test(country)) {
    return NextResponse.json({ error: "Use a two-letter ISO 3166-1 country code." }, { status: 400 });
  }
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return NextResponse.json({ error: "Year must be an integer from 1900 through 2100." }, { status: 400 });
  }

  try {
    const result = await getPublicHolidays(year, country);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" }
    });
  } catch {
    return NextResponse.json({
      error: "Public-holiday provider unavailable.",
      countryCode: country,
      year
    }, { status: 502 });
  }
}
