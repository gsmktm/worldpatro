"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";
type Indicator={id:string;name:string;value:number|null;year:string|null;source:string};
type Country={iso3:string;indicators:Indicator[];retrievedAt:string};
type Quake={id?:string;place?:string;mag?:number;url?:string};
const format=new Intl.NumberFormat("en",{maximumFractionDigits:2,notation:"compact"});
async function request(path:string){
  const result=await fetch(path,{cache:"no-store"});
  const payload=await result.json().catch(()=>({}));
  if(!result.ok)throw new Error(payload.error||"Provider unavailable.");
  return payload;
}
export default function WorldWorkbench(){
  const [iso,setIso]=useState("NPL");
  const [country,setCountry]=useState<Country|null>(null);
  const [earthquakes,setEarthquakes]=useState<Quake[]>([]);
  const [quakeMeta,setQuakeMeta]=useState("");
  const [sourceCount,setSourceCount]=useState<number|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  async function load(code="NPL"){
    if(!/^[A-Z]{3}$/.test(code)) {setError("Enter a three-letter ISO country code.");return;}
    setLoading(true);setError("");setCountry(null);
    try{setCountry(await request("/api/v1/world/country?iso3="+encodeURIComponent(code)));}
    catch(e){setError(e instanceof Error?e.message:"Unable to load country.");}
    finally{setLoading(false);}
  }
  async function loadQuakes(){
    setQuakeMeta("Checking USGS source…");
    try {
      const payload=await request("/api/v1/world/earthquakes?lat=27.7172&lon=85.324&radiusKm=800&days=7&minMagnitude=2.5&limit=25");
      const entries=payload.features||payload.events||payload.earthquakes||[];
      setEarthquakes(Array.isArray(entries)?entries.map((q:Record<string,unknown>)=>{
        const p=(q.properties||{}) as Record<string,unknown>;
        return {id:String(q.id||""),place:String(p.place||q.place||"Unknown area"),
          mag:Number(p.mag??q.magnitude??0),url:typeof p.url==="string"?p.url:undefined};
      }):[]);
      setQuakeMeta("USGS feed · events within 800 km of Kathmandu during the last 7 days.");
    }catch(e){setQuakeMeta(e instanceof Error?e.message:"USGS unavailable.");}
  }
  useEffect(()=>{
    void load("NPL");void loadQuakes();
    void request("/api/v1/sources").then(d=>setSourceCount(d.sources?.length??0)).catch(()=>{});
  },[]);
  function submit(e:FormEvent){e.preventDefault();void load(iso.trim().toUpperCase());}
  return <section className="moduleWorkbench">
    <div className="workHero"><div className="eyebrow">WORLD PATRO · PUBLIC INTELLIGENCE</div><h1>World Intelligence</h1><p>Check country indicators, recent nearby seismic observations and named source registries. Public datasets are displayed with retrieval metadata; no state is described as controlled by another state.</p></div>
    <form className="workToolbar" onSubmit={submit}><label htmlFor="country-code">ISO-3 country code</label>
      <input id="country-code" maxLength={3} pattern="[A-Za-z]{3}" value={iso} onChange={e=>setIso(e.target.value.toUpperCase())} placeholder="NPL"/>
      <button className="primaryBtn" disabled={loading}>{loading?"Retrieving…":"Load country →"}</button>
      <Link href="/app/sources" className="ghost">Source registry {sourceCount===null?"":"· "+sourceCount}</Link></form>
    {error&&<p className="workError" role="alert">{error}</p>}
    <div className="workColumns">
      <article className="workPanel"><div className="eyebrow">WORLD BANK · COUNTRY DATA</div><h2>{country?.iso3||"Country indicators"}</h2>
        <div className="workDataGrid">{(country?.indicators||[]).map(p=><div key={p.id}><small>{p.name}</small><strong>{p.value===null?"Not available":format.format(p.value)}</strong><span>{p.year??"—"} · {p.source}</span></div>)}</div>
        {!country&&!loading&&<p className="workMuted">No snapshot returned yet. Try another three-letter ISO code.</p>}
        {country?.retrievedAt&&<p className="workMuted">Retrieved: {new Date(country.retrievedAt).toLocaleString()}</p>}
        <Link href="/api/v1/world/country?iso3=NPL">Open source API ↗</Link>
      </article>
      <article className="workPanel"><div className="eyebrow">USGS · PUBLIC SEISMIC EVENTS</div><h2>Nepal area observations</h2>
        <p className="workMuted">{quakeMeta}</p>
        <button className="ghost" type="button" onClick={loadQuakes}>Refresh events</button>
        <div className="workRows">{earthquakes.slice(0,10).map((q,i)=><div key={q.id||i}><strong>M {q.mag?.toFixed(1)??"—"}</strong><span>{q.place}</span>
          {q.url?.startsWith("https://")&&<a href={q.url} target="_blank" rel="noopener noreferrer">USGS ↗</a>}</div>)}</div>
        <p className="workMuted">Observations are not forecasts. For immediate emergencies follow local authorities.</p>
      </article>
    </div>
    <div className="workModuleLinks"><Link href="/app/research">Open research →</Link><Link href="/app/alerts">Create a watchlist →</Link><Link href="/app/agents">Ask Conductor →</Link><Link href="/app/patro">Open world calendar →</Link></div>
  </section>;
}
