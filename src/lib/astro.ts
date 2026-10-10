import * as Astro from "astronomy-engine";

const TITHI_NAMES = [
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami",
  "Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima / Amavasya"
];
const NAKSHATRAS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha",
  "Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha",
  "Purva Bhadrapada","Uttara Bhadrapada","Revati"
];
const YOGAS = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula",
  "Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana",
  "Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"
];

const norm = (n: number) => ((n % 360) + 360) % 360;

function lahiriAyanamsa(date: Date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const precessionArcSec =
    5028.796195 * T + 1.1054348 * T ** 2 + 0.00007964 * T ** 3 - 0.000023857 * T ** 4;
  return 23.8531972 + precessionArcSec / 3600;
}

function hhmm(date:Date|null,tz:string){
  if(!date)return null;
  return new Intl.DateTimeFormat("en-GB",{
    timeZone:tz,hour:"2-digit",minute:"2-digit",hour12:false
  }).format(date);
}
function localISO(date:Date,tz:string){
  const parts=new Intl.DateTimeFormat("en-US",{
    timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(date);
  const p=Object.fromEntries(parts.map(item=>[item.type,item.value]));
  return p.year+"-"+p.month+"-"+p.day;
}

/** Returns only an event on the requested IANA local civil date, never one from a nearby UTC date. */
function riseSetOnLocalDay(body:Astro.Body,observer:Astro.Observer,direction:1|-1,
                            midday:Date,tz:string){
  const target=localISO(midday,tz);
  // Start 36h before local noon to cover large UTC offsets and historical offsets.
  let cursor=new Date(midday.getTime()-36*3600000);
  for(let attempt=0;attempt<5;attempt++){
    const found=Astro.SearchRiseSet(body,observer,direction,Astro.MakeTime(cursor),4);
    if(!found)return null;
    const civil=localISO(found.date,tz);
    if(civil===target)return found.date;
    if(civil>target)return null;
    cursor=new Date(found.date.getTime()+1000);
  }
  return null;
}

export type PanchangInput = {
  date: Date;
  lat: number;
  lon: number;
  elevation?: number;
  tz: string;
};

export function calculatePanchang(input: PanchangInput) {
  const { date, lat, lon, tz, elevation = 0 } = input;
  const time = Astro.MakeTime(date);
  const sunTropical = Astro.SunPosition(time).elon;
  const moon = Astro.EclipticGeoMoon(time);
  const moonTropical = norm(moon.lon);
  const ayanamsa = lahiriAyanamsa(date);
  const sunSidereal = norm(sunTropical - ayanamsa);
  const moonSidereal = norm(moonTropical - ayanamsa);
  const elongation = norm(moonTropical - sunTropical);
  const tithiNumber = Math.floor(elongation / 12) + 1;
  const tithiInPaksha = ((tithiNumber - 1) % 15) + 1;
  const paksha = tithiNumber <= 15 ? "Shukla" : "Krishna";
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
  const yogaIndex = Math.floor(norm(sunSidereal + moonSidereal) / (360 / 27));
  const observer=new Astro.Observer(lat,lon,elevation);
  const sunrise=riseSetOnLocalDay(Astro.Body.Sun,observer,1,date,tz);
  const sunset=riseSetOnLocalDay(Astro.Body.Sun,observer,-1,date,tz);
  const moonrise=riseSetOnLocalDay(Astro.Body.Moon,observer,1,date,tz);
  const moonset=riseSetOnLocalDay(Astro.Body.Moon,observer,-1,date,tz);

  return {
    method: "Astronomy Engine 2.1.19 + Lahiri/Chitrapaksha approximation; tithi/nakshatra/yoga sampled at the requested instant",
    interpretationBoundary: "Astronomical quantities are calculated; auspicious/inauspicious meaning is traditional interpretation.",
    ayanamsa: Number(ayanamsa.toFixed(6)),
    sun: { tropicalLongitude: Number(sunTropical.toFixed(6)), siderealLongitude: Number(sunSidereal.toFixed(6)) },
    moon: { tropicalLongitude: Number(moonTropical.toFixed(6)), siderealLongitude: Number(moonSidereal.toFixed(6)), phaseAngle: Number(Astro.MoonPhase(time).toFixed(4)) },
    tithi: { number: tithiNumber, paksha, name: TITHI_NAMES[tithiInPaksha - 1] },
    nakshatra: { number: nakshatraIndex + 1, name: NAKSHATRAS[nakshatraIndex] },
    yoga: { number: yogaIndex + 1, name: YOGAS[yogaIndex] },
    sunTimes: {
      sunrise: hhmm(sunrise,tz),
      sunset: hhmm(sunset,tz)
    },
    moonTimes: {
      moonrise: hhmm(moonrise,tz),
      moonset: hhmm(moonset,tz)
    },
    location: { lat, lon, elevation, tz },
    provenance: {
      type: "ASTRONOMICAL_EPHEMERIS",
      library: "astronomy-engine@2.1.19",
      ayanamsa: "Lahiri approximation anchored at J2000"
    }
  };
}
