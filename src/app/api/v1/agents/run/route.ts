import { NextResponse } from "next/server";
import { generateText, isStepCount, tool } from "ai";
import { z } from "zod";
import { SUPERVISOR_MODEL, SUPERVISOR_SYSTEM, type AgentRole } from "@/lib/agents/contracts";
import { runSpecialist, type AgentContext } from "@/lib/agents/specialists";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { serverNow, userCollection } from "@/lib/firebase/data";

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

export async function POST(request: Request) {
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid agent request", issues: parsed.error.issues }, { status: 400 });
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
        "WBE is symbolism.",
        "External operations require human confirmation."
      ],
      generatedAt: new Date().toISOString()
    };

    if (useFirebaseBackend()) {
      const user = await getFirebaseUser();
      if (user) {
        await userCollection(user.uid, "agentRuns").add({
          request: parsed.data.message,
          context: parsed.data.context,
          delegated,
          answer: result.text,
          supervisorModel: SUPERVISOR_MODEL,
          createdAt: serverNow()
        });
      }
    }

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent runtime failed.";
    return NextResponse.json({
      error: "World Patro agents are temporarily unavailable.",
      detail: message,
      recovery: "Calendar, Panchang, world-data and WBE APIs remain available independently."
    }, { status: 503 });
  }
}
