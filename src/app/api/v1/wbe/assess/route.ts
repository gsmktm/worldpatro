import { NextResponse } from "next/server";
import { assessWbe } from "@/lib/wbe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body?.scores) || body.scores.length !== 9) {
      return NextResponse.json({ error: "Provide scores as an array of exactly 9 numbers." }, { status: 400 });
    }

    const assessment = assessWbe(body.scores);
    return NextResponse.json({
      assessment,
      labels: ["LISTEN", "MAP", "SCORE", "REVEAL", "CONFRONT", "BRIDGE", "PRESCRIBE", "SUBTRACT", "SEAL"],
      disclaimer: "These are symbolic/self-reflective scores unless backed by an explicitly sourced empirical indicator model."
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}
