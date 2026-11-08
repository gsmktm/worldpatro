import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { readMutationJson,requireSameOrigin } from "@/lib/http/write-guard";
import { PlannerInput,PLANNER_MODULE } from "@/lib/planner";
export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
const validId=(s:string)=>/^[A-Za-z0-9_-]{5,128}$/.test(s);
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const guard=await readMutationJson(request,8192);if(!guard.ok)return guard.response;
 const {id}=await params;if(!validId(id))return reply({error:"Invalid event ID."},400);
 const parsed=PlannerInput.safeParse(guard.data);if(!parsed.success)return reply({error:"Invalid planner event."},400);
 const auth=await requireUser();if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
 const {data,error}=await auth.supabase.from("saved_reports").update({title:parsed.data.title,result:parsed.data}).eq("id",id).eq("user_id",auth.userId).eq("kind","research").eq("request_context->>module",PLANNER_MODULE).select("id,created_at");
 if(error)return reply({error:"Could not update your event."},503);
 if(!data?.length)return reply({error:"Event not found."},404);
 return reply({event:{...parsed.data,id,createdAt:data[0].created_at}});
}
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
 const guard=requireSameOrigin(request);if(guard)return guard;
 const {id}=await params;if(!validId(id))return reply({error:"Invalid event ID."},400);
 const auth=await requireUser();if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
 const {data,error}=await auth.supabase.from("saved_reports").delete().eq("id",id).eq("user_id",auth.userId).eq("kind","research").eq("request_context->>module",PLANNER_MODULE).select("id");
 if(error)return reply({error:"Could not delete your event."},503);
 if(!data?.length)return reply({error:"Event not found."},404);
 return reply({deleted:true,id});
}
