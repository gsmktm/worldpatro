import { NextResponse } from "next/server";
import { z } from "zod";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { listUserDocs, serverNow, userCollection } from "@/lib/firebase/data";
import { requireUser } from "@/lib/auth";
import { assessWbe } from "@/lib/wbe";

export const dynamic="force-dynamic";
const Input=z.object({
  scores:z.array(z.number().int().min(0).max(10)).length(9),
  title:z.string().trim().min(1).max(90).default("WBE-9 reflection")
}).strict();

function checkOrigin(request:Request) {
  if(request.headers.get("sec-fetch-site")==="cross-site") return false;
  const origin=request.headers.get("origin");
  if(!origin) return true;
  try {return new URL(origin).origin===new URL(request.url).origin;}
  catch {return false;}
}

function response(body:unknown,status=200){
  return NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
}
function scoreArray(value:unknown):number[]|null {
  if(!Array.isArray(value)||value.length!==9||!value.every(v=>Number.isInteger(v)&&v>=0&&v<=10)) return null;
  return value as number[];
}
function normalize(id:string,title:string,raw:unknown,createdAt:unknown) {
  const payload=raw && typeof raw==="object" ? raw as Record<string,unknown>:{};
  const scores=scoreArray(payload.scores);
  return scores?{id,title,scores,createdAt:typeof createdAt==="string"?createdAt:null}:null;
}

export async function GET(){
  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return response({error:"Authentication required."},401);
    const reports=await listUserDocs(user.uid,"reports",100);
    return response({backend:"firebase",snapshots:reports.filter(r=>r.kind==="wbe").map(r=>normalize(String(r.id),String(r.title||"WBE-9 reflection"),r.result,r.createdAt)).filter(Boolean).slice(0,20)});
  }
  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  const {data,error}=await auth.supabase.from("saved_reports").select("id,title,result,created_at")
    .eq("user_id",auth.userId).eq("kind","wbe").order("created_at",{ascending:false}).limit(20);
  if(error)return response({error:"Could not load saved reflections."},502);
  return response({backend:"supabase",snapshots:(data||[]).map(r=>normalize(String(r.id),String(r.title),r.result,r.created_at)).filter(Boolean)});
}

export async function POST(request:Request){
  if(!checkOrigin(request))return response({error:"Cross-origin writes are not allowed."},403);
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))return response({error:"Use application/json."},415);
  const length=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(length)&&length>4096)return response({error:"Payload exceeds 4 KiB."},413);
  const body=await request.text();
  if(Buffer.byteLength(body)>4096)return response({error:"Payload exceeds 4 KiB."},413);
  const parsed=Input.safeParse((()=>{try{return JSON.parse(body)}catch{return null}})());
  if(!parsed.success)return response({error:"Use exactly nine integer scores between 0 and 10.",issues:parsed.error.issues},400);
  const {scores,title}=parsed.data;
  const result={
    scores,
    assessment:assessWbe(scores),
    framework:"WBE-9 symbolic user reflection",
    empirical:false,
    provenance:"USER_REPORTED"
  };
  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return response({error:"Authentication required."},401);
    const ref=await userCollection(user.uid,"reports").add({
      kind:"wbe",title,requestContext:{scope:"self-reflection"},
      result,calculationVersion:{engine:"wbe-symbolic-v1"},
      createdAt:serverNow()
    });
    return response({id:ref.id,title,scores,backend:"firebase",saved:true},201);
  }
  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  const {data,error}=await auth.supabase.from("saved_reports").insert({
    user_id:auth.userId,kind:"wbe",title,
    request_context:{scope:"self-reflection"},result,
    calculation_version:{engine:"wbe-symbolic-v1"}
  }).select("id").single();
  if(error)return response({error:"Could not save reflection."},502);
  return response({id:data.id,title,scores,backend:"supabase",saved:true},201);
}
