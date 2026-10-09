import { NextRequest } from "next/server";
import { requireAdmin,adminReply,sameOrigin,safeAdminJson } from "@/lib/admin/auth";
import {UpdateAdminRecord} from "@/lib/admin/contracts";
import {updateAdminRecord,VersionConflict,InvalidTransition,MissingRecord} from "@/lib/admin/storage";

export const dynamic="force-dynamic";
function validId(id:string){return /^(source|authority|observance|article)__[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)&&id.length<=130;}
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const auth=await requireAdmin(true);
  if(auth.error)return auth.error;
  const {id}=await params;
  if(!validId(id))return adminReply({error:"Invalid record ID."},400);
  const input=await safeAdminJson(request);
  if(input.error)return input.error;
  const parsed=UpdateAdminRecord.safeParse(input.data);
  if(!parsed.success)return adminReply({error:"Invalid update.",issues:parsed.error.issues},400);
  if(Object.keys(parsed.data).length===1)return adminReply({error:"No content changes provided."},400);
  try{return adminReply({record:await updateAdminRecord(auth.context,id,parsed.data)});}
  catch(err){
    if(err instanceof MissingRecord)return adminReply({error:err.message},404);
    if(err instanceof VersionConflict)return adminReply({error:err.message},409);
    if(err instanceof InvalidTransition)return adminReply({error:err.message},422);
    return adminReply({error:"Admin data update unavailable."},503);
  }
}
export async function DELETE(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const auth=await requireAdmin(true);
  if(auth.error)return auth.error;
  if(!sameOrigin(request))return adminReply({error:"Cross-origin mutation forbidden."},403);
  const {id}=await params;
  if(!validId(id))return adminReply({error:"Invalid record ID."},400);
  // Immutable audit retention: DELETE is implemented as a soft archive, not an unsafe hard-delete.
  const raw=request.nextUrl.searchParams.get("version")||"";
  if(!/^[1-9]\d*$/.test(raw))return adminReply({error:"Expected current version."},400);
  try{return adminReply({record:await updateAdminRecord(auth.context,id,{status:"archived",expectedVersion:Number(raw)})});}
  catch(err){
    if(err instanceof MissingRecord)return adminReply({error:err.message},404);
    if(err instanceof VersionConflict)return adminReply({error:err.message},409);
    if(err instanceof InvalidTransition)return adminReply({error:err.message},422);
    return adminReply({error:"Archive operation unavailable."},503);
  }
}
