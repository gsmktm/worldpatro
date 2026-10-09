import { NextResponse } from "next/server";
import { z } from "zod";
import { makeBirthChart, resolveBirthInstant } from "@/lib/jyotish/birth-chart";

export const runtime = "nodejs";
export const maxDuration = 20;
export const dynamic = "force-dynamic";

const Input = z.object({
  name:z.string().trim().max(120).optional(),
  date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  timezone:z.string().min(1).max(100),
  latitude:z.number().min(-66).max(66),
  longitude:z.number().min(-180).max(180),
  elevation:z.number().min(-500).max(9000).default(0),
  houseSystem:z.enum(["whole_sign","equal"]).default("whole_sign")
}).strict();

function result(body:unknown,status=200) {
  return NextResponse.json(body,{
    status,
    headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}
  });
}

export async function POST(request:Request) {
  const ctype=request.headers.get("content-type")||"";
  if(!ctype.toLowerCase().startsWith("application/json"))return result({error:"Expected application/json."},415);
  const length=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(length)&&length>4096)return result({error:"Birth-chart request exceeds 4 KiB."},413);
  const raw=await request.text();
  if(Buffer.byteLength(raw,"utf8")>4096)return result({error:"Birth-chart request exceeds 4 KiB."},413);
  let json:unknown;
  try{json=JSON.parse(raw);}catch{return result({error:"Malformed JSON."},400);}
  const input=Input.safeParse(json);
  if(!input.success)return result({error:"Invalid birth-chart inputs.",issues:input.error.issues},400);

  try {
    // Fail closed on DST ambiguity or historical date gaps before ephemeris calculation.
    resolveBirthInstant(input.data.date,input.data.time,input.data.timezone);
    const chart=makeBirthChart(input.data);
    return result({
      chart,
      truthLayer:"ASTRONOMICAL CALCULATION + TRADITIONAL INTERPRETATION",
      status:"calculated",
      saved:false,
      notice:"This endpoint performs calculation only. Birth details are never saved unless the user separately authenticates and explicitly chooses Save."
    });
  }catch(error){
    return result({error:error instanceof Error?error.message:"Chart calculation failed."},422);
  }
}
