"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMoment } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { VedicFeatureIcon } from "@/components/ui/vedic-feature-icon";
import { VEDIC_FEATURE_ICONS, VEDIC_FEATURE_SECTIONS, type VedicFeature } from "@/lib/vedic-feature-icons";

/** Reference-complete tool directory. A pictogram is not an implemented algorithm. */
export default function VedicFeatureDirectory(){
 const {moment,href}=useMoment(),ne=moment.locale==="ne";
 const [search,setSearch]=useState("");
 const q=search.trim().toLocaleLowerCase();
 const total=VEDIC_FEATURE_ICONS.length;
 const sections=useMemo(()=>VEDIC_FEATURE_SECTIONS.map(section=>({
  ...section,
  entries:section.entries.filter(item=>!q||[item.name,item.ne,item.motif].join(" ").toLocaleLowerCase().includes(q))
 })).filter(section=>section.entries.length),[q]);
 function card(item:VedicFeature){
  const title=ne?item.ne:item.name;
  const statusLabel=item.status==="available"?(ne?"मोड्युल उपलब्ध":"Available module"):
    item.status==="related"?(ne?"सम्बन्धित मोड्युल":"Related module"):
    (ne?"चिह्न मात्र":"Icon concept");
  const inner=<>
    <span className="vedic-feature-art"><span className="vedic-feature-mandala" aria-hidden="true"/>
      <VedicFeatureIcon id={item.id} size={39}/></span>
    <strong>{title}</strong>
    <small>{ne?item.name:item.ne}</small>
    <span className={"vedic-feature-status "+item.status}>{statusLabel}
      {item.href&&<Icon name="arrow" size={12}/>}</span>
  </>;
  return item.href?<Link key={item.id} className="vedic-feature-card" title={item.motif} href={href(item.href)} aria-label={title+" · "+statusLabel}>{inner}</Link>:
   <article key={item.id} className="vedic-feature-card" title={item.motif} aria-label={title+" · "+statusLabel}>{inner}</article>;
 }
 return <section className="vedic-feature-directory" aria-labelledby="vedic-feature-title">
   <header className="vedic-feature-heading">
    <div>
     <span className="wp-overline">ORIGINAL SVG · 41 VEDIC TOOL ICONS</span>
     <h2 id="vedic-feature-title">{ne?"वैदिक साधन र संस्कारका सम्पूर्ण चिह्न":"Every tool, its own symbol."}</h2>
     <p>{ne?"पात्रो, खगोल, ज्योतिष र संस्कारका ४१ मौलिक चिह्न। उपलब्ध साधन र भविष्यका अवधारणा स्पष्ट छुट्याइएका छन्।":
     "A complete, independently drawn icon set for 41 Vedic calendar, Jyotish and ritual feature categories. Available tools, related modules and icon-only concepts are labeled separately."}</p>
    </div>
    <Link href={href("/app/symbols")} className="vedic-feature-atlas-link">{ne?"सम्पूर्ण प्रतीक सङ्ग्रह":"See all icons"} <Icon name="arrow" size={16}/></Link>
   </header>
   <label className="vedic-feature-search"><Icon name="search" size={18}/>
    <input type="search" value={search} onChange={e=>setSearch(e.target.value)}
     aria-label={ne?"वैदिक चिह्न खोज":"Search Vedic tool icons"}
     placeholder={ne?"चौघडिया, ग्रहण, विवाह, तिथि, कुण्डली…":"Search Choghadiya, eclipse, wedding, tithi, chart…"}/>
    <span>{sections.reduce((sum,section)=>sum+section.entries.length,0)}/{total}</span>
   </label>
   {sections.map((section,index)=><div className="vedic-feature-section" key={section.id}>
      <div className="vedic-feature-section-label">
       <span>{String(index+1).padStart(2,"0")}</span><h3>{ne?section.ne:section.title}</h3>
       <small>{section.entries.length} {ne?"चिह्न":"symbols"}</small>
      </div>
      <div className="vedic-feature-grid">{section.entries.map(card)}</div>
   </div>)}
   {!sections.length&&<p className="vedic-feature-no-results" role="status">{ne?"यो नामको चिह्न फेला परेन।":"No icon matches this search."}</p>}
   <p className="vedic-feature-disclaimer">{ne?"यी मौलिक दृश्य-चिह्नहरू हुन्। चिह्न देखिँदैमा त्यसको शास्त्रीय गणना वा संस्कारको साइत उपलब्ध भएको मानिँदैन।":"Symbols communicate a topic, not a certified astronomical or ritual result. Icon concepts have no live tool; related modules do not imply the named algorithm is implemented."}</p>
 </section>;
}
