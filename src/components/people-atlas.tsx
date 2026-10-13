"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import type {PublicPerson} from "@/lib/jyotish/public-people";
type Payload={records:PublicPerson[];total:number;page:number;pageSize:number;categories:string[];disclosure:string};
const CATEGORIES=["all","Nepal","Leadership","Spirituality","Science","Royal history"];
export default function PeopleAtlas(){
 const [search,setSearch]=useState(""),[category,setCategory]=useState("all"),[page,setPage]=useState(1);
 const [data,setData]=useState<Payload|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(true);
 useEffect(()=>{
   const controller=new AbortController();setBusy(true);setError("");setData(null);
   const query=new URLSearchParams({search,category,page:String(page)});
   fetch("/api/v1/jyotish/people?"+query,{signal:controller.signal})
    .then(async r=>{const x=await r.json();if(!r.ok)throw new Error(x.error||"Directory is unavailable.");return x as Payload;})
    .then(setData).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Directory unavailable.");})
    .finally(()=>{if(!controller.signal.aborted)setBusy(false);});
   return ()=>controller.abort();
 },[search,category,page]);
 return <div className="jm jmPeople">
   <section className="jmHero jmPeopleHero">
    <div className="jmHeroEyebrow"><span className="jmOm">ॐ</span> WORLD PATRO / PUBLIC LIVES ATLAS / नेपाल</div>
    <div className="jmHeroColumns"><div><p className="jmKicker">BIOGRAPHY · SOURCE · UNCERTAINTY</p>
     <h1>Every life, <em>a unique sky.</em></h1>
     <p className="jmIntro">Study documented birth records of public figures. Explore biography first; calculate a horoscope only when its time and location are sufficiently established.</p>
     <div className="jmHeroActions"><Link href="/app/jyotish-explorer" className="jmGoldButton">Open Jyotish tools ↗</Link><Link href="/app/kundli" className="jmOutlineButton">Your own Kundli →</Link></div>
    </div><div className="jmMandala" aria-hidden="true"><span>✧</span><i/><i/><i/></div></div>
    <div className="jmHeroFoot"><span>◈ CURATED PUBLIC SOURCES</span><span>◈ BIRTH-TIME EVIDENCE</span><span>◈ NO FABRICATED HOROSCOPES</span></div>
   </section>
   <section className="jmDirectory">
    <div className="jmSectionTop"><div><p className="jmKicker">01 / THE ARCHIVE</p><h2>Explore people & provenance</h2><p>Birth dates are biographical facts; ascendants require trustworthy birth times.</p></div><span className="jmSectionNumber">{data?.total??"—"} RECORDS</span></div>
    <div className="jmFilters"><label className="jmSearch"><span>⌕</span><input value={search} maxLength={80} aria-label="Search public figures" placeholder="Search names, places, roles…" onChange={e=>{setPage(1);setSearch(e.target.value);}}/></label></div>
    <div className="jmTabs jmPeopleCategories" aria-label="Filter people by category">{CATEGORIES.map(c=><button key={c} aria-pressed={category===c} onClick={()=>{setCategory(c);setPage(1);}}>{c==="all"?"All people":c}</button>)}</div>
    {busy&&<p role="status" className="jmLoading">Loading source-backed profiles…</p>}
    {error&&<p role="alert" className="jmError">{error}</p>}
    {data&&<><div className="jmPeopleGrid">{data.records.map(person=><article className="jmPersonCard" key={person.slug}>
      <div className="jmPersonPortrait" aria-hidden="true"><span>{person.name.split(" ").slice(0,2).map(s=>s[0]).join("")}</span><i>✦</i></div>
      <div className="jmPersonInfo"><small>{person.category.toUpperCase()}</small><h3>{person.name}</h3>{person.nameNe&&<p className="jmNameNe">{person.nameNe}</p>}
       <p>{person.occupation}</p><div className="jmPersonFact"><span>BORN</span><strong>{person.born}</strong></div>
       <div className="jmPersonFact"><span>BIRTH TIME</span><strong>{person.timeStatus==="documented"?"Source documented":"Unverified"}</strong></div>
       <Link href={"/app/people/"+person.slug}>View evidence profile ↗</Link></div>
    </article>)}</div>
    {data.records.length===0&&<p className="jmEmpty">No matching biography. Try another name or category.</p>}
    <div className="jmPagination"><button disabled={page<=1} onClick={()=>setPage(v=>v-1)}>← Previous</button><span>Page {page} of {Math.max(1,Math.ceil(data.total/data.pageSize))}</span><button disabled={page*data.pageSize>=data.total} onClick={()=>setPage(v=>v+1)}>Next →</button></div>
    <p className="jmFine">{data.disclosure}</p></>}
   </section>
 </div>;
}
