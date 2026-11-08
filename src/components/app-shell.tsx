"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { CITIES, defaultMoment, momentFromSearch, momentQuery, type Moment } from "@/lib/ui/moment";
import { NAV_ITEMS, NAV_GROUPS, modulePath } from "@/lib/navigation";

type ContextValue={moment:Moment;href:(path:string)=>string};
const MomentContext=createContext<ContextValue>({moment:defaultMoment(),href:p=>p});
export const useMoment=()=>useContext(MomentContext);

export function AppShell({children}:{children:ReactNode}){
  const pathname=usePathname(), search=useSearchParams(), router=useRouter();
  const searchValue=search.toString();
  const moment=useMemo(()=>momentFromSearch(new URLSearchParams(searchValue)),[searchValue]);
  const query=momentQuery(moment);
  const [theme,setTheme]=useState("night");
  const [now,setNow]=useState<Date|null>(null);
  const [online,setOnline]=useState(true);
  const [searchText,setSearchText]=useState("");
  const [openGroups,setOpenGroups]=useState(["DAILY","JYOTISH","EXPLORE"]);
  const searchDialog=useRef<HTMLDialogElement>(null), menuDialog=useRef<HTMLDialogElement>(null);
  const searchInput=useRef<HTMLInputElement>(null);
  const ne=moment.locale==="ne";
  const href=(path:string)=>{
    if(!path.startsWith("/app"))return path;
    const [base,hash]=path.split("#");
    return base+(base.includes("?")?"&":"?")+query+(hash?"#"+hash:"");
  };
  const active=pathname==="/"?NAV_ITEMS[0]:NAV_ITEMS.find(x=>modulePath(x.slug)===pathname)||NAV_ITEMS.find(x=>x.slug&&pathname.startsWith(modulePath(x.slug)+"/"));
  const city=CITIES.find(c=>Math.abs(c.lat-moment.lat)<.001&&Math.abs(c.lon-moment.lon)<.001);
  useEffect(()=>{
    let saved="night";
    try{saved=localStorage.getItem("worldpatro.theme.v1")==="day"?"day":"night";}catch{}
    setTheme(saved);document.documentElement.dataset.wpTheme=saved;
    const tick=()=>setNow(new Date());tick();
    const timer=setInterval(tick,1000);
    const connection=()=>setOnline(navigator.onLine);
    connection();window.addEventListener("online",connection);window.addEventListener("offline",connection);
    const shortcut=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch();}};
    window.addEventListener("keydown",shortcut);
    return()=>{clearInterval(timer);window.removeEventListener("online",connection);window.removeEventListener("offline",connection);window.removeEventListener("keydown",shortcut);};
  },[]);
  useEffect(()=>{searchDialog.current?.close();menuDialog.current?.close();setSearchText("");},[pathname,searchValue]);
  useEffect(()=>{if(active?.group)setOpenGroups(v=>v.includes(active.group)?v:[...v,active.group]);},[active?.group]);
  function openSearch(){searchDialog.current?.showModal();requestAnimationFrame(()=>searchInput.current?.focus());}
  function updateMoment(next:Moment){router.replace(pathname+"?"+momentQuery(next),{scroll:false});}
  function toggleTheme(){const next=theme==="night"?"day":"night";setTheme(next);document.documentElement.dataset.wpTheme=next;try{localStorage.setItem("worldpatro.theme.v1",next);}catch{}}
  function sidebar(mobile=false){
    return <>
      <Link href={href("/app")} className="wp-brand" onClick={()=>menuDialog.current?.close()}><span className="wp-brand-mark">ॐ</span><span><strong>World Patro<span className="wp-brand-dot">.</span></strong><small>NEPAL TO THE WORLD</small></span></Link>
      <Link className="wp-all-apps" href={href("/app/ecosystem")}><Icon name="grid" size={16}/>{ne?"सबै साधन हेर्नुहोस्":"Explore all apps"}<Icon name="arrow" size={13}/></Link>
      <nav aria-label={mobile?"All mobile modules":"Main navigation"} className="wp-navigation">
        {NAV_GROUPS.map(group=>{
          const isOpen=openGroups.includes(group.id);
          return <section key={group.id} className="wp-nav-group">
            <button type="button" className="wp-nav-heading" aria-expanded={isOpen} onClick={()=>setOpenGroups(v=>v.includes(group.id)?v.filter(g=>g!==group.id):[...v,group.id])}>{ne?group.ne:group.label}<Icon name="chevron" size={11} className={isOpen?"wp-rotate":""}/></button>
            {isOpen&&NAV_ITEMS.filter(n=>n.group===group.id).map(item=><Link key={item.slug} href={href(modulePath(item.slug))} className={"wp-nav-link"+(active?.slug===item.slug?" active":"")} aria-current={active?.slug===item.slug?"page":undefined}><Icon name={item.icon} size={18}/><span>{ne?item.ne:item.label}</span>{item.slug==="planner"&&<span className="wp-new">NEW</span>}{active?.slug===item.slug&&<i/>}</Link>)}
          </section>;
        })}
      </nav>
      <Link href={href("/app/wens")} className="wp-nav-feature"><span>ॐ</span><div><small>WBGR-109 · 1799 BS</small><strong>{ne?"सन्तुलनको खोजी":"Explore the equilibrium"}</strong></div><Icon name="arrow" size={15}/></Link>
      <div className="wp-side-footer"><span className="wp-status-dot"/><span>{ne?"हिमालयबाट, विश्वका लागि":"From the Himalayas, for the world"}</span><small><Link href={href("/app/system")}>WORLD PATRO V3 · SYSTEM STATUS ↗</Link></small></div>
    </>;
  }
  const results=NAV_ITEMS.filter(x=>[x.label,x.ne,x.description,x.slug].join(" ").toLowerCase().includes(searchText.toLowerCase())).slice(0,searchText?30:8);
  return <MomentContext.Provider value={{moment,href}}>
    <div className="os wp-os">
      <a className="skipToContent" href="#world-patro-main">Skip to main content</a>
      <aside className="side wp-sidebar">{sidebar()}</aside>
      <div className="osMain">
        <header className="topbar wp-topbar">
          <div className="wp-top-left"><button className="wp-icon-button wp-mobile-menu" onClick={()=>menuDialog.current?.showModal()} aria-label="Open all menus"><Icon name="menu"/></button><span className="wp-breadcrumb">World Patro <span>/</span> <b>{ne?active?.ne||"अन्वेषण":active?.label||"Explore"}</b></span></div>
          <button className="wp-search-trigger" onClick={openSearch}><Icon name="search" size={16}/><span>{ne?"खोज्नुहोस्…":"Search your universe…"}</span><kbd>⌘ K</kbd></button>
          <div className="wp-header-actions">
            <label className="wp-location"><Icon name="pin" size={15}/><span className="wp-sr-only">Selected city</span><select value={city?.id||"custom"} onChange={e=>{const c=CITIES.find(x=>x.id===e.target.value);if(c)updateMoment({...moment,lat:c.lat,lon:c.lon,tz:c.tz});}}>{!city&&<option value="custom">Custom location</option>}{CITIES.map(c=><option key={c.id} value={c.id}>{ne?c.ne:c.name}</option>)}</select></label>
            <button className="wp-language" onClick={()=>updateMoment({...moment,locale:ne?"en":"ne"})} aria-label={ne?"Switch navigation to English":"नेपाली मेनु छान्नुहोस्"}>{ne?"EN":"ने"}</button>
            <button className="wp-icon-button wp-theme-button" onClick={toggleTheme} aria-label={theme==="night"?"Use light appearance":"Use dark appearance"}><Icon name={theme==="night"?"sun":"moon"} size={18}/></button>
            <Link href={href("/app/account")} className="wp-profile" aria-label="My account"><Icon name="user" size={18}/></Link>
          </div>
        </header>
        {!online&&<div className="wp-offline" role="status">You are offline. Device planner and tools remain available while this page is open.</div>}
        <main id="world-patro-main" tabIndex={-1} className="workspace wp-workspace"><div key={query}>{children}</div></main>
        <footer className="wp-app-footer"><span>ॐ <b>World Patro</b> · Rooted in Nepal. Connected to the world.</span><span>{now?new Intl.DateTimeFormat("en-GB",{timeZone:moment.tz,hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(now):"—"} · {moment.tz}</span></footer>
        <nav className="mobileDock wp-mobile-dock" aria-label="Mobile navigation">
          {[["","home","Home","आज"],["patro","calendar","Calendar","पात्रो"],["festivals","leaf","Festivals","चाडपर्व"],["planner","bell","Planner","योजना"]].map(([slug,icon,en,np])=><Link key={slug} href={href(modulePath(slug))} aria-current={active?.slug===slug?"page":undefined}><Icon name={icon} size={21}/><small>{ne?np:en}</small></Link>)}
          <button onClick={()=>menuDialog.current?.showModal()}><Icon name="grid" size={21}/><small>{ne?"सबै":"Explore"}</small></button>
        </nav>
      </div>
      <dialog className="wp-search-dialog" ref={searchDialog} aria-labelledby="wp-search-title" onClick={e=>{if(e.target===e.currentTarget)searchDialog.current?.close();}}>
        <div className="wp-search-head"><Icon name="search" size={22}/><label className="wp-sr-only" id="wp-search-title" htmlFor="wp-command-input">Find a World Patro tool</label><input id="wp-command-input" ref={searchInput} value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder={ne?"पात्रो, कुण्डली, मुहूर्त…":"Find a tool, calendar or workspace…"} autoComplete="off"/><button className="wp-icon-button" aria-label="Close search" onClick={()=>searchDialog.current?.close()}><Icon name="close" size={18}/></button></div>
        <div className="wp-search-results"><p>{searchText?results.length+" RESULTS":"QUICK DESTINATIONS"}</p>{results.map(item=><Link key={item.slug} href={href(modulePath(item.slug))} onClick={()=>searchDialog.current?.close()}><span className="wp-search-icon"><Icon name={item.icon}/></span><span><strong>{ne?item.ne:item.label}</strong><small>{item.description}</small></span><Icon name="arrow" size={17}/></Link>)}{results.length===0&&<div className="wp-empty">No matching tools. Try “calendar”, “birth chart” or “sources”.</div>}</div><div className="wp-search-foot">Tab to move · Enter to open · Esc to close</div>
      </dialog>
      <dialog ref={menuDialog} className="wp-menu-dialog" aria-label="All World Patro menus"><button className="wp-menu-close wp-icon-button" aria-label="Close menus" onClick={()=>menuDialog.current?.close()}><Icon name="close"/></button>{sidebar(true)}</dialog>
    </div>
  </MomentContext.Provider>;
}
