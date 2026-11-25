"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMoment } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { MoonDisk, ZodiacVector } from "@/components/moon-vectors";
import { MOON_PHASES, MOON_RASHIS, type PhaseId } from "@/lib/moon-timeline";
import { civilDate, momentQuery } from "@/lib/ui/moment";

type MoonDay={date:string;phaseDegrees:number;phaseId:PhaseId;illuminationPercent:number;selected:boolean};
type MoonSnapshot={
 reference:{date:string;instantUTC:string;timezone:string;precision:string};
 phase:{degrees:number;id:PhaseId;name:string;ne:string;illuminatedPercent:number;waxing:boolean};
 size:{distanceKm:number;angularDiameterArcmin:number;physicalDiameterKm:number;description:string};
 rashi:{index:number;name:string;ne:string;english:string;system:string};
 moonrise:string|null;moonset:string|null;
 events:{id:string;name:string;ne:string;instantUTC:string;date:string}[];
 days:MoonDay[];
 generatedAt:string;method:string;note:string;
};
function dateLabel(date:string,locale:string,opts:Intl.DateTimeFormatOptions){
  return new Intl.DateTimeFormat(locale,{...opts,timeZone:"UTC"}).format(new Date(date+"T12:00:00Z"));
}
export default function MoonStudio(){
  const {moment,href}=useMoment(),router=useRouter();
  const ne=moment.locale==="ne",locale=ne?"ne-NP":"en-US";
  const query=momentQuery(moment);
  const [data,setData]=useState<MoonSnapshot|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [refresh,setRefresh]=useState(0);
  useEffect(()=>{
    const ctrl=new AbortController();
    setLoading(true);setError("");setData(null);
    fetch("/api/v1/moon/day?"+query,{signal:ctrl.signal,cache:"no-store"}).then(async r=>{
      const body=await r.json();if(!r.ok)throw new Error(body.error||"Moon data unavailable.");
      return body as MoonSnapshot;
    }).then(v=>{if(!ctrl.signal.aborted)setData(v);})
      .catch(e=>{if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:"Moon calculation failed.");})
      .finally(()=>{if(!ctrl.signal.aborted)setLoading(false);});
    return()=>ctrl.abort();
  },[query,refresh]);
  function select(date:string){router.replace("/app/moon?"+momentQuery({...moment,date}),{scroll:false});}
  const phase=data?.phase;
  const apparentScale=data?Math.min(1.09,Math.max(.91,data.size.angularDiameterArcmin/31.4)):1;
  return <div className="moon-studio" aria-busy={loading}>
    <header className="moon-intro">
      <div><div className="wp-overline">ॐ · WORLD PATRO / LUNAR OBSERVATORY</div>
        <h1>{ne?"चन्द्र दर्शन":"The Moon, in time."}</h1>
        <p>{ne?"चन्द्रकला, वास्तविक देखिने कोणीय आकार, चन्द्र उदय–अस्त, चन्द्र राशी र आगामी खगोलीय तिथिहरू एउटै दृश्यमा।":"A generous lunar portrait, measured apparent size, upcoming phase dates and the twelve rāśi—one connected experience."}</p>
      </div>
      <Link href={href("/app/vedic")} className="moon-back"><Icon name="arrow" size={15}/>{ne?"वैदिक पात्रो":"Vedic daily"}</Link>
    </header>
    <section className="moon-controls" aria-label="Moon date and timezone controls">
      <label htmlFor="moon-date">{ne?"मिति":"Selected date"}<input id="moon-date" type="date" value={moment.date}
        min="1900-01-01" max="2100-12-31" onChange={e=>{if(e.target.value)select(e.target.value);}}/></label>
      <button type="button" onClick={()=>select(civilDate(new Date(),moment.tz))}>{ne?"आज":"Today"}</button>
      <button type="button" onClick={()=>setRefresh(n=>n+1)} aria-label="Refresh Moon data"><Icon name="refresh" size={17}/></button>
      <span><Icon name="pin" size={16}/>{moment.tz} · {moment.lat.toFixed(2)}°, {moment.lon.toFixed(2)}°</span>
    </section>
    {loading&&<p className="moon-loading" role="status">{ne?"चन्द्रमाको खगोलीय गणना हुँदैछ…":"Calculating lunar phase, distance and dated events…"}</p>}
    {error&&<div className="moon-error" role="alert">{error} <button type="button" onClick={()=>setRefresh(n=>n+1)}>{ne?"पुनः प्रयास":"Try again"}</button></div>}
    <section className="moon-hero" aria-label="Moon phase and apparent size">
      <div className="moon-stage">
        <div className="moon-stage-orbit one"/><div className="moon-stage-orbit two"/><div className="moon-stage-orbit three"/>
        <div className="moon-stage-points" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
        <div className="moon-disk-wrap" style={{transform:"scale("+apparentScale+")"}}>
          <MoonDisk phaseDegrees={phase?.degrees??0} illuminationPercent={phase?.illuminatedPercent??0} size={350}/>
        </div>
        <small>{ne?"चन्द्रकला चित्रण · आकार मापनानुसार सानो परिवर्तन":"Illustrative phase · subtly scaled by measured angular size"}</small>
      </div>
      <div className="moon-hero-info">
        <span className="wp-overline">01 / CELESTIAL PORTRAIT</span>
        <h2>{phase?(ne?phase.ne:phase.name):(ne?"चन्द्र स्थिति":"Moon phase")}</h2>
        <p className="moon-date-label">{dateLabel(moment.date,locale,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</p>
        <div className="moon-illuminated">
          <strong>{phase?phase.illuminatedPercent.toFixed(1)+"%":"—"}</strong><span>{ne?"प्रकाशित भाग":"Illuminated disc"}</span>
        </div>
        <div className="moon-progress" aria-label="Illumination percentage"><span style={{width:(phase?.illuminatedPercent||0)+"%"}}/></div>
        <p className="moon-phase-info">{phase?(ne?(phase.waxing?"बढ्दो चन्द्र":"घट्दो चन्द्र"):(phase.waxing?"Waxing phase":"Waning phase")):"—"} · {ne?"खगोलीय दीर्घांशको अन्तर":"Geocentric phase longitude"} {phase?phase.degrees.toFixed(1)+"°":"—"}</p>
        <div className="moon-stats">
          <article><small>{ne?"आकाशमा देखिने कोणीय व्यास":"Apparent diameter"}</small><strong>{data?data.size.angularDiameterArcmin.toFixed(2)+"′":"—"}</strong><span>{ne?"आर्क-मिनेट":"arcminutes"}</span></article>
          <article><small>{ne?"पृथ्वीदेखि दूरी":"Earth–Moon distance"}</small><strong>{data?new Intl.NumberFormat(locale,{maximumFractionDigits:0}).format(data.size.distanceKm)+" km":"—"}</strong><span>{ne?"भूकेन्द्रीय गणना":"geocentric estimate"}</span></article>
          <article><small>{ne?"चन्द्रोदय":"Moonrise"}</small><strong>{data?.moonrise||"—"}</strong><span>{moment.tz}</span></article>
          <article><small>{ne?"चन्द्रास्त":"Moonset"}</small><strong>{data?.moonset||"—"}</strong><span>{moment.tz}</span></article>
        </div>
        <p className="moon-disclaimer">{ne?"चन्द्रमाको वास्तविक भौतिक आकार बदलिँदैन। टाढा–नजिक हुँदा देखिने कोणीय आकार बदलिन्छ।":"The Moon's physical diameter stays essentially constant; the angular diameter changes with distance. Graphic size is illustrative."}</p>
      </div>
    </section>

    <section className="moon-section">
      <div className="moon-section-head"><div><div className="wp-overline">02 / LUNAR DATE STRIP</div><h2>{ne?"मितिअनुसार चन्द्रकला":"Fourteen days of moonlight"}</h2></div><small>{ne?"मिति छान्न थिच्नुहोस्":"Choose any date to update the studio"}</small></div>
      <div className="moon-day-grid">{data?.days.map(item=><button type="button" key={item.date}
        className={"moon-day"+(item.selected?" selected":"")}
        onClick={()=>select(item.date)} aria-pressed={item.selected}
        aria-label={item.date+" "+item.illuminationPercent+"% illuminated"}>
          <span>{dateLabel(item.date,locale,{weekday:"short"})}</span>
          <MoonDisk phaseDegrees={item.phaseDegrees} illuminationPercent={item.illuminationPercent} size={56}/>
          <strong>{dateLabel(item.date,locale,{day:"numeric"})}</strong>
          <small>{item.illuminationPercent.toFixed(0)}%</small>
        </button>)}
        {!data&&!loading&&<p>{ne?"यस मितिमा चन्द्र विवरण छैन।":"No lunar data to display."}</p>}</div>
    </section>

    <section className="moon-section">
      <div className="moon-section-head"><div><div className="wp-overline">03 / NEXT FOUR PHASE EVENTS</div><h2>{ne?"आगामी मुख्य चन्द्र अवस्थाका मिति":"Upcoming lunar milestones"}</h2></div><small>{ne?"छानिएको दिनको स्थानीय मध्यान्हपछि":"After selected local noon"}</small></div>
      <div className="moon-event-grid">{data?.events.map(e=>{
        const degrees=e.id==="new"?0:e.id==="first-quarter"?90:e.id==="full"?180:270;
        return <article className="moon-event" key={e.id}>
          <MoonDisk phaseDegrees={degrees} illuminationPercent={degrees===180?100:degrees===0?0:50} size={74}/>
          <div><strong>{ne?e.ne:e.name}</strong><time dateTime={e.instantUTC}>{new Intl.DateTimeFormat(locale,{timeZone:moment.tz,month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(e.instantUTC))}</time><small>{moment.tz}</small></div>
          <button type="button" onClick={()=>select(e.date)} aria-label={"Open lunar date "+e.date}><Icon name="arrow" size={16}/></button>
        </article>;
      })}</div>
      <p className="moon-caption">{ne?"यी चार अवस्थाको UTC खगोलीय समयलाई छानिएको समयक्षेत्रमा देखाइएको छ। अन्य चन्द्रकलाका नाम ४५° अनुसारको वर्गीकरण हुन्।":"These four milestones are searched astronomical events, displayed in the selected timezone. Intermediate phase names are illustrative 45° categories, not separate certified observance dates."}</p>
    </section>

    <section className="moon-section">
      <div className="moon-section-head"><div><div className="wp-overline">04 / TWELVE ORIGINAL VECTOR SIGNS</div><h2>{ne?"बाह्र राशिका अद्वितीय चिह्न":"The twelve rāśi, drawn anew"}</h2></div>
        <span className="moon-current-label">{ne?"चन्द्र राशि":"MOON RĀŚI"} · {data?(ne?data.rashi.ne:data.rashi.english):"—"}</span></div>
      <div className="moon-sign-grid">{MOON_RASHIS.map((sign,i)=><article key={sign.english}
        className={"moon-sign"+(data?.rashi.index===i?" current":"")}>
        <span className="moon-sign-vector"><ZodiacVector index={i} size={47}/></span>
        <small>{String(i+1).padStart(2,"0")}</small>
        <strong>{ne?sign.ne:sign.english}</strong><span>{ne?sign.english:sign.ne}</span>
        {data?.rashi.index===i&&<em>{ne?"चन्द्र यहाँ छ":"Moon here"}</em>}
      </article>)}</div>
      <p className="moon-caption">{ne?"चन्द्र राशि अनुमानित लाहिरी निरयन दीर्घांशलाई ३०° का बाह्र बराबर भागमा छुट्याएर गणना गरिएको हो। वास्तविक तारामण्डलको सीमा फरक हुन्छ।":"Moon rāśi uses an approximate Lahiri sidereal longitude divided into 12 equal 30° signs, not IAU constellation boundaries. Icons are original SVG artwork."}</p>
    </section>
    <footer className="moon-footer"><div><strong>WORLD PATRO · LUNAR METHODS</strong><p>{data?.method||"Astronomy Engine lunar calculations"}.</p><p>{data?.note}</p></div>
      <div><Link href={href("/app/panchang")}>{ne?"पञ्चाङ्ग":"Panchang"} <Icon name="arrow" size={14}/></Link>
        <Link href={href("/app/kundli")}>{ne?"कुण्डली":"Kundli"} <Icon name="arrow" size={14}/></Link>
        <Link href={href("/app/sources")}>{ne?"स्रोत":"Sources"} <Icon name="arrow" size={14}/></Link></div>
    </footer>
  </div>;
}
