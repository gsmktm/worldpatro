import { ANCHORS, GATES, GRAHAS, POWERS, TRADITIONS, type WbeGate } from "@/lib/wbe";

/**
 * World Patro heritage reference point: UNESCO Kathmandu Valley monument zone,
 * Hanuman Dhoka Durbar Square (N 27°42′14″, E 85°18′30″).
 * "WENS 0°" is a symbolic design coordinate, never a geodetic longitude,
 * astronomical zodiac zero, time-zone offset or legal meridian.
 */
export const WENS_ORIGIN = {
  id: "hanuman-dhoka",
  label: "Hanuman Dhoka Durbar Square",
  labelNe: "हनुमानढोका दरबार क्षेत्र",
  locality: "Kathmandu, Nepal",
  latitude: 27 + 42 / 60 + 14 / 3600,
  longitude: 85 + 18 / 60 + 30 / 3600,
  elevationMeters: 1312,
  elevationStatus: "approximate; not an official survey benchmark",
  timezone: "Asia/Kathmandu",
  symbolicAxisDegrees: 0,
  geographicReference: "https://whc.unesco.org/en/list/121/maps/",
  heritageReference: "https://whc.unesco.org/en/list/121",
  warning: "WENS 0° is a symbolic heritage origin. UTC, Greenwich longitude, IANA time zones and standard astronomical coordinate frames remain unchanged."
} as const;

export const WENS_LAYERS = [
  { id: "time", title: "One time · nine calendars", category: "CALCULATED", summary: "Common civil date with separately labeled calendar methods." },
  { id: "astronomy", title: "Navagraha sky", category: "CALCULATED", summary: "Sidereal longitude with named ephemeris and mean lunar nodes." },
  { id: "heritage", title: "Sacred traditions", category: "SOURCE-DEPENDENT", summary: "Community practices, festivals and authorities remain distinct." },
  { id: "balance", title: "WBGR-109 gates", category: "SYMBOLIC", summary: "Reflection lenses, never causal world measurements." }
] as const;

export const WENS_TRADITIONS = TRADITIONS.map((name,index)=>({
  id: "tradition-" + String(index+1).padStart(2,"0"),
  name,
  position: index+1,
  note: "Dates and observances are verified per tradition, community, locality and publishing authority. Planetary associations here are optional symbolic comparisons, not this tradition's doctrine."
}));

export const WENS_GRAHAS = GRAHAS.map(([name,domain],index)=>({
  index:index+1,
  name,
  domain,
  physicalStatus:index>=7?"calculated mean lunar node, not a physical planet":"astronomical Sun/Moon/planet",
}));

export const WENS_POWERS = POWERS.map((name,index)=>({
  index:index+1,
  name,
  type:"comparative human-value theme, not a measurement of supernatural power"
}));

/** 9 existing keynote gates + 100 deterministic, distinct cross-tradition gates.
 * Stride 73 is coprime to 729, so the curated path is reproducible without
 * attributing external significance to the numeric selection.
 */
function makeRegistry(): WbeGate[] {
  const collection: WbeGate[] = [...ANCHORS];
  const seen = new Set(collection.map(g=>g.code));
  for(let i=0;collection.length<109&&i<GATES.length;i++){
    const gate=GATES[(19+73*i)%GATES.length];
    if(!seen.has(gate.code)){
      seen.add(gate.code);
      collection.push(gate);
    }
  }
  return collection;
}
export const WBGR109 = makeRegistry();

export function datedRegistryGate(date: string): WbeGate {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error("Invalid ISO date.");
  const [year,month,day]=date.split("-").map(Number);
  const utc=Date.UTC(year,month-1,day);
  if(!Number.isFinite(utc)||new Date(utc).toISOString().slice(0,10)!==date)throw new Error("Invalid Gregorian date.");
  const index=((Math.floor(utc/86400000)%WBGR109.length)+WBGR109.length)%WBGR109.length;
  return WBGR109[index];
}

export function selectWensGate(traditionIndex:number,grahaIndex:number,powerIndex:number):WbeGate {
  if([traditionIndex,grahaIndex,powerIndex].some(x=>!Number.isInteger(x)||x<0||x>8))
    throw new Error("WENS dimensions must be integer indices 0–8.");
  return GATES[traditionIndex*81+grahaIndex*9+powerIndex];
}

export const WENS_DISCLOSURE = {
  astronomy:"Calculated sidereal positions are approximations using the astronomy-engine ephemeris. Rahu and Ketu are opposite mean lunar nodes, not physical planets.",
  religious:"Nine traditions are an editorial selection, not an exhaustive ranking of religions. Their rituals, dates and doctrines are not controlled or derived from Navagraha.",
  symbolic:"Nine powers, the G center, WENS 0°, WBGR-109 and all gate combinations are user-defined symbolic architecture. Scores and gates cannot measure political, spiritual or planetary dominance.",
  geographic:"The Hanuman Dhoka reference uses the UNESCO monument-zone coordinates. Its displayed elevation is approximate, and its symbolic axis never modifies Greenwich longitude or UTC.",
  authority:"Religious festival dates require jurisdiction-specific documented sources. Missing evidence remains unknown."
} as const;
