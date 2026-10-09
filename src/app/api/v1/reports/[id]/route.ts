import { NextResponse } from "next/server";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { userCollection } from "@/lib/firebase/data";
import { requireUser } from "@/lib/auth";

export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{
  status,headers:{"Cache-Control":"no-store"}
});

export async function DELETE(
  request:Request,
  {params}:{params:Promise<{id:string}>}
){
  const {id}=await params;
  if(!/^[A-Za-z0-9_-]{5,128}$/.test(id)){
    return reply({error:"Invalid report ID."},400);
  }
  if(request.headers.get("sec-fetch-site")==="cross-site"){
    return reply({error:"Cross-origin report deletion is not permitted."},403);
  }
  const origin=request.headers.get("origin");
  if(origin){
    try {
      if(new URL(origin).origin!==new URL(request.url).origin){
        return reply({error:"Cross-origin report deletion is not permitted."},403);
      }
    }catch{
      return reply({error:"Invalid Origin."},403);
    }
  }

  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return reply({error:"Authentication required."},401);
    const doc=userCollection(user.uid,"reports").doc(id);
    const existing=await doc.get();
    if(!existing.exists)return reply({error:"Report not found."},404);
    await doc.delete();
    return reply({deleted:true,id,backend:"firebase"});
  }

  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  const {data,error}=await auth.supabase.from("saved_reports").delete()
    .eq("id",id).eq("user_id",auth.userId).select("id");
  if(error)return reply({error:"Could not delete report."},502);
  if(!data?.length)return reply({error:"Report not found."},404);
  return reply({deleted:true,id,backend:"supabase"});
}
