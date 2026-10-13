import {NextRequest,NextResponse} from "next/server";
import {PUBLIC_PEOPLE,getPublicPerson} from "@/lib/jyotish/public-people";

export function GET(request:NextRequest) {
  const query=request.nextUrl.searchParams;
  if(query.toString().length>300)return NextResponse.json({error:"Query is too long."},{status:400});
  const slug=query.get("slug");
  if(slug!==null){
    if(!/^[a-z0-9-]{1,70}$/.test(slug))return NextResponse.json({error:"Invalid slug."},{status:400});
    const person=getPublicPerson(slug);
    return person?NextResponse.json({person,disclosure:"Birth chart and Moon-sign claims are withheld when accurate birth time and coordinates are not established."}):
      NextResponse.json({error:"Profile not found."},{status:404});
  }
  const search=(query.get("search")||"").trim().toLocaleLowerCase();
  const category=query.get("category")||"all";
  const categories=["all","Nepal","Leadership","Spirituality","Science","Royal history"];
  if(search.length>80||!categories.includes(category))return NextResponse.json({error:"Invalid search or category."},{status:400});
  const pageRaw=query.get("page")||"1";
  if(!/^[1-9]\d{0,3}$/.test(pageRaw))return NextResponse.json({error:"Invalid page."},{status:400});
  const page=Number(pageRaw),pageSize=6;
  const rows=PUBLIC_PEOPLE.filter(person=>(category==="all"||person.category===category)&&
    [person.name,person.nameNe||"",person.occupation,person.birthplace].some(value=>value.toLocaleLowerCase().includes(search)));
  const response=NextResponse.json({
    records:rows.slice((page-1)*pageSize,page*pageSize),total:rows.length,page,pageSize,
    categories,sourcePolicy:"Public biography links; original editorial summaries; unknown birth times are not guessed.",
    disclosure:"Traditionally interpreted astrology is not a scientifically validated prediction. No chart is inferred from date-only records."
  });
  response.headers.set("Cache-Control","public, s-maxage=3600, stale-while-revalidate=86400");
  return response;
}
