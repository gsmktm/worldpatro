import { firestoreDb, serializeDocument, serverNow } from "@/lib/firebase/data";
import type { AdminContext } from "./auth";
import type { AdminRecord, AdminKind, AdminState, CreateInput, UpdateInput } from "./contracts";
import {publishReady,transitionAllowed} from "./contracts";

const table="admin_content";
const auditTable="admin_audit_log";
function mapSupabase(r:Record<string,unknown>):AdminRecord{
  return {
    id:String(r.id),kind:r.kind as AdminKind,title:String(r.title),slug:String(r.slug),
    summary:String(r.summary||""),body:String(r.body||""),sourceUrl:String(r.source_url||""),
    country:String(r.country||""),tradition:String(r.tradition||""),eventDate:String(r.event_date||""),
    status:r.status as AdminState,version:Number(r.version||1),
    createdBy:String(r.created_by||""),updatedBy:String(r.updated_by||""),
    createdAt:typeof r.created_at==="string"?r.created_at:null,
    updatedAt:typeof r.updated_at==="string"?r.updated_at:null
  };
}
function mapFirebase(value:Record<string,unknown>):AdminRecord{
  const v=value;
  return {id:String(v.id),kind:v.kind as AdminKind,title:String(v.title),slug:String(v.slug),
    summary:String(v.summary||""),body:String(v.body||""),sourceUrl:String(v.sourceUrl||""),
    country:String(v.country||""),tradition:String(v.tradition||""),eventDate:String(v.eventDate||""),
    status:v.status as AdminState,version:Number(v.version||1),
    createdBy:String(v.createdBy||""),updatedBy:String(v.updatedBy||""),
    createdAt:typeof v.createdAt==="string"?v.createdAt:null,
    updatedAt:typeof v.updatedAt==="string"?v.updatedAt:null};
}
const toDb=(v:Record<string,unknown>)=>({
  title:v.title,slug:v.slug,summary:v.summary,body:v.body,
  source_url:v.sourceUrl,country:v.country,tradition:v.tradition,event_date:v.eventDate,
  status:v.status,version:v.version,updated_by:v.updatedBy
});

export async function listAdminRecords(ctx:AdminContext,kind?:AdminKind,publicOnly=false):Promise<AdminRecord[]> {
  if(ctx.backend==="firebase"){
    let query=firestoreDb().collection("adminContent") as FirebaseFirestore.Query;
    if(kind)query=query.where("kind","==",kind);
    if(publicOnly)query=query.where("status","==","published");
    const snapshot=await query.limit(100).get();
    return snapshot.docs.map(serializeDocument).map(mapFirebase)
      .sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
  }
  let query=ctx.supabase!.from(table).select("*").order("updated_at",{ascending:false}).limit(100);
  if(kind)query=query.eq("kind",kind);
  if(publicOnly)query=query.eq("status","published");
  const {data,error}=await query;
  if(error)throw new Error("Admin content database is not installed or unavailable.");
  return (data||[]).map(v=>mapSupabase(v as Record<string,unknown>));
}
export async function listPublishedRecords(kind:AdminKind):Promise<AdminRecord[]> {
  if(process.env.WORLD_PATRO_DATA_BACKEND==="firebase"){
    const {useFirebaseBackend}=await import("@/lib/firebase/config");
    if(!useFirebaseBackend())return [];
    const snap=await firestoreDb().collection("adminContent")
      .where("kind","==",kind).where("status","==","published").limit(100).get();
    return snap.docs.map(serializeDocument).map(mapFirebase);
  }
  const {createClient}=await import("@/lib/supabase/server");
  const supabase=await createClient();
  if(!supabase)return [];
  const {data,error}=await supabase.from(table).select("*").eq("kind",kind)
    .eq("status","published").order("updated_at",{ascending:false}).limit(100);
  if(error)throw new Error("Public content unavailable.");
  return (data||[]).map(v=>mapSupabase(v as Record<string,unknown>));
}
export async function createAdminRecord(ctx:AdminContext,data:CreateInput):Promise<AdminRecord>{
  const id=data.kind+"__"+data.slug;
  const now=new Date().toISOString();
  const row={id,...data,status:"draft" as AdminState,version:1,
    createdBy:ctx.userId,updatedBy:ctx.userId,createdAt:now,updatedAt:now};
  if(ctx.backend==="firebase"){
    const db=firestoreDb(),batch=db.batch();
    batch.create(db.collection("adminContent").doc(id),row);
    batch.create(db.collection("adminAudit").doc(),{
      recordId:id,action:"create",kind:data.kind,actorId:ctx.userId,
      at:serverNow(),oldStatus:null,newStatus:"draft",version:1
    });
    await batch.commit();
    return row;
  }
  const insert={id,kind:data.kind, ...toDb(row),created_by:ctx.userId};
  const {data:record,error}=await ctx.supabase!.from(table).insert(insert).select("*").single();
  if(error)throw new Error(error.code==="23505"?"A record with this kind and slug already exists.":"Unable to create record in admin database.");
  return mapSupabase(record as Record<string,unknown>);
}

export class VersionConflict extends Error {}
export class MissingRecord extends Error {}
export class InvalidTransition extends Error {}
export async function updateAdminRecord(ctx:AdminContext,id:string,patch:UpdateInput):Promise<AdminRecord>{
  const {expectedVersion,...changes}=patch;
  if(ctx.backend==="firebase"){
    const db=firestoreDb(),ref=db.collection("adminContent").doc(id);
    return await db.runTransaction(async tx=>{
      const snapshot=await tx.get(ref);
      if(!snapshot.exists)throw new MissingRecord("Record not found.");
      const current=mapFirebase(serializeDocument(snapshot));
      if(current.version!==expectedVersion)throw new VersionConflict("Record changed; reload before editing.");
      if(changes.slug!==undefined&&changes.slug!==current.slug)throw new InvalidTransition("Slugs are immutable.");
      const next={...current,...changes,version:current.version+1,updatedBy:ctx.userId,updatedAt:new Date().toISOString()};
      if(!transitionAllowed(current.status,next.status))throw new InvalidTransition("Invalid publishing transition.");
      if(next.status==="published"&&!publishReady(next))throw new InvalidTransition("Publishing requires title, summary, body and HTTPS source.");
      tx.update(ref,{...changes,version:next.version,updatedBy:ctx.userId,updatedAt:next.updatedAt});
      tx.create(db.collection("adminAudit").doc(),{
        recordId:id,kind:current.kind,action:"update",actorId:ctx.userId,
        oldStatus:current.status,newStatus:next.status,version:next.version,
        at:serverNow(),changedFields:Object.keys(changes)
      });
      return next;
    });
  }
  const {data:old,error:readError}=await ctx.supabase!.from(table).select("*").eq("id",id).maybeSingle();
  if(readError)throw new Error("Could not load record.");
  if(!old)throw new MissingRecord("Record not found.");
  const current=mapSupabase(old as Record<string,unknown>);
  if(current.version!==expectedVersion)throw new VersionConflict("Record changed; reload before editing.");
  if(changes.slug!==undefined&&changes.slug!==current.slug)throw new InvalidTransition("Slugs are immutable.");
  const next={...current,...changes};
  if(!transitionAllowed(current.status,next.status))throw new InvalidTransition("Invalid publishing transition.");
  if(next.status==="published"&&!publishReady(next))throw new InvalidTransition("Publishing requires title, summary, body and HTTPS source.");
  const update={...toDb(changes),version:expectedVersion+1,updated_by:ctx.userId,updated_at:new Date().toISOString()};
  const {data,error}=await ctx.supabase!.from(table).update(update)
    .eq("id",id).eq("version",expectedVersion).select("*").maybeSingle();
  if(error)throw new Error("Unable to update admin record.");
  if(!data)throw new VersionConflict("Record changed; reload before editing.");
  return mapSupabase(data as Record<string,unknown>);
}
export async function listAdminAudit(ctx:AdminContext){
  if(ctx.backend==="firebase"){
    const snap=await firestoreDb().collection("adminAudit").orderBy("at","desc").limit(50).get();
    return snap.docs.map(serializeDocument);
  }
  const {data,error}=await ctx.supabase!.from(auditTable).select("id,record_id,kind,action,actor_id,old_status,new_status,version,created_at")
    .order("created_at",{ascending:false}).limit(50);
  if(error)throw new Error("Audit log unavailable.");
  return data||[];
}
