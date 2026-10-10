import {NextResponse} from "next/server";
import {z} from "zod";
import {useFirebaseBackend} from "@/lib/firebase/config";
import {getFirebaseUser} from "@/lib/firebase/user";
import {listUserDocs,serverNow,userCollection} from "@/lib/firebase/data";
import {requireUser} from "@/lib/auth";

export const dynamic="force-dynamic";
const Consultation=z.object({
  astrologerId:z.string().uuid().optional().nullable(),
  mode:z.enum(["chat","call","video","in_person"]),
  topic:z.string().trim().min(2).max(1000),
  scheduledAt:z.string().datetime().optional().nullable(),
  consentRecording:z.boolean().default(false)
}).strict();
const reply=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{"Cache-Control":"private, no-store"}});
function sameOrigin(request:Request){
  if(request.headers.get("sec-fetch-site")==="cross-site")return false;
  const origin=request.headers.get("origin");
  if(!origin)return true;
  try{return new URL(origin).origin===new URL(request.url).origin;}catch{return false;}
}
export async function GET(){
  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return reply({error:"Authentication required."},401);
    return reply({backend:"firebase",consultations:await listUserDocs(user.uid,"consultations",100)});
  }
  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  const {data,error}=await auth.supabase.from("consultations").select("*, astrologers(name,slug)")
    .eq("user_id",auth.userId).order("created_at",{ascending:false}).limit(100);
  if(error)return reply({error:"Consultation storage unavailable."},503);
  return reply({backend:"supabase",consultations:data||[]});
}
export async function POST(request:Request){
  if(!sameOrigin(request))return reply({error:"Cross-origin consultation request blocked."},403);
  if(!request.headers.get("content-type")?.startsWith("application/json"))return reply({error:"Use JSON."},415);
  const raw=await request.text();
  if(Buffer.byteLength(raw,"utf8")>8192)return reply({error:"Maximum request size 8KiB."},413);
  const input=Consultation.safeParse((()=>{try{return JSON.parse(raw);}catch{return null;}})());
  if(!input.success)return reply({error:"Invalid consultation request.",issues:input.error.issues},400);
  const v=input.data;
  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return reply({error:"Authentication required."},401);
    const value={
      astrologerId:v.astrologerId??null,mode:v.mode,topic:v.topic,
      scheduledAt:v.scheduledAt??null,consentRecording:v.consentRecording,
      status:"requested",paymentStatus:"not_applicable",requiresHumanConfirmation:true,
      createdAt:serverNow(),updatedAt:serverNow()
    };
    const ref=await userCollection(user.uid,"consultations").add(value);
    return reply({backend:"firebase",consultation:{id:ref.id,...value,createdAt:null,updatedAt:null},
      notice:"Request received in your account. Appointment and professional identity are not verified or confirmed."},201);
  }
  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  const {data,error}=await auth.supabase.from("consultations").insert({
    user_id:auth.userId,astrologer_id:v.astrologerId??null,mode:v.mode,topic:v.topic,
    scheduled_at:v.scheduledAt??null,consent_recording:v.consentRecording,status:"requested"
  }).select().single();
  if(error)return reply({error:"Could not submit consultation request."},503);
  return reply({backend:"supabase",consultation:data,
    notice:"Requested, not booked or paid."},201);
}
