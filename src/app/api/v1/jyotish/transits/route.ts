import {NextRequest,NextResponse} from "next/server";
import {makeBirthChart} from "@/lib/jyotish/birth-chart";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function kathmanduToday(){
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return p.year+"-"+p.month+"-"+p.day;
}
export function GET(request:NextRequest){
  const params=request.nextUrl.searchParams;
  if([...params.keys()].some(key=>key!=="date")||params.getAll("date").length>1)
    return NextResponse.json({error:"Only one date parameter is supported."},{status:400});
  const date=params.get("date")||kathmanduToday();
  const valid=/^(19|20)\d{2}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) &&
    new Date(date+"T00:00:00Z").toISOString().slice(0,10)===date;
  if(!valid)return NextResponse.json({error:"Use a real date between 1900 and 2099."},{status:400});
  try{
    const chart=makeBirthChart({date,time:"12:00",timezone:"Asia/Kathmandu",latitude:27.7172,longitude:85.324,houseSystem:"whole_sign"});
    return NextResponse.json({
      date,sampledLocalTime:"12:00",timezone:"Asia/Kathmandu",instant:chart.canonical.utc,
      positions:chart.planets.map(p=>({key:p.key,name:p.name,sign:p.signName,degree:p.degreesInSign,
        nakshatra:p.nakshatra.name,pada:p.nakshatra.pada,retrograde:p.retrograde,
        isMeanLunarNode:p.isMeanLunarNode})),
      method:chart.calculation.ayanamsa+"; "+chart.calculation.library,
      caveat:"Geocentric sidereal sky snapshot at 12:00 Nepal time, not a natal chart, event forecast, or exact sign-ingress timestamp. Mean lunar nodes are mathematical points."
    },{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600","X-Content-Type-Options":"nosniff"}});
  }catch{return NextResponse.json({error:"Transit snapshot unavailable."},{status:422});}
}
