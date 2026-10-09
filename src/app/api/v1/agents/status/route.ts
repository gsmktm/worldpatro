import { NextResponse } from "next/server";
import { AGENT_PROFILES, SUBAGENT_MODEL, SUPERVISOR_MODEL } from "@/lib/agents/contracts";

export function GET() {
  return NextResponse.json({
    readyForGateway: Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY),
    supervisor: { name: "World Patro Conductor", model: SUPERVISOR_MODEL },
    subagentModel: SUBAGENT_MODEL,
    specialists: AGENT_PROFILES,
    executionPolicy: {
      maxSupervisorSteps: 7,
      maxSpecialistSteps: 4,
      externalActions: "human-confirmation-required"
    }
  });
}
