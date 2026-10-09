import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase=await createClient();
  if(!supabase) return NextResponse.json({configured:false,notifications:[]},{status:200});
  const {data:claims}=await supabase.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(!userId) return NextResponse.json({error:"Authentication required"},{status:401});
  const {data,error}=await supabase.from("notifications").select("*").eq("user_id",userId).order("created_at",{ascending:false}).limit(50);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({configured:true,notifications:data});
}
