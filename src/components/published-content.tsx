"use client";
import {useEffect,useState} from "react";
type Published={
 id:string;title:string;slug:string;kind:string;summary:string;body:string;sourceUrl:string;
 country:string;tradition:string;eventDate:string;updatedAt:string|null;
};
export default function PublishedContent({kind,title,subtitle}:{kind:"article"|"observance"|"source"|"authority";title:string;subtitle:string}){
  const [items,setItems]=useState<Published[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const res=await fetch("/api/v1/content?kind="+kind,{cache:"no-store"});
        if(!res.ok)throw new Error("Published content is not available from the configured database.");
        const json=await res.json();
        if(active)setItems(json.records||[]);
      }catch(e){if(active)setError(e instanceof Error?e.message:"Content unavailable.");}
      finally{if(active)setLoading(false);}
    })();
    return ()=>{active=false;};
  },[kind]);
  return <section className="publishedPage">
    <div className="publishedHero"><div className="eyebrow">WORLD PATRO · REVIEWED SOURCES</div><h1>{title}</h1><p>{subtitle}</p></div>
    {loading&&<p role="status" className="publishedMessage">Loading published records…</p>}
    {error&&<p role="status" className="publishedMessage">{error}</p>}
    {!loading&&!error&&!items.length&&<div className="publishedBlank">
      <h2>No verified publications yet</h2><p>Entries will appear after a World Patro administrator creates a draft, reviews it, supplies a source and publishes it. No placeholder festival dates are presented as facts.</p>
    </div>}
    <div className="publishedList">{items.map(r=><article key={r.id}>
      <div className="eyebrow">{r.kind.toUpperCase()} · {r.country||"GLOBAL"} · {r.eventDate||"NO FIXED DAY"}</div>
      <h2>{r.title}</h2><p>{r.summary}</p><details><summary>Read full entry</summary><p className="publishedBody">{r.body}</p></details>
      <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">Review source document ↗</a>
      {r.tradition&&<small>Tradition: {r.tradition}</small>}
    </article>)}</div>
  </section>;
}
