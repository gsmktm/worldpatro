import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { generateText, isStepCount, tool } from "ai";
import { z } from "zod";
import { SUPERVISOR_MODEL, SUPERVISOR_SYSTEM, type AgentRole } from "@/lib/agents/contracts";
import { runSpecialist, type AgentContext } from "@/lib/agents/specialists";
import { AGENT_MAX_BODY_BYTES, authorizeAgentRequest } from "@/lib/agents/security";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { serverNow, userCollection } from "@/lib/firebase/data";
import { worldLog, worldMetric } from "@/lib/observability";

export const maxDuration = 60;

const Input = z.object({
  message: z.string().min(2).max(8000),
  context: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    iso3: z.string().length(3).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lon: z.number().min(-180).max(180).optional(),
    tz: z.string().max(100).optional(),
    scores: z.array(z.number().min(0).max(10)).length(9).optional()
  }).default({})
});

function agentResponse(
  payload: unknown,
  status: number,
  requestId: string,
  startedAt: number
) {
  const durationMs = Math.round(performance.now() - startedAt);
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
      "Server-Timing": `worldpatro-agent;dur=${durationMs}`
    }
  });
}

export async function POST(request: Request) {
  const startedAt = performance.now();
  const requestId = request.headers.get("x-request-id")?.slice(0, 100) || randomUUID();

  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  if (!contentType.startsWith("application/json")) {
    worldMetric("worldpatro.agent.requests", 1, { outcome: "unsupported_media_type" });
    return agentResponse({ error: "Content-Type must be application/json." }, 415, requestId, startedAt);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > AGENT_MAX_BODY_BYTES) {
    worldMetric("worldpatro.agent.requests", 1, { outcome: "payload_too_large" });
    return agentResponse({ error: "Agent request payload is too large." }, 413, requestId, startedAt);
  }

  const access = await authorizeAgentRequest(request);
  if (!access.allowed) {
    worldMetric("worldpatro.agent.requests", 1, { outcome: "unauthorized", mode: access.mode });
    worldLog("agent.run.denied", { requestId, mode: access.mode, reason: access.reason });
    const status = access.reason === "origin-not-allowed" ? 403 : 401;
    const error =
      access.reason === "api-key-required"
        ? "Agent API key required."
        : access.reason === "origin-not-allowed"
          ? "Cross-origin agent execution is not allowed."
          : "Sign in to use the World Patro Conductor.";

    return agentResponse({ error, accessMode: access.mode }, status, requestId, startedAt);
  }

  if (!process.env.VERCEL_OIDC_TOKEN && !process.env.AI_GATEWAY_API_KEY) {
    worldMetric("worldpatro.agent.requests", 1, { outcome: "gateway_unavailable" });
    return agentResponse({
      error: "AI Gateway is not available in this runtime.",
      recovery: "Calendar, Panchang, world-data and WBE APIs remain available independently."
    }, 503, requestId, startedAt);
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > AGENT_MAX_BODY_BYTES) {
    worldMetric("worldpatro.agent.requests", 1, { outcome: "payload_too_large" });
    return agentResponse({ error: "Agent request payload is too large." }, 413, requestId, startedAt);
  }

  let input: unknown = null;
  try {
    input = JSON.parse(raw);
  } catch {
    worldMetric("worldpatro.agent.requests", 1, { outcome: "invalid_json" });
    return agentResponse({ error: "Invalid JSON request body." }, 400, requestId, startedAt);
  }

  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    worldMetric("worldpatro.agent.requests", 1, { outcome: "invalid_input" });
    return agentResponse({ error: "Invalid agent request", issues: parsed.error.issues }, 400, requestId, startedAt);
  }

  const delegated: Array<{ role: AgentRole; name: string }> = [];
  const context: AgentContext = parsed.data.context;

  const delegate = (role: AgentRole, description: string) => tool({
    description,
    inputSchema: z.object({ task: z.string().min(2).max(4000) }),
    execute: async ({ task }) => {
      const result = await runSpecialist(role, task, context);
      delegated.push({ role: result.role, name: result.name });
      return result;
    }
  });

  try {
    const result = await generateText({
      model: SUPERVISOR_MODEL,
      system: SUPERVISOR_SYSTEM,
      prompt: parsed.data.message,
      tools: {
        timeAgent: delegate("time", "Delegate calendar, chronology, date conversion or calendar-method questions to Kala."),
        astronomyAgent: delegate("astronomy", "Delegate Panchang, Sun or Moon, sunrise or sunset, Nakshatra or astronomical sacred-time questions to Jyoti."),
        worldAgent: delegate("world", "Delegate public country indicators and world-fact grounding to Prithvi."),
        researchAgent: delegate("research", "Delegate evidence framing, source comparison and research decomposition to Sutra."),
        balanceAgent: delegate("balance", "Delegate WBE-9 symbolic balance analysis to Mandala."),
        operationsAgent: delegate("operations", "Delegate workflow drafting, approvals and verification planning to Karma. This agent cannot execute external actions.")
      },
      stopWhen: isStepCount(7)
    });

    const payload = {
      answer: result.text,
      supervisor: "World Patro Conductor",
      model: SUPERVISOR_MODEL,
      subagentModel: process.env.AI_GATEWAY_MODEL_SUBAGENT || "openai/gpt-5.6-luna",
      delegated,
      truthBoundary: [
        "Facts/calculations must be source- or method-backed.",
        "Astrology is interpretation.",
        "WBGR-109 / WENS is symbolism.",
        "External operations require human confirmation."
      ],
      requestId,
      generatedAt: new Date().toISOString()
    };

    if (useFirebaseBackend() && access.user?.provider === "firebase") {
      await userCollection(access.user.id, "agentRuns").add({
        request: parsed.data.message,
        context: parsed.data.context,
        delegated,
        answer: result.text,
        supervisorModel: SUPERVISOR_MODEL,
        requestId,
        createdAt: serverNow()
      });
    }

    const durationMs = Math.round(performance.now() - startedAt);
    worldMetric("worldpatro.agent.requests", 1, { outcome: "success", mode: access.mode });
    worldMetric("worldpatro.agent.duration_ms", durationMs, { outcome: "success" });
    worldMetric("worldpatro.agent.delegations", delegated.length);
    worldLog("agent.run.completed", {
      requestId,
      outcome: "success",
      accessMode: access.mode,
      authProvider: access.user?.provider || "none",
      delegatedRoles: delegated.map(item => item.role),
      durationMs
    });

    return agentResponse(payload, 200, requestId, startedAt);
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    const message = error instanceof Error ? error.message : "Agent runtime failed.";
    worldMetric("worldpatro.agent.requests", 1, { outcome: "error", mode: access.mode });
    worldMetric("worldpatro.agent.duration_ms", durationMs, { outcome: "error" });
    worldLog("agent.run.failed", {
      requestId,
      outcome: "error",
      accessMode: access.mode,
      errorName: error instanceof Error ? error.name : "UnknownError",
      durationMs
    });

    return agentResponse({
      error: "World Patro agents are temporarily unavailable.",
      detail: process.env.NODE_ENV === "development" ? message : undefined,
      requestId,
      recovery: "Calendar, Panchang, world-data and WBE APIs remain available independently."
    }, 503, requestId, startedAt);
  }
}
