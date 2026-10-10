import {NextResponse} from "next/server";
import {z} from "zod";
import {useFirebaseBackend} from "@/lib/firebase/config";
import {getFirebaseUser} from "@/lib/firebase/user";
import {serializeDocument,userCollection} from "@/lib/firebase/data";
import {requireUser} from "@/lib/auth";

const Patch=z.object({read:z.boolean().optional(),acknowledged:z.boolean().optional()}).strict()
  .refine(p=>Object.keys(p).length>0,"Supply at least one change.");
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(request.headers.get("sec-fetch-site")==="cross-site")return NextResponse.json({error:"Cross-origin update denied."},{status:403});
  const origin=request.headers.get("origin");
  if(origin){try{
    if(new URL(origin).origin!==new URL(request.url).origin)return NextResponse.json({error:"Cross-origin update denied."},{status:403});
  }catch{return NextResponse.json({error:"Invalid Origin."},{status:403});}}
  const {id}=await params;
  if(!/^[A-Za-z0-9_-]{5,128}$/.test(id))return NextResponse.json({error:"Invalid notification ID."},{status:400});
  if(!request.headers.get("content-type")?.startsWith("application/json"))return NextResponse.json({error:"Use JSON."},{status:415});
  const input=Patch.safeParse(await request.json().catch(()=>null));
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
