import { NextResponse } from "next/server";
import { z } from "zod";
import { readPublicJson } from "@/lib/http/write-guard";
import { assessWbe } from "@/lib/wbe";
import { WBGR } from "@/lib/wbgr";

const Input = z.object({ scores: z.array(z.number().finite().min(0).max(10)).length(9) }).strict();

export async function POST(request: Request) {
  const body = await readPublicJson(request, 4096);
  if (!body.ok) return body.response;
  const parsed = Input.safeParse(body.data);
  if (!parsed.success) return NextResponse.json(
    { error: "Exactly nine scores between 0 and 10 are required.", issues: parsed.error.issues },
    { status: 400, headers: { "Cache-Control": "no-store" } }
  );
  return NextResponse.json({
    framework: WBGR.title,
    assessment: assessWbe(parsed.data.scores),
    labels: ["LISTEN","MAP","SCORE","REVEAL","CONFRONT","BRIDGE","PRESCRIBE","SUBTRACT","SEAL"],
    disclaimer: "Scores are symbolic/self-reflective unless an explicitly sourced empirical model is supplied."
  }, { headers: { "Cache-Control": "no-store" } });
}
