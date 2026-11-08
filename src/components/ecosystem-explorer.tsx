"use client";
import Link from "next/link";
import {useState} from "react";
import {useMoment} from "@/components/app-shell";
import {NAV_ITEMS,NAV_GROUPS,modulePath} from "@/lib/navigation";
import {Icon} from "@/components/ui/icon";
export default function EcosystemExplorer(){
 const {moment,href}=useMoment(),ne=moment.locale==="ne";const [query,setQuery]=useState(""),[group,setGroup]=useState("all");
 const items=NAV_ITEMS.filter(x=>x.slug&&(group==="all"||x.group===group)&&[x.label,x.ne,x.description].join(" ").toLowerCase().includes(query.toLowerCase()));
 return <div className="wp-page-stack"><div className="wp-page-intro"><div><div className="wp-overline">ONE CONNECTED WORLD PATRO</div><h1>{ne?"तपाईंको सम्पूर्ण संसार।":"A whole ecosystem, within reach."}</h1><p>From the first light of your day to a wider view of the world.</p></div><Link className="wp-button" href={href("/app/system")}><Icon name="shield" size={16}/>System status</Link></div>
 <div className="wp-filter" style={{margin:0}}><Icon name="search"/><input className="wp-field" aria-label="Search the ecosystem" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find calendars, tools, research…"/><select className="wp-field" style={{width:"auto",maxWidth:200}} aria-label="Filter tool category" value={group} onChange={e=>setGroup(e.target.value)}><option value="all">All categories</option>{NAV_GROUPS.map(g=><option key={g.id} value={g.id}>{ne?g.ne:g.label}</option>)}</select></div>
 <div className="wp-ecosystem-grid">{items.map(item=><Link className="wp-ecosystem-card" key={item.slug} href={href(modulePath(item.slug))}><header><span className="wp-icon-tile"><Icon name={item.icon} size={24}/></span><Icon name="external" size={16}/></header><h2>{ne?item.ne:item.label}</h2><p>{item.description}</p><small>{item.group==="WORKSPACE"&&["research","alerts","workflows","privacy","consult","account"].includes(item.slug)?"ACCOUNT FEATURES":item.slug==="admin"?"VERIFIED ADMIN ACCESS":item.group==="WENS"?"SYMBOLIC EXPLORATION":item.group==="JYOTISH"?"CALCULATION & TRADITION":"EXPLORE WORLD PATRO"}</small></Link>)}</div>{items.length===0&&<div className="wp-empty">No matching tools. Try another term or category.</div>}
 </div>;
}
