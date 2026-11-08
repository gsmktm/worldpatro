"use client";
import Link from "next/link";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {useMoment} from "@/components/app-shell";
import {Icon} from "@/components/ui/icon";
import {PlannerInput,PLANNER_STORAGE_KEY,readDeviceEvents,type PlannerEvent,type PlannerValues} from "@/lib/planner";
import {eventsToIcs} from "@/lib/ical";
import {downloadText} from "@/lib/ui/download";
export default function PlannerStudio(){
 const {moment,href}=useMoment(),ne=moment.locale==="ne";
 const [scope,setScope]=useState<"device"|"account">("device"),[events,setEvents]=useState<PlannerEvent[]>([]),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[error,setError]=useState("");
 const [form,setForm]=useState<PlannerValues>({title:"",date:moment.date,category:"personal",notes:"",completed:false}),[filter,setFilter]=useState("all"),[query,setQuery]=useState(""),[editId,setEditId]=useState<string|null>(null);
 const accountLoaded=useRef(false);
 useEffect(()=>{
  let device:PlannerEvent[]=[];
  try{device=readDeviceEvents(localStorage.getItem(PLANNER_STORAGE_KEY));}catch{setError("This browser does not permit device storage. Account storage is available after sign-in.");}
  setEvents(device);setReady(true);
  const q=new URLSearchParams(window.location.search);const input=PlannerInput.safeParse({...form,title:q.get("title")||"",date:q.get("eventDate")||moment.date,category:q.get("category")||"personal"});
  if(input.success)setForm(input.data);
 },[]);
 async function changeScope(next:"device"|"account"){
  setError("");setNotice("");setEditId(null);accountLoaded.current=false;setScope(next);setEvents([]);
  if(next==="device"){try{setEvents(readDeviceEvents(localStorage.getItem(PLANNER_STORAGE_KEY)));}catch{setError("Device storage is unavailable.");}return;}
  setBusy(true);
  try{const r=await fetch("/api/v1/planner",{cache:"no-store"}),d=await r.json();if(!r.ok)throw new Error(r.status===401?"Sign in to use your account planner.":d.error||"Account planner unavailable.");setEvents(d.events||[]);accountLoaded.current=true;setNotice("Account events loaded. Device events stay on this device.");}
  catch(e){setError(e instanceof Error?e.message:"Unable to load account planner.");}finally{setBusy(false);}
 }
 function saveDevice(next:PlannerEvent[]){
  try{localStorage.setItem(PLANNER_STORAGE_KEY,JSON.stringify(next));setEvents(next);return true;}
  catch{setError("Unable to save to this device. Export your events before closing this page.");return false;}
 }
 async function submit(e:FormEvent){e.preventDefault();setError("");setNotice("");
  const parsed=PlannerInput.safeParse(form);if(!parsed.success){setError(parsed.error.issues[0]?.message||"Check your event.");return;}
  if(scope==="device"){
   if(!editId&&events.length>=500){setError("This device holds 500 events. Export or remove an event before adding another.");return;}
   const event={...parsed.data,id:editId||crypto.randomUUID(),createdAt:events.find(x=>x.id===editId)?.createdAt||new Date().toISOString()};
   if(!saveDevice(editId?events.map(x=>x.id===editId?event:x):[event,...events]))return;
  }else{
   if(!accountLoaded.current){setError("Load your account events successfully before saving.");return;}
   setBusy(true);
   try{const r=await fetch("/api/v1/planner"+(editId?"/"+encodeURIComponent(editId):""),{method:editId?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(parsed.data)}),d=await r.json();if(!r.ok)throw new Error(d.error||"Could not save event.");setEvents(v=>editId?v.map(x=>x.id===editId?d.event:x):[d.event,...v]);}
   catch(e){setError(e instanceof Error?e.message:"Unable to save.");return;}finally{setBusy(false);}
  }
  setNotice(editId?"Event updated.":"Event saved "+(scope==="device"?"on this device.":"to your account."));setEditId(null);setForm({...form,title:"",notes:"",completed:false});
 }
 async function toggle(event:PlannerEvent){
  setError("");setNotice("");
  const values:PlannerValues={title:event.title,date:event.date,category:event.category,notes:event.notes,completed:!event.completed};
  if(scope==="device"){saveDevice(events.map(x=>x.id===event.id?{...x,completed:!x.completed}:x));return;}
  setBusy(true);try{const r=await fetch("/api/v1/planner/"+encodeURIComponent(event.id),{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(values)}),d=await r.json();if(!r.ok)throw new Error(d.error||"Update failed.");setEvents(v=>v.map(x=>x.id===event.id?d.event:x));}catch(e){setError(e instanceof Error?e.message:"Update failed.");}finally{setBusy(false);}
 }
 async function remove(event:PlannerEvent){
  setError("");setNotice("");
  if(scope==="device"){if(saveDevice(events.filter(x=>x.id!==event.id)))setNotice("Event removed from this device.");return;}
  setBusy(true);try{const r=await fetch("/api/v1/planner/"+encodeURIComponent(event.id),{method:"DELETE"}),d=await r.json();if(!r.ok)throw new Error(d.error||"Deletion failed.");setEvents(v=>v.filter(x=>x.id!==event.id));setNotice("Event removed from your account.");}catch(e){setError(e instanceof Error?e.message:"Deletion failed.");}finally{setBusy(false);}
 }
 function edit(event:PlannerEvent){setEditId(event.id);setForm({title:event.title,date:event.date,category:event.category,notes:event.notes,completed:event.completed});document.getElementById("planner-title")?.focus();}
 const visible=events.filter(e=>(filter==="all"||(filter==="upcoming"?e.date>=moment.date&&!e.completed:e.completed))&&[e.title,e.notes,e.category].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.date.localeCompare(b.date));
 return <div className="wp-page-stack"><div className="wp-page-intro"><div><div className="wp-overline">A LITTLE INTENTION GOES A LONG WAY</div><h1>{ne?"महत्त्वपूर्ण क्षणका लागि ठाउँ।":"Make room for what matters."}</h1><p>Personal days, family occasions and plans. Keep them close.</p></div><span className="wp-chip"><Icon name="shield" size={13}/>{scope==="device"?"Stored on this device":"Private account storage"}</span></div>
  <div className="wp-two-col"><section className="wp-panel">
   <div className="wp-section-head"><h2>{editId?"Edit your event":"A plan starts here"}</h2><Icon name="calendar" size={22}/></div>
   <div className="wp-tab-row"><button disabled={busy} aria-pressed={scope==="device"} onClick={()=>changeScope("device")}>This device</button><button disabled={busy} aria-pressed={scope==="account"} onClick={()=>changeScope("account")}>My account</button></div>
   <p className="wp-source-caption">{scope==="device"?"Device events use browser storage. Export a copy for safekeeping.":"Account mode uses your verified Supabase session. Your device events are not uploaded."} No email or push reminders are scheduled.</p>
   <form className="wp-form" onSubmit={submit}><label htmlFor="planner-title">What would you like to remember?<input id="planner-title" value={form.title} maxLength={160} required placeholder="A family day, a new beginning…" onChange={e=>setForm({...form,title:e.target.value})}/></label>
   <div className="wp-form-grid"><label>Date<input type="date" value={form.date} min="1900-01-01" max="2100-12-31" required onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value as PlannerValues["category"]})}><option value="personal">Personal</option><option value="family">Family</option><option value="work">Work</option><option value="festival">Festival</option></select></label></div>
   <label>Notes <textarea value={form.notes} maxLength={2000} placeholder="A little context for your future self." onChange={e=>setForm({...form,notes:e.target.value})}/></label><button className="wp-button wp-button-gold" type="submit" disabled={busy||!ready}>{busy?"Saving…":editId?"Update event":"Save this moment"}<Icon name="plus" size={16}/></button>
   {editId&&<button className="wp-button" type="button" onClick={()=>{setEditId(null);setForm({...form,title:"",notes:"",completed:false});}}>Cancel editing</button>}</form>
   {error&&<p className="wp-notice wp-error" role="alert">{error} {scope==="account"&&<Link href="/login">Sign in →</Link>}</p>}{notice&&<p className="wp-notice" role="status">{notice}</p>}
  </section>
  <section className="wp-panel"><div className="wp-section-head"><div><div className="wp-overline">YOUR PERSONAL TIMELINE</div><h2>Your moments</h2></div><button className="wp-icon-button" disabled={!events.length||busy} onClick={()=>{downloadText("worldpatro-planner.ics",eventsToIcs(events),"text/calendar;charset=utf-8");setNotice("Calendar exported. Import the .ics file into your calendar app.");}} aria-label="Export all events as a calendar"><Icon name="download" size={20}/></button></div>
   <div className="wp-planner-stats"><span><b>{events.length}</b> moments</span><span><b>{events.filter(e=>e.date>=moment.date&&!e.completed).length}</b> coming up</span><span><b>{events.filter(e=>e.completed).length}</b> completed</span></div>
   <div className="wp-tab-row">{[["all","All moments"],["upcoming","Coming up"],["done","Completed"]].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div>
   <div className="wp-filter"><Icon name="search" size={17}/><input aria-label="Search your events" className="wp-field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a moment…"/></div>
   {busy&&!events.length?<p className="wp-empty" role="status">Loading your events…</p>:visible.length?visible.map(event=><article key={event.id} className={"wp-event-row"+(event.completed?" is-done":"")}><button className="wp-event-check" disabled={busy} aria-pressed={event.completed} aria-label={(event.completed?"Mark incomplete: ":"Complete: ")+event.title} onClick={()=>toggle(event)}>{event.completed&&<Icon name="check" size={15}/>}</button><div><h3>{event.title}</h3><div className="wp-event-meta"><time>{event.date}</time><span>· {event.category}</span><Link href={href("/app/patro").replace(/date=[^&]+/,"date="+event.date)}>View day ↗</Link></div>{event.notes&&<p>{event.notes}</p>}<button className="wp-text-link" style={{background:"none",border:0,padding:"5px 0 0"}} onClick={()=>edit(event)}>Edit event</button></div><button className="wp-icon-button" disabled={busy} onClick={()=>remove(event)} aria-label={"Remove "+event.title}><Icon name="trash" size={16}/></button></article>):<div className="wp-empty-state"><Icon name="calendar" size={32}/><h3>Your next chapter is open.</h3><p>Add a moment, or explore the festival calendar.</p><Link href={href("/app/festivals")} className="wp-text-link">Find a festival <Icon name="arrow" size={16}/></Link></div>}
   <div className="wp-filter"><button className="wp-button" disabled={!events.length} onClick={()=>{downloadText("worldpatro-planner.json",JSON.stringify({version:1,scope,exportedAt:new Date().toISOString(),events},null,2),"application/json");setNotice("Your planner backup has been exported.");}}><Icon name="download" size={15}/>Export backup</button><Link className="wp-text-link" href={href("/app/privacy")}>Account privacy <Icon name="arrow" size={15}/></Link></div>
  </section></div></div>;
}
