import * as Astro from "astronomy-engine";
import { resolveBirthInstant } from "@/lib/jyotish/birth-chart";

const KM_PER_AU=149597870.7;
const MOON_RADIUS_KM=1737.4;
export const MOON_PHASES=[
  {id:"new",name:"New Moon",ne:"औँसी",degrees:0},
  {id:"waxing-crescent",name:"Waxing Crescent",ne:"बढ्दो चन्द्रकला",degrees:45},
  {id:"first-quarter",name:"First Quarter",ne:"प्रथम चौथाइ",degrees:90},
  {id:"waxing-gibbous",name:"Waxing Gibbous",ne:"बढ्दो चन्द्र",degrees:135},
  {id:"full",name:"Full Moon",ne:"पूर्णिमा",degrees:180},
  {id:"waning-gibbous",name:"Waning Gibbous",ne:"घट्दो चन्द्र",degrees:225},
  {id:"last-quarter",name:"Last Quarter",ne:"अन्तिम चौथाइ",degrees:270},
  {id:"waning-crescent",name:"Waning Crescent",ne:"घट्दो चन्द्रकला",degrees:315}
] as const;
export const MOON_RASHIS=[
  {name:"Mesha",ne:"मेष",english:"Aries"},
  {name:"Vrishabha",ne:"वृष",english:"Taurus"},
  {name:"Mithuna",ne:"मिथुन",english:"Gemini"},
  {name:"Karka",ne:"कर्कट",english:"Cancer"},
  {name:"Simha",ne:"सिंह",english:"Leo"},
  {name:"Kanya",ne:"कन्या",english:"Virgo"},
  {name:"Tula",ne:"तुला",english:"Libra"},
  {name:"Vrishchika",ne:"वृश्चिक",english:"Scorpio"},
  {name:"Dhanu",ne:"धनु",english:"Sagittarius"},
  {name:"Makara",ne:"मकर",english:"Capricorn"},
  {name:"Kumbha",ne:"कुम्भ",english:"Aquarius"},
  {name:"Meena",ne:"मीन",english:"Pisces"}
] as const;
export type PhaseId=typeof MOON_PHASES[number]["id"];
export function phaseIndex(degrees:number){
  if(!Number.isFinite(degrees))throw new Error("Moon phase angle must be finite.");
  return Math.floor((((degrees%360)+360)%360+22.5)/45)%8;
}
export function moonAngularDiameterArcmin(distanceKm:number){
  if(!Number.isFinite(distanceKm)||distanceKm<=MOON_RADIUS_KM)throw new Error("Invalid Moon distance.");
  return 2*Math.atan(MOON_RADIUS_KM/distanceKm)*180/Math.PI*60;
}
function dateOffset(date:string,delta:number){
  const d=new Date(date+"T12:00:00Z");
  d.setUTCDate(d.getUTCDate()+delta);
  return d.toISOString().slice(0,10);
}
function localEvent(date:Date,tz:string){
  const parts=Object.fromEntries(new Intl.DateTimeFormat("en-US",{
    timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(date).map(p=>[p.type,p.value]));
  return String(parts.year)+"-"+parts.month+"-"+parts.day;
}
const mainPhases=[
  {id:"new",target:0},{id:"first-quarter",target:90},
  {id:"full",target:180},{id:"last-quarter",target:270}
] as const;

/**
 * Astronomy for one selected civil date and local-noon instant. Events use
 * geocentric Sun/Moon longitude differences. Angles are not visual pixels.
 */
export function calculateMoonTimeline(input:{
  date:string;instant:Date;tz:string;
  siderealLongitude:number;moonrise:string|null;moonset:string|null;
}){
  const phaseDegrees=Astro.MoonPhase(input.instant);
  const illuminationFraction=Astro.Illumination(Astro.Body.Moon,input.instant).phase_fraction;
  const km=Astro.EclipticGeoMoon(input.instant).dist*KM_PER_AU;
  const size=moonAngularDiameterArcmin(km);
  const lunarSign=Math.floor((((input.siderealLongitude%360)+360)%360)/30)%12;
  const events=mainPhases.map(phase=>{
    const found=Astro.SearchMoonPhase(phase.target,input.instant,34);
    if(!found)return null;
    const meta=MOON_PHASES.find(p=>p.id===phase.id)!;
    return {id:phase.id,name:meta.name,ne:meta.ne,instantUTC:found.date.toISOString(),date:localEvent(found.date,input.tz)};
  }).filter((e):e is NonNullable<typeof e>=>Boolean(e)).sort((a,b)=>a.instantUTC.localeCompare(b.instantUTC));
  const days=Array.from({length:14},(_,i)=>{
    const date=dateOffset(input.date,i-3);
    const noon=resolveBirthInstant(date,"12:00:00",input.tz);
    const phase=Astro.MoonPhase(noon);
    return {
      date,
      phaseDegrees:Number(phase.toFixed(3)),
      illuminationPercent:Number((Astro.Illumination(Astro.Body.Moon,noon).phase_fraction*100).toFixed(1)),
      phaseId:MOON_PHASES[phaseIndex(phase)].id,
      selected:date===input.date
    };
  });
  return {
    reference:{date:input.date,instantUTC:input.instant.toISOString(),timezone:input.tz,precision:"local-noon geocentric snapshot"},
    phase:{degrees:Number(phaseDegrees.toFixed(4)),id:MOON_PHASES[phaseIndex(phaseDegrees)].id,
      name:MOON_PHASES[phaseIndex(phaseDegrees)].name,ne:MOON_PHASES[phaseIndex(phaseDegrees)].ne,
      illuminatedPercent:Number((illuminationFraction*100).toFixed(1)),
      waxing:phaseDegrees<180},
    size:{distanceKm:Math.round(km),angularDiameterArcmin:Number(size.toFixed(2)),physicalDiameterKm:MOON_RADIUS_KM*2,
      description:"Apparent angular diameter is computed from geocentric distance, not the size of the rendered vector."},
    rashi:{index:lunarSign,...MOON_RASHIS[lunarSign],system:"Approximate Lahiri sidereal longitude (30° equal signs), not the IAU constellation boundary."},
    moonrise:input.moonrise,
    moonset:input.moonset,
    events,
    days,
    method:"Astronomy Engine 2.1.19: MoonPhase, Illumination, EclipticGeoMoon and SearchMoonPhase. No publisher datasets or astrology predictions.",
    note:"Eight decorative phase icons are classified from phase longitude; the four milestone times use astronomical search. Waxing/right-lit orientation is a northern-hemisphere illustration, not a view-angle guarantee at every latitude. Dates and times are local to the selected timezone."
  };
}
