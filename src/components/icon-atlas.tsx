"use client";

import Link from "next/link";
import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { MoonDisk, ZodiacVector } from "@/components/moon-vectors";
import { MOON_PHASES, MOON_RASHIS } from "@/lib/moon-timeline";
import { WORLD_ICON_GROUPS, type VectorIcon } from "@/lib/world-iconography";
import { useMoment } from "@/components/app-shell";

type GroupId="all"|"graha"|"nakshatra"|"calendar"|"panchang"|"tools"|"rashi"|"phase";
type ArtItem={key:string;name:string;ne:string;detail:string;kind:"line"|"rashi"|"phase";path?:string;index:number;phase?:number;illumination?:number};
const groupNames:Record<GroupId,{en:string;ne:string}>={
 all:{en:"All symbols",ne:"सबै चिह्न"},
 graha:{en:"Navagraha",ne:"नवग्रह"},
 nakshatra:{en:"27 Nakshatra",ne:"२७ नक्षत्र"},
 calendar:{en:"9 Calendars",ne:"नौ पात्रो"},
 panchang:{en:"Panchang",ne:"पञ्चाङ्ग"},
 tools:{en:"Daily tools",ne:"साधन"},
 rashi:{en:"12 Rāśi",ne:"बाह्र राशि"},
 phase:{en:"8 Moon phases",ne:"आठ चन्द्रकला"}
};
const phaseIllumination=[0,14.64,50,85.36,100,85.36,50,14.64] as const;
const sourceGroups:{group:GroupId;items:ArtItem[]}[]=[
 ...WORLD_ICON_GROUPS.map(group=>({
   group:group.id as GroupId,
   items:group.entries.map((item:VectorIcon,index:number)=>({
     key:group.id+"-"+item.id,name:item.name,ne:item.ne,detail:item.motif,kind:"line" as const,path:item.path,index
   }))
 })),
 {group:"rashi",items:MOON_RASHIS.map((item,index)=>({
   key:"rashi-"+item.english,name:item.english,ne:item.ne,detail:item.name+" · 30° equal sidereal signs",kind:"rashi" as const,index
 }))},
 {group:"phase",items:MOON_PHASES.map((item,index)=>({
   key:"phase-"+item.id,name:item.name,ne:item.ne,
   detail:"Illustrative moon phase · not a festival declaration",
   kind:"phase" as const,index,phase:item.degrees,illumination:phaseIllumination[index]
 }))}
];
const groups:GroupId[]=["all","rashi","graha","nakshatra","phase","calendar","panchang","tools"];
function AtlasSvg({item}:{item:ArtItem}){
 if(item.kind==="rashi")return <ZodiacVector index={item.index} size={68}/>;
 if(item.kind==="phase")return <MoonDisk phaseDegrees={item.phase??0} illuminationPercent={item.illumination??0} size={78}/>;
 return <svg viewBox="0 0 24 24" width="68" height="68" fill="none"
   stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"
   role="img" aria-label={item.name+" — original vector illustration"}>
   <path d={item.path||""}/>
 </svg>;
}
function IconCard({item,ne}:{item:ArtItem;ne:boolean}){
 const [copied,setCopied]=useState(false);
 async function copySvg(event:MouseEvent<HTMLButtonElement>){
   const markup=event.currentTarget.closest("article")?.querySelector("svg")?.outerHTML;
   if(!markup)return;
   try{
     await navigator.clipboard.writeText(markup);
     setCopied(true);
   }catch{
     setCopied(false);
   }
 }
 return <article className="atlas-card">
   <div className="atlas-card-art"><AtlasSvg item={item}/></div>
   <div className="atlas-card-heading"><strong>{ne?item.ne:item.name}</strong><small>{ne?item.name:item.ne}</small></div>
   <p>{item.detail}</p>
   <button type="button" className="atlas-copy" onClick={copySvg} aria-label={"Copy "+item.name+" SVG markup"}>
     <Icon name={copied?"check":"download"} size={14}/>{copied?(ne?"सारियो":"Copied"):(ne?"SVG प्रतिलिपि":"Copy SVG")}
   </button>
 </article>;
}
export default function IconAtlas(){
 const {moment,href}=useMoment(),ne=moment.locale==="ne";
 const [active,setActive]=useState<GroupId>("all");
 const [search,setSearch]=useState("");
 const query=search.trim().toLowerCase();
 const filtered=useMemo(()=>{
  const selected=sourceGroups.filter(g=>active==="all"||g.group===active).flatMap(g=>g.items);
  if(!query)return selected;
  return selected.filter(i=>[i.name,i.ne,i.detail,i.key].join(" ").toLowerCase().includes(query));
 },[active,query]);
 const total=sourceGroups.reduce((sum,g)=>sum+g.items.length,0);
 return <div className="atlas">
   <header className="atlas-hero">
     <div className="atlas-hero-copy">
       <span className="wp-overline">ॐ · WORLD PATRO / ORIGINAL SYMBOL SYSTEM</span>
       <h1>{ne?"विश्व पात्रोका मौलिक भेक्टर चिह्न":"Every symbol, one visual language."}</h1>
       <p>{ne?"नेपाली र विश्व पात्रोका लागि मौलिक SVG चिह्नहरू। धार्मिक परम्परा, खगोल र आधुनिक सञ्चारलाई सम्मान गर्दै एकरूप दृश्य प्रणाली।":"A research-led, original SVG language for Nepal's calendars, Jyotish, the Moon and the world's time traditions. Never a substitute for canonical religious iconography."}</p>
       <div className="atlas-summary"><span><b>{total}</b> {ne?"चिह्न":"vector icons"}</span><span><b>8</b> {ne?"समूह":"families"}</span><span>SVG · {ne?"कुनै अतिरिक्त फन्ट छैन":"no icon fonts"}</span></div>
     </div>
     <div className="atlas-mandala" aria-hidden="true"><div className="atlas-ring ring-a"/><div className="atlas-ring ring-b"/><div className="atlas-ring ring-c"/><span>ॐ</span><i>✦</i></div>
   </header>
   <div className="atlas-toolbar">
     <label htmlFor="atlas-search"><Icon name="search" size={18}/>
       <input id="atlas-search" type="search" value={search} onChange={event=>setSearch(event.target.value)}
         placeholder={ne?"राशि, नक्षत्र, सूर्य, चन्द्र खोज्नुहोस्…":"Search signs, stars, calendars and tools…"} />
     </label>
     <Link href={href("/app/moon")}><Icon name="moon" size={16}/>{ne?"चन्द्र वेधशाला":"Moon Studio"}</Link>
   </div>
   <div className="atlas-tabs" role="group" aria-label={ne?"चिह्न समूह":"Icon family"}>
    {groups.map(group=>{
     const count=group==="all"?total:sourceGroups.find(x=>x.group===group)?.items.length||0;
     return <button key={group} type="button" aria-pressed={active===group} onClick={()=>setActive(group)}>
       {ne?groupNames[group].ne:groupNames[group].en}<small>{count}</small>
     </button>;
    })}
   </div>
   <div className="atlas-content-title"><h2>{ne?groupNames[active].ne:groupNames[active].en}</h2><span role="status">{filtered.length} {ne?"उपलब्ध":"results"}</span></div>
   <div className="atlas-grid">{filtered.map(item=><IconCard item={item} key={item.key} ne={ne}/>)}</div>
   {filtered.length===0&&<p className="atlas-empty" role="status">{ne?"यो खोजमा चिह्न भेटिएन।":"No symbols match the search. Try another name."}</p>}
   <div className="atlas-boundary">
     <div><Icon name="fileCheck" size={20}/><h3>{ne?"अनुसन्धान र सीमाहरू":"Research and authenticity"}</h3></div>
     <p>{ne?"२७ नक्षत्रका आकृति विभिन्न संस्कृतिमा फरक देखिन्छन्। यहाँका आकृतिहरू परम्परागत सम्बन्धबाट प्रेरित मौलिक चित्रण हुन्, प्रमाणित सार्वभौम धार्मिक प्रतीक होइनन्। राहु–केतु खगोलीय चन्द्रनोडसँग सम्बन्धित अवधारणा हुन्।":"Nakshatra motifs are original editorial interpretations of associations that vary by region and text—not authoritative or universal religious emblems. Rahu and Ketu refer to lunar nodes; they are not physical planets."}</p>
     <p>{ne?"चन्द्रको आठ-चरण चित्रण दिशात्मक उदाहरण मात्र हो। चन्द्रमाको वास्तविक अवस्था तथा समयका लागि खगोलीय गणना हेर्नुहोस्।":"Moon icon orientation is illustrative, not a real observer camera view. Exact dates and phase times come from the Moon Observatory's astronomical calculation."}</p>
     <div className="atlas-source-links"><a href="https://www.drikpanchang.com/tutorials/nakshatra/nakshatra.html" rel="noopener noreferrer" target="_blank">Nakshatra list · Drik Panchang</a><a href="https://www.nepaljyotish.org/en/nakshatra-names/" rel="noopener noreferrer" target="_blank">Nepal Jyotish names</a><a href="https://design-system.w3.org/styles/svg-icons.html" rel="noopener noreferrer" target="_blank">W3C accessible SVG guidance</a></div>
   </div>
 </div>;
}
