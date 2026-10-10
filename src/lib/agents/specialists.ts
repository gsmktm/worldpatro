import { generateText, isStepCount, tool, type ToolSet } from "ai";
import { z } from "zod";
import { buildCalendarSnapshot } from "@/lib/calendars";
import { calculatePanchang } from "@/lib/astro";
import { defaults } from "@/lib/env";
import { getCountrySnapshot } from "@/lib/world-data";
import { assessWbe } from "@/lib/wbe";
import { SUBAGENT_MODEL, type AgentRole, AGENT_PROFILES } from "@/lib/agents/contracts";

export type AgentContext = {
  date?: string;
  iso3?: string;
  lat?: number;
  lon?: number;
  tz?: string;
  scores?: number[];
};

export type SpecialistResult = {
  role: AgentRole;
  name: string;
  text: string;
};

function profile(role: AgentRole) {
  const found = AGENT_PROFILES.find(item => item.role === role);
  if (!found) throw new Error(`Unknown specialist: ${role}`);
  return found;
}

function day(value?: string) {
  const raw = value || new Date().toISOString().slice(0, 10);
  const parsed = new Date(`${raw}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Invalid date.");
  return parsed;
}

const calendarTool = tool({
  description: "Calculate World Patro calendar correspondences for a Gregorian input date, preserving unsupported and authority-required states.",
  inputSchema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    locale: z.string().default("en")
  }),
  execute: async ({ date, locale }) => ({
    date,
    calendars: buildCalendarSnapshot(day(date), locale)
  })
});

const panchangTool = tool({
  description: "Calculate location-aware astronomical Panchang values using World Patro's astronomy engine.",
  inputSchema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    tz: z.string(),
    elevation: z.number().default(1400)
  }),
  execute: async ({ date, lat, lon, tz, elevation }) => ({
    date,
    ...calculatePanchang({
      date: new Date(`${date}T06:15:00Z`),
      lat,
      lon,
      tz,
      elevation
    })
  })
});

const countryTool = tool({
  description: "Fetch the latest available public World Bank country indicators used by World Patro.",
  inputSchema: z.object({ iso3: z.string().length(3) }),
  execute: async ({ iso3 }) => getCountrySnapshot(iso3.toUpperCase())
});

const wbeTool = tool({
  description: "Calculate the nine WBGR-109 / WENS symbolic dial classifications from exactly nine self-reflective scores.",
  inputSchema: z.object({ scores: z.array(z.number().min(0).max(10)).length(9) }),
  execute: async ({ scores }) => ({
    assessment: assessWbe(scores),
    label: "WBGR-109 / WENS SYMBOLISM",
    disclaimer: "Symbolic/self-reflective unless an explicitly sourced empirical model is supplied."
  })
});

const systems: Record<AgentRole, string> = {
  time: "You are Kala, the World Patro time specialist. Use the calendar tool when date correspondence matters. Explain method and authority limits. Never fabricate Nepal BS or Nepal Sambat official values.",
  astronomy: "You are Jyoti, the World Patro astronomical specialist. Use the Panchang tool. Distinguish calculated astronomy from astrological or ritual interpretation.",
  world: "You are Prithvi, the public-source world intelligence specialist. Use the country tool when useful. State retrieval and source limits and never infer covert facts.",
  research: "You are Sutra, the evidence specialist. Build a compact research frame: known facts, reported claims, unresolved questions, best next sources. Use calendar or country tools only when they materially ground the answer.",
  balance: "You are Mandala, the WBGR-109 / WENS specialist. Use WBGR-109 scoring only when nine scores are supplied or explicitly requested. Always label the output WBGR-109 / WENS SYMBOLISM.",
  operations: "You are Karma, the authorized workflow specialist. Produce plans, approvals, dependencies, evidence requirements and rollback or verification steps. Never claim to execute a consequential action. Mark every external action as REQUIRES HUMAN CONFIRMATION."
};

function toolsForRole(role: AgentRole): ToolSet {
  switch (role) {
    case "time":
      return { calendar: calendarTool };
    case "astronomy":
      return { panchang: panchangTool };
    case "world":
      return { country: countryTool };
    case "research":
      return { calendar: calendarTool, country: countryTool };
    case "balance":
      return { wbe: wbeTool };
    case "operations":
      return {};
  }
}

export async function runSpecialist(role: AgentRole, task: string, context: AgentContext = {}): Promise<SpecialistResult> {
  const agent = profile(role);
  const contextLine = JSON.stringify({
    date: context.date || new Date().toISOString().slice(0, 10),
    iso3: context.iso3 || "NPL",
    lat: context.lat ?? defaults.lat,
    lon: context.lon ?? defaults.lon,
    tz: context.tz || defaults.tz,
    scores: context.scores
  });

  const tools = toolsForRole(role);

  const { text } = await generateText({
    model: SUBAGENT_MODEL,
    system: `${systems[role]}\nBoundary: ${agent.boundary}`,
    prompt: `Task: ${task}\nCanonical context: ${contextLine}`,
    tools,
    stopWhen: isStepCount(4)
  });

  return { role, name: agent.name, text };
}
