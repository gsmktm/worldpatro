import { NextRequest, NextResponse } from "next/server";
import { getFirebaseUser } from "@/lib/firebase/user";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { serializeDocument, userCollection } from "@/lib/firebase/data";
import { requireUser } from "@/lib/auth";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=45;

// This is an explicit, bounded export snapshot—not a promise of total
// account erasure or an exhaustive GDPR portability archive.
const SOURCES=[
  {key:"birthProfiles",firestore:"birthProfiles",supabase:"birth_profiles",owner:"user_id"},
  {key:"savedReports",firestore:"reports",supabase:"saved_reports",owner:"user_id"},
  {key:"researchNotebooks",firestore:"researchNotebooks",supabase:"research_notebooks",owner:"user_id"},
  {key:"watchlists",firestore:"watchlists",supabase:"watchlists",owner:"user_id"},
  {key:"notifications",firestore:"notifications",supabase:"notifications",owner:"user_id"},
  {key:"workflowOrders",firestore:"workflowOrders",supabase:"workflow_orders",owner:"owner_user_id"}
] as const;

function reply(value:unknown,status=200) {
  return NextResponse.json(value,{status,headers:{
    "Cache-Control":"private, no-store",
    "X-Content-Type-Options":"nosniff",
    "Content-Security-Policy":"default-src 'none'"
  }});
}
export async function GET(request:NextRequest) {
  const raw=request.nextUrl.searchParams.get("limit")||"100";
  if(!/^\d{1,3}$/.test(raw)||Number(raw)<1||Number(raw)>100){
    return reply({error:"Export limit must be between 1 and 100 per collection."},400);
  }
  const limit=Number(raw);
  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return reply({error:"Authentication required."},401);
    try {
      const entries=await Promise.all([
        ...SOURCES.map(async source=>{
          const snapshot=await userCollection(user.uid,source.firestore).limit(limit+1).get();
          const items=snapshot.docs.slice(0,limit).map(serializeDocument);
          return [source.key,{items,truncated:snapshot.size>limit}] as const;
        }),
        (async()=>{
          const snapshot=await userCollection(user.uid,"agentRuns").limit(limit+1).get();
          return ["agentRuns",{items:snapshot.docs.slice(0,limit).map(serializeDocument),truncated:snapshot.size>limit}] as const;
        })()
      ]);
      return reply({
        kind:"USER_OWNED_DATA_SNAPSHOT",
        exportedAt:new Date().toISOString(),backend:"firebase",
        ownerId:user.uid,perCollectionLimit:limit,
        partial:Object.values(Object.fromEntries(entries)).some(x=>x.truncated),
        collections:Object.fromEntries(entries),
        caveat:"Only listed World Patro application collections are included. Large collections may be truncated; application logs, provider backups and Firebase Auth data are not exported."
      });
    }catch{
      return reply({error:"Data export unavailable. No partial dataset was returned."},503);
    }
  }
  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  try {
    const entries=await Promise.all([
      ...SOURCES.map(async source=>{
        const result=await auth.supabase!.from(source.supabase).select("*")
          .eq(source.owner,auth.userId!).limit(limit+1);
        if(result.error)throw new Error("Collection export failed");
        return [source.key,{items:(result.data||[]).slice(0,limit),truncated:(result.data||[]).length>limit}] as const;
      }),
      (async()=>{
        const result=await auth.supabase!.from("research_items").select("*")
          .eq("user_id",auth.userId!).limit(limit+1);
        if(result.error)throw new Error("Research item export failed");
        return ["researchItems",{items:(result.data||[]).slice(0,limit),truncated:(result.data||[]).length>limit}] as const;
      })()
    ]);
    return reply({
      kind:"USER_OWNED_DATA_SNAPSHOT",
      exportedAt:new Date().toISOString(),backend:"supabase",
      ownerId:auth.userId,perCollectionLimit:limit,
      partial:Object.values(Object.fromEntries(entries)).some(x=>x.truncated),
      collections:Object.fromEntries(entries),
      caveat:"Only listed World Patro app tables are included. This is bounded, not complete if partial=true; logs, auth provider account details and external backups are excluded."
    });
  }catch{
    return reply({error:"Data export unavailable. No partial dataset was returned."},503);
  }
}
