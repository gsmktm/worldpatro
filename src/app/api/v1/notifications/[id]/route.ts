import {NextResponse} from "next/server";
import {z} from "zod";
import {readMutationJson} from "@/lib/http/write-guard";
import {useFirebaseBackend} from "@/lib/firebase/config";
import {getFirebaseUser} from "@/lib/firebase/user";
import {serializeDocument,userCollection} from "@/lib/firebase/data";
import {requireUser} from "@/lib/auth";

const Patch=z.object({read:z.boolean().optional(),acknowledged:z.boolean().optional()}).strict()
  .refine(p=>Object.keys(p).length>0,"Supply at least one change.");
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const body=await readMutationJson(request,4096);
  if(!body.ok)return body.response;
  const {id}=await params;
  if(!/^[A-Za-z0-9_-]{5,128}$/.test(id))return NextResponse.json({error:"Invalid notification ID."},{status:400});
  const input=Patch.safeParse(body.data);
  if(!input.success)return NextResponse.json({error:"Invalid notification update."},{status:400});
  if(useFirebaseBackend()){
    const user=await getFirebaseUser();
    if(!user)return NextResponse.json({error:"Authentication required."},{status:401});
    const ref=userCollection(user.uid,"notifications").doc(id),doc=await ref.get();
    if(!doc.exists)return NextResponse.json({error:"Notification not found."},{status:404});
    const now=new Date().toISOString();
    const changes:Record<string,string|null>={};
    if(input.data.read!==undefined)changes.readAt=input.data.read?now:null;
    if(input.data.acknowledged!==undefined)changes.acknowledgedAt=input.data.acknowledged?now:null;
    await ref.update(changes);
    const updated=await ref.get();
    return NextResponse.json({backend:"firebase",notification:serializeDocument(updated)},{headers:{"Cache-Control":"no-store"}});
  }
  const auth=await requireUser();
  if(auth.error||!auth.supabase||!auth.userId)return auth.error!;
  const changes:Record<string,string|null>={};
  if(input.data.read!==undefined)changes.read_at=input.data.read?new Date().toISOString():null;
  if(input.data.acknowledged!==undefined)changes.acknowledged_at=input.data.acknowledged?new Date().toISOString():null;
  const {data,error}=await auth.supabase.from("notifications").update(changes)
    .eq("id",id).eq("user_id",auth.userId).select().maybeSingle();
  if(error)return NextResponse.json({error:"Notification update unavailable."},{status:503});
  if(!data)return NextResponse.json({error:"Notification not found."},{status:404});
  return NextResponse.json({backend:"supabase",notification:data},{headers:{"Cache-Control":"no-store"}});
}
