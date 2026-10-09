import {requireAdmin,adminReply} from "@/lib/admin/auth";
export const dynamic="force-dynamic";
export async function GET(){
  const auth=await requireAdmin();
  if(auth.error)return auth.error;
  return adminReply({authenticated:true,role:auth.context.role,backend:auth.context.backend});
}
