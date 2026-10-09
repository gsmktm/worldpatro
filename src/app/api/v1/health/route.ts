import { NextResponse } from "next/server";
import { GATES, ANCHORS } from "@/lib/wbe";
import { isSupabaseConfigured } from "@/lib/env";
import { isFirebaseAdminConfigured, isFirebaseClientConfigured, useFirebaseBackend } from "@/lib/firebase/config";
import { AGENT_PROFILES, SUBAGENT_MODEL, SUPERVISOR_MODEL } from "@/lib/agents/contracts";
import { AGENT_MAX_BODY_BYTES, agentAccessMode } from "@/lib/agents/security";

export function GET() {
  const accessMode = agentAccessMode();
  const authBackendReady = useFirebaseBackend() || isSupabaseConfigured();
  const gatewayReady = Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY);

  return NextResponse.json({
    ok: true,
    service: "worldpatro",
    version: "2.0.1",
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
      configured: gatewayReady,
      supervisorModel: SUPERVISOR_MODEL,
      subagentModel: SUBAGENT_MODEL,
      specialists: AGENT_PROFILES.length,
      accessMode,
      authenticatedBackendReady: authBackendReady,
      requestBodyLimitBytes: AGENT_MAX_BODY_BYTES,
      externalActions: "human-confirmation-required"
    },
    observability: {
      requestIds: true,
      structuredLogs: true,
      customMetrics: true
    },
    wbe: {
      gates: GATES.length,
      anchors: ANCHORS.length
    },
    time: new Date().toISOString()
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}
