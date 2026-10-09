import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createOwned, listOwned } from "@/lib/firebase/repository";

const ReportInput=z.object({
  kind:z.enum(["kundli","panchang","muhurat","compatibility","wbe","country","research"]),
  title:z.string().min(1).max(180),
  requestContext:z.record(z.string(),z.unknown()).default({}),
  result:z.record(z.string(),z.unknown()),
  calculationVersion:z.record(z.string(),z.unknown()).default({})
});

export async function GET(request:Request){
  const {auth,error}=await requireUser(); if(error||!auth)return error!;
  const kind=new URL(request.url).searchParams.get("kind");
  if(auth.provider==="firebase"){
    const all=await listOwned("savedReports",auth.userId,100);
    return NextResponse.json({reports:kind?all.filter((x:any)=>x.kind===kind):all});
  }
  let q=auth.supabase!.from("saved_reports").select("*").eq("user_id",auth.userId);
  if(kind)q=q.eq("kind",kind);
  const {data,error:dbError}=await q.order("created_at",{ascending:false}).limit(100);
  if(dbError)return NextResponse.json({error:dbError.message},{status:500});
  return NextResponse.json({reports:data});
}

export async function POST(request:Request){
  const {auth,error}=await requireUser(); if(error||!auth)return error!;
  const parsed=ReportInput.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid report",issues:parsed.error.issues},{status:400});
  const v=parsed.data;
  if(auth.provider==="firebase"){
    return NextResponse.json({report:await createOwned("savedReports",auth.userId,{
      kind:v.kind,title:v.title,requestContext:v.requestContext,result:v.result,calculationVersion:v.calculationVersion
    })},{status:201});
  }
  const {data,error:dbError}=await auth.supabase!.from("saved_reports").insert({
    user_id:auth.userId,kind:v.kind,title:v.title,request_context:v.requestContext,result:v.result,calculation_version:v.calculationVersion
  }).select().single();
  if(dbError)return NextResponse.json({error:dbError.message},{status:500});
  return NextResponse.json({report:data},{status:201});
}
