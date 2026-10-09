import { NextRequest, NextResponse } from "next/server";
import { publishedADFromBs,publishedBsFromAD } from "@/lib/nepal-bs-authority";

export const dynamic="force-dynamic";
function reply(value:unknown,status=200) {
  return NextResponse.json(value,{status,headers:{"Cache-Control":"public, s-maxage=300"}});
}
/** Requires either ?ad=2026-10-09 or ?bs=2083-06-23. No extrapolation. */
export function GET(request:NextRequest) {
  const ad=request.nextUrl.searchParams.get("ad");
  const bs=request.nextUrl.searchParams.get("bs");
  if(Boolean(ad)===Boolean(bs))return reply({error:"Supply exactly one of ad or bs."},400);
  try{
    if(ad){
      const value=publishedBsFromAD(ad);
      if(!value)return reply({
        status:"authority_required",ad,
        error:"Outside reviewed municipality-published BS source coverage. No conversion inferred."
      },404);
      return reply({status:"municipal_source",input:{ad},result:value});
    }
    const match=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(bs!);
    if(!match)return reply({error:"Use bs=YYYY-MM-DD."},400);
    const [year,month,day]=match.slice(1).map(Number);
    const value=publishedADFromBs(year,month,day);
    if(!value)return reply({
      status:"authority_required",bs,
      error:"Date invalid or outside reviewed municipality-published BS source coverage."
    },404);
    return reply({status:"municipal_source",input:{bs},result:value});
  }catch{return reply({error:"Invalid Gregorian date."},400);}
}
