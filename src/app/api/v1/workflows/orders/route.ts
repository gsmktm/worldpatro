import { NextResponse } from "next/server";
import { readMutationJson } from "@/lib/http/write-guard";
import { z } from "zod";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { listUserDocs, serverNow, userCollection } from "@/lib/firebase/data";
import { createClient } from "@/lib/supabase/server";

const CreateOrder=z.object({
  title:z.string().min(3).max(160), description:z.string().max(4000).default(""),
  priority:z.enum(["low","normal","high","critical"]).default("normal"), dueAt:z.string().datetime().optional()
});

export async function GET() {
  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return NextResponse.json({ configured: true, backend: "firebase", orders: await listUserDocs(user.uid, "workflowOrders") });
  }

  const supabase=await createClient();
  if(!supabase) return NextResponse.json({error:"Account storage is not configured.",configured:false},{status:503});
  const {data:claims}=await supabase.auth.getClaims(); const userId=claims?.claims?.sub;
  if(!userId) return NextResponse.json({error:"Authentication required"},{status:401});
  const {data,error}=await supabase.from("workflow_orders").select("*").eq("owner_user_id",userId).order("created_at",{ascending:false}).limit(100);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({configured:true,backend:"supabase",orders:data});
}

export async function POST(request:Request) {
  const body = await readMutationJson(request, 8192);
  if (!body.ok) return body.response;
  const parsed=CreateOrder.safeParse(body.data);
  if(!parsed.success) return NextResponse.json({error:"Invalid order",issues:parsed.error.issues},{status:400});

  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const order = {
      title: parsed.data.title, description: parsed.data.description, priority: parsed.data.priority,
      dueAt: parsed.data.dueAt ?? null, status: "draft", requiresHumanConfirmation: true,
      createdAt: serverNow(), updatedAt: serverNow()
    };
    const ref = userCollection(user.uid, "workflowOrders").doc();
    const notificationRef = userCollection(user.uid, "notifications").doc();
    const batch = ref.firestore.batch();
    batch.set(ref, order);
    batch.set(notificationRef, {
      topic:"workflow",severity:["high","critical"].includes(parsed.data.priority)?"important":"notice",
      title:"Workflow created",body:parsed.data.title,orderId:ref.id,createdAt:serverNow()
    });
    await batch.commit();
    return NextResponse.json({ backend:"firebase", order:{id:ref.id,...order,createdAt:null,updatedAt:null}},{status:201});
  }

  const supabase=await createClient();
  if(!supabase) return NextResponse.json({error:"Supabase is not configured"},{status:503});
  const {data:claims}=await supabase.auth.getClaims(); const userId=claims?.claims?.sub;
  if(!userId) return NextResponse.json({error:"Authentication required"},{status:401});
  const {data,error}=await supabase.from("workflow_orders").insert({
    owner_user_id:userId,title:parsed.data.title,description:parsed.data.description,priority:parsed.data.priority,
    due_at:parsed.data.dueAt??null,status:"draft",requires_human_confirmation:true
  }).select().single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({backend:"supabase",order:data},{status:201});
}
