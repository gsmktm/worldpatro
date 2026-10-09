import { NextResponse } from "next/server";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminRole="admin"|"editor"|"reviewer";
export type AdminContext={
  backend:"firebase"|"supabase";
  userId:string;
  role:AdminRole;
  supabase?:NonNullable<Awaited<ReturnType<typeof createClient>>>;
};
type AdminResult={context:AdminContext;error?:never}|{context?:never;error:NextResponse};
const roleOf=(value:unknown):AdminRole|null=>
  value==="admin"||value==="editor"||value==="reviewer"?value:null;
const error=(message:string,status:number)=>NextResponse.json({error:message},{status,headers:{"Cache-Control":"no-store"}});

export async function requireAdmin(write=false):Promise<AdminResult>{
  if(useFirebaseBackend()){
    const identity=await getFirebaseUser();
    if(!identity)return {error:error("Sign in required.",401)};
    try{
      // Read the authoritative Firebase Auth custom claims, not client-editable Firestore user data.
      const record=await getFirebaseAdminAuth().getUser(identity.uid);
      if(record.disabled)return {error:error("Account disabled.",403)};
      const role=roleOf(record.customClaims?.worldpatro_role);
      if(!role || (write&&role!=="admin"))return {error:error("Administrator permission required.",403)};
      return {context:{backend:"firebase",userId:identity.uid,role}};
    }catch{return {error:error("Admin identity verification unavailable.",503)};}
  }
  const supabase=await createClient();
  if(!supabase)return {error:error("Admin backend not configured.",503)};
  // getUser fetches a verified user from Auth. NEVER trust user_metadata or editable UI values.
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user)return {error:error("Sign in required.",401)};
  const role=roleOf(user.app_metadata?.worldpatro_role);
  if(!role || (write&&role!=="admin"))return {error:error("Administrator permission required.",403)};
  return {context:{backend:"supabase",userId:user.id,role,supabase}};
}
export function sameOrigin(request:Request){
  if(request.headers.get("sec-fetch-site")==="cross-site")return false;
  const origin=request.headers.get("origin");
  if(!origin)return true;
  try{return new URL(origin).origin===new URL(request.url).origin;}
  catch{return false;}
}
export function adminReply(value:unknown,status=200){
  return NextResponse.json(value,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
export async function safeAdminJson(request:Request,maxBytes=32768){
  if(!sameOrigin(request))return {error:adminReply({error:"Cross-origin writes forbidden."},403)};
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return {error:adminReply({error:"Use application/json."},415)};
  if(Number(request.headers.get("content-length")||0)>maxBytes)
    return {error:adminReply({error:"Request body exceeds limit."},413)};
  const raw=await request.text();
  if(Buffer.byteLength(raw)>maxBytes)return {error:adminReply({error:"Request body exceeds limit."},413)};
  try{return {data:JSON.parse(raw) as unknown};}
  catch{return {error:adminReply({error:"Malformed JSON."},400)};}
}
