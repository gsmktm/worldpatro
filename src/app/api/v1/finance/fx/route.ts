import { NextRequest, NextResponse } from "next/server";
import { getFxRate } from "@/lib/integrations/frankfurter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const base = (q.get("base") || "USD").toUpperCase();
  const quote = (q.get("quote") || "NPR").toUpperCase();
  const provider = q.get("provider")?.trim() || undefined;

  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote)) {
    return NextResponse.json({ error: "base and quote must be three-letter ISO 4217 currency codes." }, { status: 400 });
  }
  if (provider && !/^[A-Za-z0-9_-]{1,32}$/.test(provider)) {
    return NextResponse.json({ error: "Invalid provider identifier." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getFxRate(base, quote, provider), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" }
    });
  } catch {
    return NextResponse.json({
      error: "FX source unavailable or currency pair unsupported.",
      base,
      quote,
      provider: provider || null
    }, { status: 502 });
  }
}
