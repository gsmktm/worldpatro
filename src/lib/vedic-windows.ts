/**
 * World Patro: indicative *daylight* traditional time divisions.
 * Inputs are already location-specific sunrise/sunset HH:mm from Astronomy Engine.
 * These are minute-rounded display windows, not certified Muhurat declarations.
 */
export type TimeWindow={
  start:string;
  end:string;
  name:string;
  ne:string;
  kind:"favorable"|"mixed"|"caution"|"planetary";
};
export type VedicDaylightResult={
  status:"calculated"|"unavailable";
  sunrise:string|null;
  sunset:string|null;
  weekday:string;
  choghadiya:TimeWindow[];
  hora:TimeWindow[];
  rahuKala:TimeWindow|null;
  abhijit:TimeWindow|null;
  method:string;
  warning:string;
};

const WEEKDAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
// The conventional daytime sequence repeats every seven choghadiyas.
const CHOGHADIYA=[
  {name:"Udveg",ne:"उद्वेग",kind:"caution"},
  {name:"Char",ne:"चर",kind:"mixed"},
  {name:"Labh",ne:"लाभ",kind:"favorable"},
  {name:"Amrit",ne:"अमृत",kind:"favorable"},
  {name:"Kaal",ne:"काल",kind:"caution"},
  {name:"Shubh",ne:"शुभ",kind:"favorable"},
  {name:"Rog",ne:"रोग",kind:"caution"}
] as const;
// Sun to Sat: initial daytime choghadiya (indices into CHOGHADIYA).
const FIRST_CHOGHADIYA=[0,3,6,2,5,1,4] as const;
const RAHU_SLOT=[8,2,7,5,6,4,3] as const; // 1-based daytime eighth.
const HORA_CYCLE=[
  {name:"Saturn",ne:"शनि"},{name:"Jupiter",ne:"बृहस्पति"},
  {name:"Mars",ne:"मङ्गल"},{name:"Sun",ne:"सूर्य"},
  {name:"Venus",ne:"शुक्र"},{name:"Mercury",ne:"बुध"},
  {name:"Moon",ne:"चन्द्र"}
] as const;
const FIRST_HORA=[3,6,2,5,1,4,0] as const;

function parseClock(raw:string|null):number|null{
  if(!raw||!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(raw))return null;
  const [h,m]=raw.split(":").map(Number);
  return h*60+m;
}
function timeLabel(minutes:number){
  const v=Math.round(minutes);
  const hh=Math.floor(v/60);
  return String(hh).padStart(2,"0")+":"+String(v%60).padStart(2,"0");
}
function slice(start:number,length:number,index:number,total:number){
  return {start:timeLabel(start+length*index/total),end:timeLabel(start+length*(index+1)/total)};
}
const disclaimer="Daylight Choghadiya, Hora, Rahu Kala and Abhijit are traditional rule-based interpretations of minute-rounded astronomical sunrise/sunset. Regional practices vary; not a certified auspicious-time or event declaration.";
const method="Astronomy Engine local-day sunrise/sunset (minute precision); traditional weekday tables; daylight split into 8 Choghadiya / 12 planetary Hora; Abhijit centered on local solar daytime midpoint (1/15 of daylight).";

/** Pure and deterministic: no live network or authority data is invented. */
export function daylightVedicWindows(input:{date:string;sunrise:string|null;sunset:string|null}):VedicDaylightResult{
  const date=new Date(input.date+"T12:00:00Z");
  const valid=Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===input.date;
  if(!valid)throw new Error("Expected a valid Gregorian YYYY-MM-DD civil date.");
  const weekdayIndex=date.getUTCDay();
  const weekday=WEEKDAYS[weekdayIndex];
  const start=parseClock(input.sunrise),end=parseClock(input.sunset);
  const unavailable:VedicDaylightResult={status:"unavailable",sunrise:input.sunrise,sunset:input.sunset,weekday,choghadiya:[],hora:[],rahuKala:null,abhijit:null,method,warning:"A valid same-day sunrise/sunset pair is unavailable. "+disclaimer};
  // Times cannot safely be reconstructed across polar-day or DST transitions from HH:mm alone.
  if(start===null||end===null||end<=start)return unavailable;
  const length=end-start;
  const choghadiya:TimeWindow[]=Array.from({length:8},(_,i)=>{
    const c=CHOGHADIYA[(FIRST_CHOGHADIYA[weekdayIndex]+i)%7];
    return {...slice(start,length,i,8),name:c.name,ne:c.ne,kind:c.kind};
  });
  const hora:TimeWindow[]=Array.from({length:12},(_,i)=>{
    const h=HORA_CYCLE[(FIRST_HORA[weekdayIndex]+i)%7];
    return {...slice(start,length,i,12),name:h.name,ne:h.ne,kind:"planetary"};
  });
  const rahu=slice(start,length,RAHU_SLOT[weekdayIndex]-1,8);
  const half=length/30; // 1/15th of daylight, centered on midday.
  const midpoint=start+length/2;
  const abhijit:TimeWindow={
    start:timeLabel(midpoint-half),end:timeLabel(midpoint+half),
    name:"Abhijit (traditional)",ne:"अभिजित् (परम्परागत)",kind:"mixed"
  };
  return {
    status:"calculated",sunrise:input.sunrise,sunset:input.sunset,weekday,
    choghadiya,hora,
    rahuKala:{...rahu,name:"Rahu Kala",ne:"राहुकाल",kind:"caution"},
    abhijit,method,
    warning:disclaimer+" Abhijit is not universally recommended, especially on Wednesdays. The selected-day Panchang is sampled separately at local noon."
  };
}
