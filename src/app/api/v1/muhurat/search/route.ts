import { z } from "zod";
import { NextResponse } from "next/server";
import { MUHURAT_CATEGORIES, searchMuhurat } from "@/lib/jyotish/muhurat-search";

export const runtime="nodejs";
export const maxDuration=35;
const Input=z.object({
  category:z.enum(MUHURAT_CATEGORIES),
  from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone:z.string().min(1).max(100),
  latitude:z.number().min(-66).max(66),
  longitude:z.number().min(-180).max(180),
  elevation:z.number().min(-500).max(9000).default(0),
  limit:z.number().int().min(1).max(31).default(15)
}).strict();
const json=(payload:unknown,status=200)=>NextResponse.json(payload,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:Request) {
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))return json({error:"Use application/json."},415);
  if(Number(request.headers.get("content-length")||0)>4096)return json({error:"Maximum 4 KiB request."},413);
  const raw=await request.text();
  if(Buffer.byteLength(raw)>4096)return json({error:"Maximum 4 KiB request."},413);
  const input=Input.safeParse((()=>{try{return JSON.parse(raw)}catch{return null}})());
  if(!input.success)return json({error:"Invalid Muhurat search input.",issues:input.error.issues},400);
  try {return json(searchMuhurat(input.data));}
  catch(e){return json({error:e instanceof Error?e.message:"Could not calculate Muhurat candidates."},422);}
}
