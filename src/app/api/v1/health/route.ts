import { NextResponse } from "next/server";
import { GATES, ANCHORS } from "@/lib/wbe";
import { isSupabaseConfigured } from "@/lib/env";
import { isFirebaseAdminConfigured, isFirebaseClientConfigured, useFirebaseBackend } from "@/lib/firebase/config";
import { AGENT_PROFILES, SUBAGENT_MODEL, SUPERVISOR_MODEL } from "@/lib/agents/contracts";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "worldpatro",
    version: "2.0.0",
    runtime: "node>=22",
    dataBackend: useFirebaseBackend()
      ? "firebase"
      : isSupabaseConfigured()
        ? "supabase"
        : "public-only",
    firebase: {
      clientConfigured: isFirebaseClientConfigured(),
      adminConfigured: isFirebaseAdminConfigured()
    },
    supabaseConfigured: isSupabaseConfigured(),
    aiGateway: {
      configured: Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY),
      supervisorModel: SUPERVISOR_MODEL,
      subagentModel: SUBAGENT_MODEL,
      specialists: AGENT_PROFILES.length,
      externalActions: "human-confirmation-required"
    },
    wbe: {
      gates: GATES.length,
      anchors: ANCHORS.length
    },
    time: new Date().toISOString()
  });
}
