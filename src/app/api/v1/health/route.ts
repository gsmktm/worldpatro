import { NextResponse } from "next/server";
import { GATES, ANCHORS } from "@/lib/wbe";
import {
  databaseProvider,
  isFirebaseAdminConfigured,
  isFirebaseClientConfigured,
  isSupabaseConfigured
} from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "worldpatro",
    version: "1.1.0",
    runtime: "node>=22",
    database: {
      provider: databaseProvider(),
      firebaseClientConfigured: isFirebaseClientConfigured(),
      firebaseAdminConfigured: isFirebaseAdminConfigured(),
      supabaseConfigured: isSupabaseConfigured()
    },
    wbe: { gates: GATES.length, anchors: ANCHORS.length },
    time: new Date().toISOString()
  });
}
