import {NextResponse} from "next/server";
import {z} from "zod";
import {useFirebaseBackend} from "@/lib/firebase/config";
import {getFirebaseUser} from "@/lib/firebase/user";
import {serializeDocument,serverNow,userCollection} from "@/lib/firebase/data";
import {requireUser} from "@/lib/auth";

export const dynamic="force-dynamic";
const Item=z.object({
  notebookId:z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/),
  kind:z.string().trim().min(1).max(80),
  refId:z.string().max(240).optional().nullable(),
  note:z.string().max(8000).optional().nullable(),
  payload:z.record(z.string(),z.unknown()).default({})
}).strict();
const reply=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{"Cache-Control":"private, no-store"}});
function sameOrigin(request:Request){
  if(request.headers.get("sec-fetch-site")==="cross-site")return false;
  const origin=request.headers.get("origin");
  if(!origin)return true;
  try{return new URL(origin).origin===new URL(request.url).origin;}catch{return false;}
}
export async function GET(request:Request){
  const notebookId=new URL(request.url).searchParams.get("notebookId");
  if(!notebookId||!/^[A-Za-z0-9_-]{1,128}$/.test(notebookId))
    return reply({error:"Valid notebookId is required."},400);
  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return reply({error:"Authentication required."},401);
    const parent=await userCollection(user.uid,"researchNotebooks").doc(notebookId).get();
    if(!parent.exists)return reply({error:"Notebook not found for this account."},404);
    const snap=await userCollection(user.uid,"researchItems").where("notebookId","==",notebookId).limit(100).get();
    return reply({backend:"firebase",items:snap.docs.map(serializeDocument)});
  }
  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  const {data,error}=await auth.supabase.from("research_items").select("*")
    .eq("notebook_id",notebookId).eq("user_id",auth.userId)
    .order("created_at",{ascending:false}).limit(100);
  if(error)return reply({error:"Research item storage unavailable."},503);
  return reply({backend:"supabase",items:data||[]});
}
export async function POST(request:Request){
  if(!sameOrigin(request))return reply({error:"Cross-origin mutation forbidden."},403);
  if(!request.headers.get("content-type")?.startsWith("application/json"))return reply({error:"Use JSON."},415);
  const content=await request.text();
  if(Buffer.byteLength(content,"utf8")>16384)return reply({error:"Maximum 16KiB body."},413);
  const parsed=Item.safeParse((()=>{try{return JSON.parse(content);}catch{return null;}})());
  if(!parsed.success)return reply({error:"Invalid research item.",issues:parsed.error.issues},400);
  const v=parsed.data;
  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return reply({error:"Authentication required."},401);
    const parent=await userCollection(user.uid,"researchNotebooks").doc(v.notebookId).get();
    if(!parent.exists)return reply({error:"Notebook not found for this account."},404);
    const ref=await userCollection(user.uid,"researchItems").add({...v,createdAt:serverNow()});
    return reply({backend:"firebase",item:{id:ref.id,...v}},201);
  }
  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  const {data,error}=await auth.supabase.from("research_items").insert({
    notebook_id:v.notebookId,user_id:auth.userId,kind:v.kind,
    ref_id:v.refId??null,note:v.note??null,payload:v.payload
  }).select().single();
  if(error)return reply({error:"Could not add note to your notebook."},503);
  return reply({backend:"supabase",item:data},201);
}
