import { NextResponse } from "next/server";
import { AGENT_PROFILES, SUBAGENT_MODEL, SUPERVISOR_MODEL } from "@/lib/agents/contracts";
import { AGENT_MAX_BODY_BYTES, agentAccessMode } from "@/lib/agents/security";
import { isSupabaseConfigured } from "@/lib/env";
import { useFirebaseBackend } from "@/lib/firebase/config";

export function GET() {
  const accessMode = agentAccessMode();
  const authBackendReady = useFirebaseBackend() || isSupabaseConfigured();
  const apiKeyConfigured = Boolean(process.env.WORLD_PATRO_AGENT_API_KEY);
  const gatewayReady = Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY);

  const accessReady =
    accessMode === "public"
      ? true
      : accessMode === "api-key"
        ? apiKeyConfigured
        : authBackendReady;

  return NextResponse.json({
    readyForGateway: gatewayReady,
    runtimeReady: gatewayReady && accessReady,
    access: {
      mode: accessMode,
      authenticatedBackendReady: authBackendReady,
      apiKeyConfigured
    },
    supervisor: { name: "World Patro Conductor", model: SUPERVISOR_MODEL },
    subagentModel: SUBAGENT_MODEL,
    specialists: AGENT_PROFILES,
    observability: {
      requestIds: true,
      structuredLogs: true,
      vercelCustomMetrics: true
    },
    executionPolicy: {
      maxSupervisorSteps: 7,
      maxSpecialistSteps: 4,
      requestBodyLimitBytes: AGENT_MAX_BODY_BYTES,
      externalActions: "human-confirmation-required"
    }
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}
