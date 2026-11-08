"use client";
import Link from "next/link";
import {useState} from "react";
import {useMoment} from "@/components/app-shell";
import {Icon} from "@/components/ui/icon";
import {FESTIVALS,FESTIVAL_SOURCE,type Festival} from "@/lib/festivals";
import {eventsToIcs} from "@/lib/ical";
import {downloadText} from "@/lib/ui/download";
export default function FestivalStudio(){
 const {moment,href}=useMoment(),ne=moment.locale==="ne";
 const [filter,setFilter]=useState("upcoming"),[query,setQuery]=useState(""),[notice,setNotice]=useState("");
 const events=FESTIVALS.filter(f=>(filter==="all"||f.date>=moment.date)&&[f.title,f.ne,f.description].join(" ").toLowerCase().includes(query.toLowerCase()));
 function exportEvents(list:readonly Festival[]){downloadText("worldpatro-festivals.ics",eventsToIcs(list.map(f=>({...f,title:ne?f.ne:f.title,description:f.description+" Source: "+FESTIVAL_SOURCE.url}))),"text/calendar;charset=utf-8");setNotice("Calendar exported. Dates retain their municipal source reference.");}
 return <div className="wp-page-stack"><div className="wp-page-intro"><div><div className="wp-overline">THE DAYS THAT BRING US TOGETHER</div><h1>{ne?"चाडपर्व। संस्कृति। सम्झना।":"Our traditions, beautifully connected."}</h1><p>Celebrate with context. Every date here comes with a published source.</p></div><button className="wp-button wp-button-soft" disabled={!events.length} onClick={()=>exportEvents(events)}><Icon name="download" size={16}/>Export calendar</button></div>
 <div className="wp-panel"><div className="wp-section-head"><div><div className="wp-overline">KARTIK 2083 · REVIEWED RELEASE</div><h2>{ne?"प्रकाशित चाडपर्वका मितिहरू":"A calendar with its sources close"}</h2></div><span className="wp-chip"><Icon name="shield" size={14}/>Municipal source</span></div><p className="wp-subtitle">Kathmandu Metropolitan City · {FESTIVAL_SOURCE.coverageStart} to {FESTIVAL_SOURCE.coverageEnd}. Civil observance dates; ritual timings and national holiday status require the relevant authority.</p><a className="wp-text-link" href={FESTIVAL_SOURCE.url} target="_blank" rel="noreferrer">Read the published calendar<Icon name="external" size={14}/></a></div>
 <div className="wp-filter" style={{margin:0}}><div className="wp-tab-row"><button aria-pressed={filter==="upcoming"} onClick={()=>setFilter("upcoming")}>Coming up</button><button aria-pressed={filter==="all"} onClick={()=>setFilter("all")}>All reviewed dates</button></div><input className="wp-field" aria-label="Search festivals" placeholder="Find a festival…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
 {notice&&<p role="status" className="wp-notice">{notice}</p>}
 <div className="wp-festival-grid">{events.map(f=>{const date=new Date(f.date+"T12:00:00Z"),today=f.date===moment.date;return <article key={f.id} className={"wp-festival-card"+(today?" today":"")}><header><div className="wp-festival-date"><strong>{date.getUTCDate()}</strong><small>{new Intl.DateTimeFormat("en-US",{month:"short",timeZone:"UTC"}).format(date)}</small></div><span className="wp-chip">{today?"Today":f.date<moment.date?"Earlier this month":Math.round((date.valueOf()-new Date(moment.date+"T12:00:00Z").valueOf())/86400000)+" days away"}</span></header><h2>{ne?f.ne:f.title}</h2><h3>{ne?f.title:f.ne}</h3><p>{f.description}</p><small className="wp-source-caption">Published civil date · {f.date}</small><footer><Link className="wp-text-link" href={href("/app/planner")+"&title="+encodeURIComponent(ne?f.ne:f.title)+"&eventDate="+f.date+"&category=festival"}><Icon name="plus" size={14}/>Add to planner</Link><button onClick={()=>exportEvents([f])} aria-label={"Export "+f.title}><Icon name="download" size={16}/>.ics</button><a href={FESTIVAL_SOURCE.url} target="_blank" rel="noreferrer">Source ↗</a></footer></article>;})}</div>
 {!events.length&&<div className="wp-panel wp-empty-state"><Icon name="leaf" size={35}/><h3>No reviewed dates in this view.</h3><p>Try all reviewed dates. Absence here does not mean no festival occurs.</p><button className="wp-button" onClick={()=>{setFilter("all");setQuery("");}}>See this release</button></div>}
 <div className="wp-notice">This is a bounded release, reviewed {FESTIVAL_SOURCE.checkedOn}. Future years and lunar recurrences are not inferred. <Link href={href("/app/authorities")}>Explore calendar authorities →</Link></div>
 </div>;
}
