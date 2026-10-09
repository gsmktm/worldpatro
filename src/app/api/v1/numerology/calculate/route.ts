import { NextResponse } from "next/server";
import { z } from "zod";
import { businessNumerology, calculateNumerology, compareNumerology } from "@/lib/numerology";

export const dynamic="force-dynamic";
const Name=z.string().trim().min(1).max(120);
const DatePattern=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Input=z.discriminatedUnion("task",[
  z.object({task:z.literal("profile"),name:Name,birthDate:DatePattern,referenceDate:DatePattern,mode:z.enum(["pythagorean","chaldean"])}),
  z.object({task:z.literal("comparison"),name:Name,birthDate:DatePattern,partnerName:Name,partnerBirthDate:DatePattern,referenceDate:DatePattern,mode:z.enum(["pythagorean","chaldean"])}),
  z.object({task:z.literal("business"),name:Name,birthDate:DatePattern,businessName:Name,referenceDate:DatePattern,mode:z.enum(["pythagorean","chaldean"])})
]);
export async function POST(request:Request){
  if(request.headers.get("content-type")?.toLowerCase().startsWith("application/json")!==true){
    return NextResponse.json({error:"Use application/json."},{status:415});
  }
  const raw=await request.text();
  if(Buffer.byteLength(raw,"utf8")>4096)return NextResponse.json({error:"Payload exceeds 4 KiB."},{status:413});
  let body:unknown;
  try{body=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid JSON."},{status:400});}
  const parsed=Input.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Invalid numerology input.",issues:parsed.error.issues},{status:400});
  const v=parsed.data;
  try{
    const result=v.task==="profile"
      ?calculateNumerology(v.name,v.birthDate,v.mode,v.referenceDate)
      :v.task==="comparison"
        ?compareNumerology({name:v.name,birthDate:v.birthDate},{name:v.partnerName,birthDate:v.partnerBirthDate},v.mode,v.referenceDate)
        :businessNumerology(v.businessName,v.birthDate,v.mode,v.referenceDate);
    return NextResponse.json({task:v.task,result,truthLayer:"TRADITIONAL INTERPRETATION",generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Invalid input."},{status:400});
  }
}
