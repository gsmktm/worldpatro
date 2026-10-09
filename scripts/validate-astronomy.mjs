/**
 * World Patro regression gate against external USNO 2026 season instants.
 * USNO source: https://aa.usno.navy.mil/calculated/seasons?year=2026&tz=0.00&tz_sign=1&tz_label=false&dst=false&submit=Get+Data
 * This checks tropical Sun ecliptic longitude, not sidereal Lahiri or chart houses.
 */
import * as Astronomy from "astronomy-engine";

const reference=[
  ["2026-03-20T14:46:00.000Z",0,"March equinox"],
  ["2026-06-21T08:24:00.000Z",90,"June solstice"],
  ["2026-09-23T00:05:00.000Z",180,"September equinox"],
  ["2026-12-21T20:50:00.000Z",270,"December solstice"]
];
const toleranceDegrees=0.12; // ~2.9 h solar motion, intentionally not arc-second certification.
const angularDelta=(a,b)=>Math.abs((((a-b+540)%360)+360)%360-180);
const results=reference.map(([utc,target,label])=>{
  const sun=Astronomy.SunPosition(Astronomy.MakeTime(new Date(utc))).elon;
  const diff=angularDelta(sun,target);
  if(diff>toleranceDegrees){
    throw new Error(label+": angular residual "+diff.toFixed(4)+"° exceeds "+toleranceDegrees+"°");
  }
  return {event:label,utc,solarLongitude:Number(sun.toFixed(5)),residualDegrees:Number(diff.toFixed(5))};
});
console.log(JSON.stringify({
  verified:true,
  referenceAuthority:"US Naval Observatory 2026 Earth Seasons table",
  quantity:"Geocentric tropical solar ecliptic longitude",
  toleranceDegrees,
  results
},null,2));
