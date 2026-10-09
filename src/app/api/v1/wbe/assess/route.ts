import { NextResponse } from "next/server";
import { assessWbe } from "@/lib/wbe";
export async function POST(request:Request) {
  try {
    const body=await request.json();
    return NextResponse.json({assessment:assessWbe(body.scores),labels:["LISTEN","MAP","SCORE","REVEAL","CONFRONT","BRIDGE","PRESCRIBE","SUBTRACT","SEAL"],disclaimer:"Scores are symbolic/self-reflective unless an explicitly sourced empirical model is supplied."});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:"Invalid request"},{status:400}); }
}
