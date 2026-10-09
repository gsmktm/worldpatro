import { NextRequest, NextResponse } from "next/server";
import { GATES } from "@/lib/wbe";

export async function GET(request: NextRequest) {
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit") || 27)));
  const anchorsOnly = request.nextUrl.searchParams.get("anchors") === "true";
  const query = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();

  let rows = anchorsOnly ? GATES.filter((g) => g.anchor) : GATES;
  if (query) {
    rows = rows.filter((g) => [g.code, g.tradition, g.graha, g.power, g.domain].some((v) => v.toLowerCase().includes(query)));
  }

  const start = (page - 1) * limit;
  return NextResponse.json({
    total: rows.length,
    page,
    limit,
    gates: rows.slice(start, start + limit),
    doctrine: "Symbolic comparative framework; not deterministic fate or a claim that any religion is governed by a planet."
  });
}
