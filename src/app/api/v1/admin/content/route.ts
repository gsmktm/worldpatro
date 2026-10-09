import { NextRequest } from "next/server";
import { requireAdmin,adminReply,safeAdminJson } from "@/lib/admin/auth";
import { ADMIN_KINDS,CreateAdminRecord, type AdminKind } from "@/lib/admin/contracts";
import { createAdminRecord,listAdminRecords } from "@/lib/admin/storage";

export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
  const auth=await requireAdmin();
  if(auth.error)return auth.error;
  const kind=request.nextUrl.searchParams.get("kind");
  if(kind&&!ADMIN_KINDS.includes(kind as AdminKind))return adminReply({error:"Unknown content kind."},400);
  try{
    const records=await listAdminRecords(auth.context,kind as AdminKind|undefined);
    return adminReply({backend:auth.context.backend,role:auth.context.role,records,total:records.length});
  }catch{return adminReply({error:"Admin storage is unavailable or its schema has not been installed."},503);}
}
export async function POST(request:NextRequest){
  const auth=await requireAdmin(true);
  if(auth.error)return auth.error;
  const input=await safeAdminJson(request);
  if(input.error)return input.error;
  const parsed=CreateAdminRecord.safeParse(input.data);
  if(!parsed.success)return adminReply({error:"Invalid admin content.",issues:parsed.error.issues},400);
  try{
    const record=await createAdminRecord(auth.context,parsed.data);
    return adminReply({record},201);
  }catch(err){
    const message=err instanceof Error?err.message:"Creation unavailable.";
    return adminReply({error:message},message.includes("already exists")?409:503);
  }
}
