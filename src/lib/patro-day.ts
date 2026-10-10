import { z } from "zod";
import { buildCalendarSnapshot } from "@/lib/calendars";
import { calculatePanchang } from "@/lib/astro";
import { resolveBirthInstant } from "@/lib/jyotish/birth-chart";
import { defaults } from "@/lib/env";

const Query=z.object({
  date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locale:z.enum(["en","ne"]).default("en"),
  lat:z.coerce.number().finite().min(-66).max(66),
  lon:z.coerce.number().finite().min(-180).max(180),
  elevation:z.coerce.number().finite().min(-500).max(9000).default(1400),
  tz:z.string().trim().min(1).max(100)
}).strict();

export class PatroValidationError extends Error {}

export function dateInTimezone(date:Date,timezone:string){
  const parts=new Intl.DateTimeFormat("en-US",{
    timeZone:timezone,calendar:"gregory",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(date);
  const fields=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return fields.year+"-"+fields.month+"-"+fields.day;
}

export function dateInNepal(){return dateInTimezone(new Date(),"Asia/Kathmandu");}

export function readPatroQuery(url:URL){
  const query=url.searchParams;
  const input=Query.safeParse({
    date:query.get("date")||dateInNepal(),
    locale:query.get("locale")||"en",
    lat:query.get("lat")??String(defaults.lat),
    lon:query.get("lon")??String(defaults.lon),
    elevation:query.get("elevation")??"1400",
    tz:query.get("tz")||defaults.tz
  });
  if(!input.success)throw new PatroValidationError("Invalid date, language, coordinates, elevation or timezone.");

  const {date,tz}=input.data;
  const [year]=date.split("-").map(Number);
  if(year<1900||year>2100)throw new PatroValidationError("Supported Gregorian years are 1900–2100.");
  try{
    const d=new Date(date+"T12:00:00.000Z");
    if(!Number.isFinite(d.valueOf())||d.toISOString().slice(0,10)!==date)
      throw new PatroValidationError("Invalid Gregorian calendar date.");
    // Check IANA timezone validity and reject unusual local-time gaps at noon.
    const instant=resolveBirthInstant(date,"12:00:00",tz);
    if(dateInTimezone(instant,tz)!==date)
      throw new PatroValidationError("Unable to resolve this date in the chosen timezone.");
    return {...input.data,instant,calendarInstant:d};
  }catch(error){
    if(error instanceof PatroValidationError)throw error;
    throw new PatroValidationError(error instanceof Error?error.message:"Invalid timezone/date.");
  }
}

export function buildPatroDay(input:ReturnType<typeof readPatroQuery>){
  const panchang=calculatePanchang({
    date:input.instant,lat:input.lat,lon:input.lon,
    elevation:input.elevation,tz:input.tz
  });
  return {
    canonical:{
      date:input.date,
      instantUsed:input.instant.toISOString(),
      precision:"local-civil-date-noon",
      timezone:input.tz,
      latitude:input.lat,
      longitude:input.lon,
      elevationMeters:input.elevation,
      locale:input.locale
    },
    calendars:buildCalendarSnapshot(input.calendarInstant,input.locale),
    panchang,
    links:{
      panchang:"/app/panchang",
      bsConverter:"/app/patro#bs-converter",
      kundli:"/app/kundli",
      muhurat:"/app/muhurat",
      festivals:"/app/religions",
      authorities:"/app/authorities",
      sources:"/app/sources",
      research:"/app/research",
      privacy:"/app/privacy",
      admin:"/app/admin",
      learning:"/app/learn",
      world:"/app/world"
    },
    provenance:{
      astronomy:"astronomy-engine@2.1.19 · Lahiri approximation",
      calendar:"Intl/ICU for six deterministic civil calendar profiles; Nepal BS only in municipality-verified spans",
      traditionalInterpretation:"not established scientific forecasting"
    },
    warning:"This snapshot is computed at local civil noon for a selected day and location. Tithi/nakshatra/yoga can change during that day. Holiday and festival declarations require appropriate authorities.",
    generatedAt:new Date().toISOString()
  };
}
