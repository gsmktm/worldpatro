import {NextRequest,NextResponse} from "next/server";
import {ADMIN_KINDS,type AdminKind} from "@/lib/admin/contracts";
import {listPublishedRecords} from "@/lib/admin/storage";
export const dynamic="force-dynamic";

export async function GET(request:NextRequest){
  const kind=request.nextUrl.searchParams.get("kind")||"article";
  if(!ADMIN_KINDS.includes(kind as AdminKind))return NextResponse.json({error:"Unknown content kind."},{status:400});
  try{
    const records=await listPublishedRecords(kind as AdminKind);
    return NextResponse.json({
      kind,total:records.length,records:records.map(r=>({
        id:r.id,title:r.title,slug:r.slug,kind:r.kind,
        summary:r.summary,body:r.body,sourceUrl:r.sourceUrl,
        country:r.country,tradition:r.tradition,eventDate:r.eventDate,
        updatedAt:r.updatedAt,status:"published"
      }))
    },{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=900"}});
  }catch{return NextResponse.json({error:"Published content service unavailable."},{status:503});}
}
