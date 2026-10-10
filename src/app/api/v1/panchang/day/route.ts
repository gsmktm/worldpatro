import {NextRequest,NextResponse} from "next/server";
import {buildPatroDay,PatroValidationError,readPatroQuery} from "@/lib/patro-day";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export function GET(request:NextRequest){
  try{
    const data=buildPatroDay(readPatroQuery(request.nextUrl));
    return NextResponse.json({date:data.canonical.date,...data.panchang},{
      headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}
    });
  }catch(error){
    if(error instanceof PatroValidationError)
      return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({error:"Panchang astronomy unavailable."},{status:503});
  }
}
