// World Patro — archive-informed Kundli calculation.
// Algorithms adapted from the user's Arko Jyotish TAR. Not a medical/scientific prediction.
import * as Astro from "astronomy-engine";
import { divisionalSign, DIVISIONAL_CHARTS } from "./divisional";
import { vimshottari, type DashaPeriod } from "./vimshottari";

const RASHI = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
const NAKSHATRA = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"] as const;
const NAK_LORD = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"] as const;
const BODY_ORDER = ["sun","moon","mars","mercury","jupiter","venus","saturn","rahu","ketu"] as const;
type PlanetKey = typeof BODY_ORDER[number];
export type HouseStyle = "whole_sign" | "equal";
export type BirthChartInput = {
  name?: string;
  date: string;
  time: string;
  timezone: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  houseSystem?: HouseStyle;
};

const norm = (n: number) => ((n % 360) + 360) % 360;
const jd = (date: Date) => date.getTime() / 86400000 + 2440587.5;
function ayanamsa(date: Date) {
  const T = (jd(date) - 2451545.0) / 36525;
  return 23.8531972 + (5028.796195 * T + 1.1054348 * T*T + 0.00007964 * T*T*T - 0.000023857 * T*T*T*T) / 3600;
}
function getCivilParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, hourCycle:"h23", year:"numeric", month:"2-digit",
    day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit"
  }).formatToParts(date);
  const entry = Object.fromEntries(parts.filter(p => p.type !== "literal").map(p => [p.type,Number(p.value)]));
  return {year:entry.year,month:entry.month,day:entry.day,hour:entry.hour,minute:entry.minute,second:entry.second};
}

/** Resolve an IANA local birth instant; reject DST gaps and ambiguous repeated hours. */
export function resolveBirthInstant(date: string, time: string, timezone: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    throw new Error("Use YYYY-MM-DD and HH:MM (or HH:MM:SS).");
  }
  const [year,month,day] = date.split("-").map(Number);
  const [hour,minute,second=0] = time.split(":").map(Number);
  if(year<1900 || year>2100 || hour>23 || minute>59 || second>59) {
    throw new Error("Use a birth date in 1900–2100 and a valid 24-hour time.");
  }
  const naive = Date.UTC(year,month-1,day,hour,minute,second);
  if (new Date(naive).toISOString().slice(0,10)!==date) throw new Error("Invalid Gregorian birth date.");
  try { new Intl.DateTimeFormat("en-US",{timeZone:timezone}); }
  catch { throw new Error("Invalid IANA timezone. Example: Asia/Kathmandu."); }

  const candidates = new Set<number>();
  // Sample timezone rules around the local date; handles historical/modern non-hour offsets.
  for (const delta of [-36,-24,-12,-6,0,6,12,24,36]) {
    const probe=naive + delta*3600000;
    const p=getCivilParts(new Date(probe),timezone);
    const wall=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
    const possible=naive-(wall-probe);
    const check=getCivilParts(new Date(possible),timezone);
    if(check.year===year&&check.month===month&&check.day===day &&
       check.hour===hour&&check.minute===minute&&check.second===second) candidates.add(possible);
  }
  if(candidates.size===0) throw new Error("This wall-clock time does not exist in the selected timezone (DST gap).");
  if(candidates.size>1) throw new Error("This wall-clock time occurs twice (DST fold). Select a different recorded instant or obtain the documented UTC offset.");
  return new Date([...candidates][0]);
}

function tropicalLongitude(body: PlanetKey, date: Date) {
  const t=Astro.MakeTime(date);
  if(body==="sun") return norm(Astro.SunPosition(t).elon);
  if(body==="moon") return norm(Astro.EclipticGeoMoon(t).lon);
  if(body==="rahu"||body==="ketu") {
    const T=(jd(date)-2451545.0)/36525;
    const rahu=norm(125.0445479-1934.1362891*T+0.0020754*T*T+(T*T*T)/467441-(T*T*T*T)/60616000);
    return body==="rahu"?rahu:norm(rahu+180);
  }
  const lookup={
    mars:Astro.Body.Mars,mercury:Astro.Body.Mercury,jupiter:Astro.Body.Jupiter,
    venus:Astro.Body.Venus,saturn:Astro.Body.Saturn
  };
  const vec=Astro.GeoVector(lookup[body],t,true);
  const rot=Astro.Rotation_EQJ_ECT(t);
  const e=Astro.RotateVector(rot,vec);
  return norm(Math.atan2(e.y,e.x)*180/Math.PI);
}
function longitudeSpeed(body: PlanetKey, date: Date) {
  if(body==="rahu"||body==="ketu") return -0.052954;
  const step=0.5*86400000;
  const before=tropicalLongitude(body,new Date(date.getTime()-step));
  const after=tropicalLongitude(body,new Date(date.getTime()+step));
  let change=after-before;
  if(change>180)change-=360;
  if(change<-180)change+=360;
  return change;
}
function nakshatraFor(lon: number) {
  const span=360/27;
  const index=Math.floor(norm(lon)/span);
  const inNak=norm(lon)-index*span;
  return {index:index+1,name:NAKSHATRA[index],pada:Math.min(4,Math.floor(inNak/(span/4))+1),lord:NAK_LORD[index%9]};
}

export function makeBirthChart(input: BirthChartInput) {
  if(!Number.isFinite(input.latitude)||Math.abs(input.latitude)>66) throw new Error("This chart's ascendant approximation supports latitudes from 66°S to 66°N.");
  if(!Number.isFinite(input.longitude)||Math.abs(input.longitude)>180) throw new Error("Longitude must lie between −180° and +180°.");
  if(input.elevation!==undefined&&(!Number.isFinite(input.elevation)||input.elevation < -500||input.elevation>9000)) throw new Error("Elevation is outside the supported range.");
  const utc=resolveBirthInstant(input.date,input.time,input.timezone);
  const siderealOffset=ayanamsa(utc);
  const t=Astro.MakeTime(utc);
  const siderealTime=norm(Astro.SiderealTime(t)*15+input.longitude);
  const tilt=Astro.e_tilt(t);
  const eps=(tilt.tobl+tilt.deps/3600)*Math.PI/180;
  const theta=siderealTime*Math.PI/180;
  const phi=input.latitude*Math.PI/180;
  const x=Math.sin(theta)*Math.cos(eps)+Math.tan(phi)*Math.sin(eps);
  const y=-Math.cos(theta);
  const ascTropical=norm(Math.atan2(y,x)*180/Math.PI);
  const ascSidereal=norm(ascTropical-siderealOffset);
  const ascSign=Math.floor(ascSidereal/30);
  const selectedHouse=input.houseSystem||"whole_sign";
  const positions=BODY_ORDER.map(key=>{
    const tropical=tropicalLongitude(key,utc);
    const sidereal=norm(tropical-siderealOffset);
    const sign=Math.floor(sidereal/30);
    const speed=longitudeSpeed(key,utc);
    const house=selectedHouse==="whole_sign"
      ? (sign-ascSign+12)%12+1
      : Math.floor(norm(sidereal-ascSidereal)/30)+1;
    return {
      key,name:key[0].toUpperCase()+key.slice(1),
      tropicalLongitude:+tropical.toFixed(6),
      siderealLongitude:+sidereal.toFixed(6),
      sign:sign+1,signName:RASHI[sign],degreesInSign:+(sidereal%30).toFixed(5),
      house,nakshatra:nakshatraFor(sidereal),
      speedDegreesPerDay:+speed.toFixed(5),retrograde:speed<0,
      isMeanLunarNode:key==="rahu"||key==="ketu"
    };
  });
  const moon=positions.find(p=>p.key==="moon");
  if(!moon)throw new Error("Moon calculation unavailable.");
  const divisional=DIVISIONAL_CHARTS.map(def=>({
    id:def.id,label:def.label,
    ascendantSign:RASHI[divisionalSign(ascSidereal,def.id)],
    planets:positions.map(p=>({
      key:p.key,sign:RASHI[divisionalSign(p.siderealLongitude,def.id)]
    }))
  }));
  const dasha=vimshottari(moon.siderealLongitude,utc,3);
  return {
    input:{name:input.name?.trim().slice(0,120)||null,date:input.date,time:input.time,timezone:input.timezone,
      latitude:input.latitude,longitude:input.longitude,elevation:input.elevation||0,houseSystem:selectedHouse},
    canonical:{utc:utc.toISOString(),julianDay:+jd(utc).toFixed(7),timezone:input.timezone},
    ascendant:{tropicalLongitude:+ascTropical.toFixed(6),siderealLongitude:+ascSidereal.toFixed(6),sign:ascSign+1,
      signName:RASHI[ascSign],degreesInSign:+(ascSidereal%30).toFixed(5),nakshatra:nakshatraFor(ascSidereal)},
    planets:positions,divisional,dasha,
    calculation:{
      library:"astronomy-engine@2.1.19",engine:"worldpatro-kundli-archive-derived-v1",
      ayanamsa:"Lahiri/Chitrapaksha approximation (J2000 anchor + precession)",
      ayanamsaDegrees:+siderealOffset.toFixed(6),
      lunarNodes:"mean ascending/descending node",
      ascendant:"local sidereal time + obliquity + latitude",
      houses:selectedHouse,
      dasha:"Vimshottari; 365.25-day years; depth 3; proportional period subdivision",
      tzdb:"runtime Intl/IANA",
      precision:"approximate; boundaries, historical rules and birth-time uncertainty can change chart",
      interpretationBoundary:"Astronomical computations and calendar conventions are not proof of astrological predictions.",
      source:"User-provided Arko Jyotish calculation archive; revised and independently typed"
    }
  };
}
export type BirthChart = ReturnType<typeof makeBirthChart>;
