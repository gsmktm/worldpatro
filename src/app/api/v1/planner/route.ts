import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { readMutationJson } from "@/lib/http/write-guard";
import { PlannerInput,PLANNER_MODULE } from "@/lib/planner";
export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
export async function GET(){
 const auth=await requireUser();if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
 const {data,error}=await auth.supabase.from("saved_reports").select("id,title,result,created_at").eq("user_id",auth.userId).eq("kind","research").eq("request_context->>module",PLANNER_MODULE).order("created_at",{ascending:false}).limit(500);
 if(error)return reply({error:"Account planner storage is unavailable. Use the device planner or retry."},503);
 const events=(data||[]).flatMap(row=>{const parsed=PlannerInput.safeParse(row.result);return parsed.success?[{...parsed.data,id:row.id,createdAt:row.created_at}]:[];});
 return reply({backend:"supabase",events,limit:500});
}
export async function POST(request:Request){
 const body=await readMutationJson(request,8192);if(!body.ok)return body.response;
 const parsed=PlannerInput.safeParse(body.data);if(!parsed.success)return reply({error:"Invalid planner event.",issues:parsed.error.issues},400);
 const auth=await requireUser();if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
 const {data,error}=await auth.supabase.from("saved_reports").insert({user_id:auth.userId,kind:"research",title:parsed.data.title,request_context:{module:PLANNER_MODULE},result:parsed.data,calculation_version:{schema:"planner-v1"}}).select("id,created_at").single();
 if(error)return reply({error:"Could not save your account event. Nothing was added to this device automatically."},503);
 return reply({event:{...parsed.data,id:data.id,createdAt:data.created_at},backend:"supabase"},201);
}
