import { NextResponse } from "next/server";
import { GATES, ANCHORS } from "@/lib/wbe";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "worldpatro",
    version: "0.1.0",
    wbe: { gates: GATES.length, anchors: ANCHORS.length },
    time: new Date().toISOString()
  });
}
