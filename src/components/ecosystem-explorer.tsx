"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useMoment} from "@/components/app-shell";
import {NAV_ITEMS,NAV_GROUPS,modulePath} from "@/lib/navigation";
import {Icon} from "@/components/ui/icon";

type ModuleStatus={slug:string;availability:string;note:string;implementation:string};
type Inventory={total:number;modules:ModuleStatus[];caveat:string};
const STATUS:Record<string,{en:string;ne:string}>={
 available:{en:"Core interface",ne:"मुख्य साधन"},
 "requires-database":{en:"Database required",ne:"डाटाबेस आवश्यक"},
 "requires-database-verification":{en:"Database unverified",ne:"डाटाबेस अप्रमाणित"},
 "requires-admin-role":{en:"Admin access",ne:"प्रशासकीय अनुमति"},
 "requires-ai-access":{en:"AI access required",ne:"एआई पहुँच आवश्यक"},
 "requires-published-sources":{en:"Source-limited",ne:"स्रोत सीमित"}
};
export default function EcosystemExplorer(){
 const {moment,href}=useMoment(),ne=moment.locale==="ne";
 const [query,setQuery]=useState(""),[group,setGroup]=useState("all"),[gate,setGate]=useState("all");
 const [inventory,setInventory]=useState<Inventory|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 async function load(signal?:AbortSignal){
  setLoading(true);setError("");
  try{
   const response=await fetch("/api/v1/platform/modules",{cache:"no-store",signal});
   if(!response.ok)throw new Error("Module status unavailable.");
   const data:Inventory=await response.json();
   if(!signal?.aborted)setInventory(data);
  }catch{
   if(!signal?.aborted)setError(ne?"स्थिति जाँच उपलब्ध छैन। पृष्ठहरू खोल्न सकिन्छ।":"Cannot verify module status. Navigation remains available.");
  }finally{
   if(!signal?.aborted)setLoading(false);
  }
 }
 useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[]);
 const bySlug=new Map(inventory?.modules.map(item=>[item.slug,item])||[]);
 const items=NAV_ITEMS.filter(item=>{
  if(!item.slug)return false;
  if(group!=="all"&&item.group!==group)return false;
  if(![item.label,item.ne,item.description].join(" ").toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()))return false;
  const status=bySlug.get(item.slug)?.availability;
  return gate==="all"||!inventory||(gate==="core"?status==="available":status!=="available");
 });
 const available=inventory?.modules.filter(item=>item.availability==="available").length||0;
 const gated=(inventory?.total||0)-available;
 return <div className="wp-page-stack">
   <div className="wp-page-intro"><div><div className="wp-overline">ॐ · ONE CONNECTED WORLD PATRO</div>
    <h1>{ne?"तपाईंको सम्पूर्ण संसार।":"Every World Patro module."}</h1>
    <p>{ne?"नेपालबाट विश्वसम्म — पात्रो, पञ्चाङ्ग, वेधशाला, ज्ञान र व्यक्तिगत साधनहरू। कुन सुविधा तयार छ र कुनमा प्रमाणित पहुँच चाहिन्छ, यहाँ छुट्टै देखिन्छ।":
     "Nepal to the world: calendars, astronomy, research and everyday tools. Explore every route, with clear boundaries between usable interfaces and services needing verified access."}</p>
   </div><Link className="wp-button" href={href("/app/system")}><Icon name="shield" size={16}/>{ne?"प्रणाली जाँच":"System status"}</Link></div>
   <div className="wp-module-summary" aria-live="polite">
     <span><strong>{inventory?.total??NAV_ITEMS.filter(x=>x.slug).length}</strong>{ne?"उपलब्ध पृष्ठ":"module pages"}</span>
     <span><strong>{inventory?available:"—"}</strong>{ne?"मुख्य साधन":"core interfaces"}</span>
     <span><strong>{inventory?gated:"—"}</strong>{ne?"थप पुष्टि आवश्यक":"need verification"}</span>
   </div>
   <div className="wp-filter wp-module-filters">
     <label htmlFor="ecosystem-search" className="wp-sr-only">{ne?"साधन खोज":"Search modules"}</label>
     <Icon name="search" size={16}/>
     <input id="ecosystem-search" className="wp-field" type="search" value={query} onChange={e=>setQuery(e.target.value)}
      placeholder={ne?"पात्रो, राशि, चन्द्र, अनुसन्धान…":"Find calendars, astrology, sources…"}/>
     <label htmlFor="ecosystem-group" className="wp-sr-only">{ne?"समूह":"Category"}</label>
     <select id="ecosystem-group" className="wp-field" value={group} onChange={e=>setGroup(e.target.value)}>
      <option value="all">{ne?"सबै समूह":"All categories"}</option>
      {NAV_GROUPS.map(g=><option key={g.id} value={g.id}>{ne?g.ne:g.label}</option>)}
     </select>
     <label htmlFor="ecosystem-status" className="wp-sr-only">{ne?"सुविधाको अवस्था":"Availability"}</label>
     <select id="ecosystem-status" className="wp-field" value={gate} onChange={e=>setGate(e.target.value)} disabled={!inventory}>
      <option value="all">{ne?"सबै अवस्था":"All readiness levels"}</option>
      <option value="core">{ne?"मुख्य साधन":"Core interfaces"}</option>
      <option value="gated">{ne?"पुष्टि आवश्यक":"Verification needed"}</option>
     </select>
     <button type="button" className="wp-module-refresh" onClick={()=>void load()} disabled={loading}>
      <Icon name="refresh" size={14}/>{ne?"पुनः जाँच":"Refresh"}</button>
   </div>
   {error&&<p className="wp-module-error" role="alert">{error}</p>}
   <p className="wp-module-caveat">{ne?
     "‘मुख्य साधन’ भन्नाले पृष्ठ र यसको मुख्य कार्यको स्रोत उपलब्ध छ भन्ने जनाउँछ। डाटाबेस, खाता, बाह्य स्रोत र प्रकाशनको पूर्ण प्रमाणिकरण छुट्टै आवश्यक छ।":
     "Core interface means the route and primary implementation exist; it does not certify live providers, sign-in, private database writes or full religious data coverage."}</p>
   <div className="wp-ecosystem-grid">
    {items.map(item=>{
      const mod=bySlug.get(item.slug);
      const label=mod?STATUS[mod.availability]?.[ne?"ne":"en"]||mod.availability:loading?(ne?"जाँच हुँदै":"Checking status"):(ne?"अप्रमाणित":"Status unverified");
      return <Link className="wp-ecosystem-card wp-module-card" key={item.slug} href={href(modulePath(item.slug))}>
       <header><span className="wp-icon-tile"><Icon name={item.icon} size={24}/></span><Icon name="external" size={16}/></header>
       <h2>{ne?item.ne:item.label}</h2><p>{item.description}</p>
       <span className="wp-module-state" data-state={mod?.availability||"unknown"}>{label}</span>
       <small>{mod?(ne?item.description:mod.note):ne?"सञ्चालनको अवस्था पुष्टि हुँदै":"Detailed status will be shown when available"}</small>
      </Link>;
    })}
   </div>
   {items.length===0&&<p className="wp-empty" role="status">{ne?"यो खोजमा साधन भेटिएन।":"No matching modules. Try a different search or filter."}</p>}
 </div>;
}
