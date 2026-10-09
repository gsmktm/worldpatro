import {requireAdmin,adminReply} from "@/lib/admin/auth";
import {listAdminRecords,listAdminAudit} from "@/lib/admin/storage";
import {ADMIN_KINDS} from "@/lib/admin/contracts";

export const dynamic="force-dynamic";
export async function GET(){
  const auth=await requireAdmin();
  if(auth.error)return auth.error;
  try{
    const [records,audit]=await Promise.all([
      listAdminRecords(auth.context),listAdminAudit(auth.context)
    ]);
    const byKind=Object.fromEntries(ADMIN_KINDS.map(kind=>[kind,records.filter(x=>x.kind===kind).length]));
    return adminReply({
      role:auth.context.role,backend:auth.context.backend,
      metrics:{
        total:records.length,draft:records.filter(r=>r.status==="draft").length,
        inReview:records.filter(r=>r.status==="in_review").length,
        published:records.filter(r=>r.status==="published").length,
        archived:records.filter(r=>r.status==="archived").length,byKind
      },
      recentAudit:audit,
      limits:{records:"Latest 100 content records",audit:"Latest 50 audit events"},
      requiredAction:auth.context.backend==="firebase"
        ?"Admin role is verified with Firebase Auth custom claims."
        :"Admin role is verified with Supabase Auth app_metadata and enforced again by RLS."
    });
  }catch{return adminReply({error:"Admin database or audit collection unavailable."},503);}
}
