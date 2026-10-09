import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const builtIn = [
  {slug:"world-bank",name:"World Bank Open Data",tier:"A",kind:"official_api",url:"https://api.worldbank.org/",status:"active"},
  {slug:"iana-tzdb",name:"IANA Time Zone Database",tier:"A",kind:"official_dataset",url:"https://www.iana.org/time-zones",status:"active"},
  {slug:"astronomy-engine",name:"Astronomy Engine",tier:"B",kind:"calculation_library",url:"https://github.com/cosinekitty/astronomy",status:"active"}
];

export async function GET() {
  const supabase=await createClient();
  if(!supabase) return NextResponse.json({configured:false,sources:builtIn});
  const {data,error}=await supabase.from("source_registry").select("slug,name,tier,kind,url,status,last_verified_at").eq("status","active").order("tier");
  if(error) return NextResponse.json({configured:true,error:error.message,sources:builtIn},{status:200});
  return NextResponse.json({configured:true,sources:data});
}
