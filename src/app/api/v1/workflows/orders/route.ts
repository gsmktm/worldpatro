import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CreateOrder=z.object({
  title:z.string().min(3).max(160), description:z.string().max(4000).default(""),
  priority:z.enum(["low","normal","high","critical"]).default("normal"), dueAt:z.string().datetime().optional()
});

export async function GET() {
  const supabase=await createClient();
  if(!supabase) return NextResponse.json({configured:false,orders:[]});
  const {data:claims}=await supabase.auth.getClaims(); const userId=claims?.claims?.sub;
  if(!userId) return NextResponse.json({error:"Authentication required"},{status:401});
  const {data,error}=await supabase.from("workflow_orders").select("*").eq("owner_user_id",userId).order("created_at",{ascending:false}).limit(100);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({configured:true,orders:data});
}

export async function POST(request:Request) {
  const supabase=await createClient();
  if(!supabase) return NextResponse.json({error:"Supabase is not configured"},{status:503});
  const {data:claims}=await supabase.auth.getClaims(); const userId=claims?.claims?.sub;
  if(!userId) return NextResponse.json({error:"Authentication required"},{status:401});
  const parsed=CreateOrder.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Invalid order",issues:parsed.error.issues},{status:400});
  const {data,error}=await supabase.from("workflow_orders").insert({
    owner_user_id:userId,title:parsed.data.title,description:parsed.data.description,priority:parsed.data.priority,
    due_at:parsed.data.dueAt??null,status:"draft",requires_human_confirmation:true
  }).select().single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({order:data},{status:201});
}
