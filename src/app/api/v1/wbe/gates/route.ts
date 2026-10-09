import { NextRequest, NextResponse } from "next/server";
import { GATES } from "@/lib/wbe";
export function GET(request:NextRequest) {
  const page=Math.max(1,Number(request.nextUrl.searchParams.get("page")??1));
  const limit=Math.min(100,Math.max(1,Number(request.nextUrl.searchParams.get("limit")??27)));
  const anchors=request.nextUrl.searchParams.get("anchors")==="true";
  const q=(request.nextUrl.searchParams.get("q")??"").toLowerCase().trim();
  let rows=anchors?GATES.filter(g=>g.anchor):GATES;
  if(q) rows=rows.filter(g=>[g.code,g.tradition,g.graha,g.power,g.domain].some(v=>v.toLowerCase().includes(q)));
  return NextResponse.json({total:rows.length,page,limit,gates:rows.slice((page-1)*limit,page*limit),disclaimer:"WBE-9 is a symbolic comparative framework, not doctrine or scientific causation."});
}
