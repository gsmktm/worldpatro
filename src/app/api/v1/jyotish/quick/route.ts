import {NextResponse} from "next/server";
import {z} from "zod";
import {makeBirthChart} from "@/lib/jyotish/birth-chart";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const Input=z.object({
  calculator:z.enum(["moon","lagna","nakshatra","navamsa","grahas","dasha"]),
  date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  timezone:z.string().min(1).max(100),
  latitude:z.number().finite().min(-66).max(66),
  longitude:z.number().finite().min(-180).max(180)
}).strict();
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const respond=(value:unknown,status=200)=>NextResponse.json(value,{status,headers});
export async function POST(request:Request){
  if(!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))
    return respond({error:"Expected application/json."},415);
  if(Number(request.headers.get("content-length")||0)>4096)return respond({error:"Payload too large."},413);
  const raw=await request.text();
  if(Buffer.byteLength(raw,"utf8")>4096)return respond({error:"Payload too large."},413);
  let parsed:unknown;
  try{parsed=JSON.parse(raw);}catch{return respond({error:"Malformed JSON."},400);}
  const validation=Input.safeParse(parsed);
  if(!validation.success)return respond({error:"Invalid date, location, timezone or calculator.",issues:validation.error.issues},400);
  const {calculator,...birth}=validation.data;
  try{
    const chart=makeBirthChart({...birth,houseSystem:"whole_sign"});
    const moon=chart.planets.find(p=>p.key==="moon");
    if(!moon)throw new Error("Moon calculation unavailable.");
    const d9=chart.divisional.find(v=>v.id==="D9");
    const results={
      moon:{rashi:moon.signName,degree:moon.degreesInSign,nakshatra:moon.nakshatra,house:moon.house},
      lagna:{rashi:chart.ascendant.signName,degree:chart.ascendant.degreesInSign,nakshatra:chart.ascendant.nakshatra},
      nakshatra:{rashi:moon.signName,...moon.nakshatra},
      navamsa:d9||null,
      grahas:chart.planets.map(p=>({name:p.name,sign:p.signName,degree:p.degreesInSign,house:p.house,nakshatra:p.nakshatra.name,retrograde:p.retrograde})),
      dasha:{birthBalance:chart.dasha.birthBalance,periods:chart.dasha.periods}
    };
    return respond({calculator,output:results[calculator],canonical:chart.canonical,
      method:chart.calculation,stored:false,
      note:"Calculated using an approximate Lahiri sidereal method and supplied birth time. Sensitive sign boundaries require independent verification. Traditional astrological interpretation is not scientific prediction."});
  }catch(e){return respond({error:e instanceof Error?e.message:"Calculation unavailable."},422);}
}
