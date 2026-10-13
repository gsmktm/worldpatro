"use client";
import Link from "next/link";
import {useEffect,useMemo,useState,type FormEvent} from "react";

type Mode="moon"|"lagna"|"nakshatra"|"navamsa"|"grahas"|"dasha";
type Tool={id:string;title:string;sub:string;glyph:string;group:"Birth"|"Timing"|"Advanced";mode?:Mode;href?:string;};
const TOOLS:Tool[]=[
 {id:"moon",title:"Moon sign · Rashi",sub:"Sidereal Chandra, house & longitude",glyph:"☾",group:"Birth",mode:"moon"},
 {id:"lagna",title:"Rising sign · Lagna",sub:"Ascendant sign, degree & birth star",glyph:"↗",group:"Birth",mode:"lagna"},
 {id:"nakshatra",title:"Janma Nakshatra",sub:"Birth star, pada & ruling graha",glyph:"✧",group:"Birth",mode:"nakshatra"},
 {id:"grahas",title:"Nine Graha positions",sub:"All sidereal longitudes & houses",glyph:"☉",group:"Birth",mode:"grahas"},
 {id:"navamsa",title:"Navamsa · D9",sub:"Divisional placements & D9 ascendant",glyph:"◇",group:"Advanced",mode:"navamsa"},
 {id:"dasha",title:"Vimshottari Dasha",sub:"Major periods & birth-time balance",glyph:"⌛",group:"Timing",mode:"dasha"},
 {id:"kundli",title:"Complete birth chart",sub:"Twelve houses, seven Vargas, export",glyph:"☸",group:"Birth",href:"/app/kundli"},
 {id:"panchang",title:"Daily Panchang",sub:"Tithi, yoga, nakshatra, sunrise",glyph:"◷",group:"Timing",href:"/app/panchang"},
 {id:"muhurat",title:"Muhurta windows",sub:"Explainable, location-aware screening",glyph:"✺",group:"Timing",href:"/app/muhurat"},
 {id:"transits",title:"Transit sky",sub:"Date-selectable nine-graha positions",glyph:"♄",group:"Timing",href:"#transit-desk"}
];
type Graha={name:string;sign:string;degree:number;house?:number;nakshatra:string;retrograde:boolean};
type QuickOutput={
 rashi?:string;degree?:number;name?:string;lord?:string;pada?:number;
 nakshatra?:{name:string;pada:number;lord:string};
 ascendantSign?:string;planets?:Array<{key:string;sign:string}>;
 birthBalance?:{lord:string;years:number};
 periods?:Array<{lord:string;startUTC:string;endUTC:string}>;
};
type QuickResponse={calculator:Mode;output:QuickOutput|Graha[];canonical:{utc:string};note:string};
type Transit={date:string;sampledLocalTime:string;timezone:string;positions:Array<Graha&{key:string;pada:number;isMeanLunarNode:boolean}>;method:string;caveat:string};
const TODAY_PARTS=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
const TODAY=Object.fromEntries(TODAY_PARTS.map(x=>[x.type,x.value]));
const TODAY_NEPAL=TODAY.year+"-"+TODAY.month+"-"+TODAY.day;
const SIGNS:{[key:string]:string}={Aries:"मेष",Taurus:"वृष",Gemini:"मिथुन",Cancer:"कर्कट",Leo:"सिंह",Virgo:"कन्या",Libra:"तुला",Scorpio:"वृश्चिक",Sagittarius:"धनु",Capricorn:"मकर",Aquarius:"कुम्भ",Pisces:"मीन"};

export default function JyotishExplorer(){
 const [search,setSearch]=useState("");
 const [group,setGroup]=useState("All");
 const [active,setActive]=useState<Mode>("moon");
 const [birth,setBirth]=useState({date:"",time:"",timezone:"Asia/Kathmandu",latitude:"27.7172",longitude:"85.3240"});
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 const [result,setResult]=useState<QuickResponse|null>(null);
 const [transitDate,setTransitDate]=useState(TODAY_NEPAL);
 const [transit,setTransit]=useState<Transit|null>(null);
 const [transitError,setTransitError]=useState(""),[transitBusy,setTransitBusy]=useState(true);
 const visible=useMemo(()=>TOOLS.filter(t=>(group==="All"||t.group===group)&&
   [t.title,t.sub].join(" ").toLowerCase().includes(search.toLowerCase())),[group,search]);
 useEffect(()=>{
   const controller=new AbortController();
   setTransitBusy(true);setTransitError("");setTransit(null);
   fetch("/api/v1/jyotish/transits?date="+encodeURIComponent(transitDate),{signal:controller.signal})
    .then(async r=>{const body=await r.json();if(!r.ok)throw new Error(body.error||"Transit unavailable.");return body as Transit;})
    .then(setTransit).catch(e=>{if(!controller.signal.aborted)setTransitError(e instanceof Error?e.message:"Transit unavailable.");})
    .finally(()=>{if(!controller.signal.aborted)setTransitBusy(false);});
   return ()=>controller.abort();
 },[transitDate]);
 async function calculate(event:FormEvent<HTMLFormElement>){
   event.preventDefault();setBusy(true);setError("");setResult(null);
   try{
     const response=await fetch("/api/v1/jyotish/quick",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({calculator:active,date:birth.date,time:birth.time,timezone:birth.timezone,
       latitude:Number(birth.latitude),longitude:Number(birth.longitude)})});
     const body=await response.json();
     if(!response.ok)throw new Error(body.error||"The calculator is unavailable.");
     setResult(body as QuickResponse);
   }catch(e){setError(e instanceof Error?e.message:"Calculation failed.");}finally{setBusy(false);}
 }
 function switchTool(mode:Mode){setActive(mode);setResult(null);setError("");
   document.getElementById("quick-calculator")?.scrollIntoView({behavior:"smooth",block:"start"});}
 const selected=TOOLS.find(t=>t.mode===active);
 const payload=result?.output;
 const objectOutput=payload&&!Array.isArray(payload)?payload as QuickOutput:null;
 const planetRows=Array.isArray(payload)?payload as Graha[]:null;
 return <div className="jm">
   <section className="jmHero" aria-labelledby="jm-title">
     <div className="jmHeroEyebrow"><span className="jmOm">ॐ</span> WORLD PATRO / JYOTISH OBSERVATORY / नेपाल</div>
     <div className="jmHeroColumns"><div><p className="jmKicker">ANCIENT WISDOM · TRANSPARENT COMPUTATION</p>
       <h1 id="jm-title">The Vedic sky.<em> Beautifully measured.</em></h1>
       <p className="jmIntro">Discover your birth chart, explore graha movements and study the rhythm of time — with Nepali heritage, explicit sources and honest calculation limits.</p>
       <div className="jmHeroActions"><a className="jmGoldButton" href="#quick-calculator">Open calculators <span aria-hidden="true">↗</span></a>
        <Link href="/app/people" className="jmOutlineButton">Explore public lives →</Link></div>
     </div><div className="jmMandala" aria-hidden="true"><span>ॐ</span><i/><i/><i/></div></div>
     <div className="jmHeroFoot"><span>◈ LAHIRI SIDEREAL APPROXIMATION</span><span>◈ ASIA/KATHMANDU</span><span>◈ NO SILENT BIRTH-DATA STORAGE</span></div>
   </section>
   <div className="jmMetrics"><div><strong>06</strong><span>Quick calculators</span></div><div><strong>09</strong><span>Graha positions</span></div><div><strong>07</strong><span>Divisional charts in full studio</span></div><div><strong>01</strong><span>Shared ephemeris method</span></div></div>
   <section className="jmDirectory" aria-labelledby="tools-heading">
    <div className="jmSectionTop"><div><p className="jmKicker">01 / EXPLORE THE TOOLS</p><h2 id="tools-heading">Your Jyotish workspace</h2><p>Search working calculators. Each card opens a functioning tool, not a placeholder.</p></div>
      <span className="jmSectionNumber">{String(visible.length).padStart(2,"0")} TOOLS</span></div>
    <div className="jmFilters"><label className="jmSearch"><span>⌕</span><input aria-label="Search Jyotish tools" placeholder="Search rashi, nakshatra, dasha…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
      <div className="jmTabs" aria-label="Calculator categories">{["All","Birth","Timing","Advanced"].map(item=><button key={item} type="button" aria-pressed={group===item} onClick={()=>setGroup(item)}>{item}</button>)}</div></div>
    <div className="jmToolGrid">{visible.map(tool=><article key={tool.id} className="jmTool">
      <div className="jmToolUpper"><span className="jmGlyph" aria-hidden="true">{tool.glyph}</span><span className="jmToolStatus">READY</span></div>
      <h3>{tool.title}</h3><p>{tool.sub}</p><div className="jmToolBottom"><small>{tool.group.toUpperCase()}</small>
      {tool.mode?<button type="button" aria-label={"Open "+tool.title} onClick={()=>switchTool(tool.mode!)}>Explore ↗</button>:
       <Link href={tool.href||"/app/kundli"}>Explore ↗</Link>}</div>
    </article>)}</div>
    {visible.length===0&&<p className="jmEmpty">No matching tools. Try a different search or category.</p>}
   </section>
   <section id="quick-calculator" className="jmLab" aria-labelledby="jm-lab-title">
    <div className="jmSectionTop"><div><p className="jmKicker">02 / LIVE CALCULATION</p><h2 id="jm-lab-title">Birth chart essentials</h2><p>Use the recorded birth time. An assumed hour can change the Lagna and houses.</p></div><span className="jmSectionNumber">PRIVATE BY DEFAULT</span></div>
    <div className="jmLabColumns"><div className="jmFormPanel">
       <div className="jmModePicker">{TOOLS.filter(t=>t.mode).map(t=><button type="button" aria-pressed={active===t.mode} key={t.id} onClick={()=>{setActive(t.mode!);setResult(null);setError("");}}>{t.title.split(" · ")[0]}</button>)}</div>
       <h3>{selected?.title}</h3><p className="jmFormHelp">The calculation runs on the server and is not saved. All inputs are required.</p>
       <form className="jmForm" onSubmit={calculate}>
        <label>Birth date (AD)<input required type="date" min="1900-01-01" max="2099-12-31" value={birth.date} onChange={e=>setBirth({...birth,date:e.target.value})}/></label>
        <label>Recorded local time<input required type="time" value={birth.time} onChange={e=>setBirth({...birth,time:e.target.value})}/></label>
        <label>Timezone (IANA)<select value={birth.timezone} onChange={e=>setBirth({...birth,timezone:e.target.value})}>
          <option value="Asia/Kathmandu">Kathmandu · UTC+05:45</option><option value="Asia/Kolkata">Kolkata</option>
          <option value="Europe/London">London</option><option value="America/New_York">New York</option>
          <option value="Asia/Shanghai">Shanghai</option><option value="UTC">UTC</option></select></label>
        <div className="jmPair"><label>Latitude<input required type="number" step="any" min="-66" max="66" value={birth.latitude} onChange={e=>setBirth({...birth,latitude:e.target.value})}/></label>
         <label>Longitude<input required type="number" step="any" min="-180" max="180" value={birth.longitude} onChange={e=>setBirth({...birth,longitude:e.target.value})}/></label></div>
        <button className="jmGoldButton" disabled={busy} type="submit">{busy?"Calculating…":"Calculate "+(selected?.title||"chart")+" →"}</button>
       </form>
       <p className="jmFine">Method: astronomy-engine with a Lahiri/Chitrapaksha approximation. Birth-time uncertainty, historical timezone rules and cusps affect results.</p>
      </div><div className="jmResultPanel" aria-live="polite"><div className="jmPanelHead"><span>YOUR CALCULATION</span><span className="jmLiveDot">● ON REQUEST</span></div>
      {error&&<p role="alert" className="jmError">{error}</p>}
      {!result&&!error&&<div className="jmResultEmpty"><span>✧</span><h3>Awaiting your birth details</h3><p>Choose a calculator, enter a precise time and receive a reproducible calculation.</p></div>}
      {result&&<div className="jmResultContent">
        <small className="jmKicker">RESULT / {result.calculator.toUpperCase()}</small>
        {objectOutput&&<><h3>{objectOutput.rashi||objectOutput.name||objectOutput.ascendantSign||objectOutput.birthBalance?.lord||"Calculated placements"}</h3>
        {typeof objectOutput.degree==="number"&&<p className="jmBigDegree">{objectOutput.degree.toFixed(3)}° <span>IN SIGN</span></p>}
        {objectOutput.nakshatra&&<p>Nakshatra: <strong>{objectOutput.nakshatra.name}</strong> · Pada {objectOutput.nakshatra.pada}</p>}
        {objectOutput.pada&&<p>Pada {objectOutput.pada} · Lord {objectOutput.lord}</p>}
        {objectOutput.birthBalance&&<p>Birth dasha balance: <strong>{objectOutput.birthBalance.lord}</strong> · {objectOutput.birthBalance.years} years</p>}
        {objectOutput.planets&&<div className="jmMiniTable">{objectOutput.planets.map(p=><div key={p.key}><span>{p.key}</span><strong>{p.sign}</strong></div>)}</div>}
        {objectOutput.periods&&<div className="jmMiniTable">{objectOutput.periods.slice(0,9).map((p,i)=><div key={p.lord+i}><span>{p.lord}</span><strong>{p.startUTC.slice(0,10)} → {p.endUTC.slice(0,10)}</strong></div>)}</div>}
        </>}
        {planetRows&&<div className="jmMiniTable">{planetRows.map(p=><div key={p.name}><span>{p.name} · {p.nakshatra}</span><strong>{p.sign} {p.degree.toFixed(2)}°</strong></div>)}</div>}
        <p className="jmFine">Instant: {result.canonical.utc} · No server-side storage.</p>
        <Link href="/app/kundli" className="jmOutlineButton">Open complete Kundli →</Link>
       </div>}
      </div></div>
   </section>
   <section id="transit-desk" className="jmTransit" aria-labelledby="transit-heading">
    <div className="jmSectionTop"><div><p className="jmKicker">03 / THE MOVING SKY</p><h2 id="transit-heading">Navagraha transit desk</h2><p>A date-specific sidereal sky snapshot, sampled at 12:00 Nepal time. No unsupported predictions.</p></div>
      <label className="jmTransitDate">Select Nepali-local date<input type="date" min="1900-01-01" max="2099-12-31" value={transitDate} onChange={e=>setTransitDate(e.target.value)}/></label></div>
    {transitBusy&&<p role="status" className="jmLoading">Calculating planetary positions…</p>}
    {transitError&&<p role="alert" className="jmError">{transitError}</p>}
    {transit&&<><div className="jmTransitGrid">{transit.positions.map((p,i)=><article key={p.key}>
      <div><span className="jmPlanetSymbol" aria-hidden="true">{["☉","☾","♂","☿","♃","♀","♄","☊","☋"][i]}</span><span>{p.name}</span>{p.retrograde&&<small>R</small>}</div>
      <strong>{p.sign}<em>{SIGNS[p.sign]||""}</em></strong>
      <p>{p.degree.toFixed(2)}° · {p.nakshatra}</p>
      </article>)}</div><p className="jmFine">{transit.caveat} Method: {transit.method}.</p></>}
   </section>
   <section className="jmClosing"><span>ॐ</span><div><h2>The chart is a calculation.<br/>The interpretation is a tradition.</h2><p>World Patro separates measured positions, documented sources, and symbolic meaning. This workspace makes that boundary visible.</p></div><Link className="jmOutlineButton" href="/app/people">Explore People Atlas ↗</Link></section>
 </div>;
}
