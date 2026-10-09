import { NextResponse } from "next/server";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { listUserDocs } from "@/lib/firebase/data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return NextResponse.json({ configured: true, backend: "firebase", notifications: await listUserDocs(user.uid, "notifications", 50) });
  }

  const supabase = await createClient();
  if(!supabase) return NextResponse.json({configured:false,notifications:[]},{status:200});
  const {data:claims}=await supabase.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(!userId) return NextResponse.json({error:"Authentication required"},{status:401});
  const {data,error}=await supabase.from("notifications").select("*").eq("user_id",userId).order("created_at",{ascending:false}).limit(50);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({configured:true,backend:"supabase",notifications:data});
}
