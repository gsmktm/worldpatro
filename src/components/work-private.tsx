"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";

type ModuleKind="research"|"alerts"|"workflows"|"consult";
type Row=Record<string,unknown>&{id:string};
const CONFIG={
 research:{title:"Research Workspace",eyebrow:"EVIDENCE OS",intro:"Create private evidence notebooks, attach source-backed notes and inspect your own records. Publishing is a separate, reviewed process.",endpoint:"/api/v1/research/notebooks",key:"notebooks",label:"My research notebooks"},
 alerts:{title:"Watchlists & Alerts",eyebrow:"CHANGE & SIGNALS",intro:"Save monitoring topics and view account notifications. Delivery scheduling and condition-based checks require a running service.",endpoint:"/api/v1/watchlists",key:"watchlists",label:"My watchlists"},
 workflows:{title:"Order & Workflow Center",eyebrow:"HUMAN AUTHORIZATION",intro:"Draft work requests, advance through human-reviewed states and keep an auditable progression. A status change is not an external action.",endpoint:"/api/v1/workflows/orders",key:"orders",label:"My workflow orders"},
 consult:{title:"Astrologer Consultations",eyebrow:"CONSENT & APPOINTMENTS",intro:"Request a consultation with a short topic and chosen mode. Booking is a request, not confirmed availability or payment.",endpoint:"/api/v1/consultations",key:"consultations",label:"My consultation requests"}
} as const;
async function api(path:string,init?:RequestInit){
  const response=await fetch(path,{cache:"no-store",...init});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(payload.error||"Request unavailable.");
  return payload;
}
const asRows=(data:unknown):Row[]=>Array.isArray(data)?data as Row[]:[];
function human(s:unknown){return String(s??"").replaceAll("_"," ");}
const WORKFLOW_NEXT:Record<string,string[]>={
 draft:["review","cancelled"],review:["draft","approved","cancelled"],approved:["assigned","cancelled"],
 assigned:["active","cancelled"],active:["verify","cancelled"],verify:["active","closed"],closed:["archived"]
};
export default function PrivateWorkbench({kind}:{kind:ModuleKind}){
  const conf=CONFIG[kind];
  const [rows,setRows]=useState<Row[]>([]);
  const [secondary,setSecondary]=useState<Row[]>([]);
  const [selected,setSelected]=useState("");
  const [title,setTitle]=useState("");
  const [details,setDetails]=useState("");
  const [option,setOption]=useState(kind==="consult"?"chat":"normal");
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  const [status,setStatus]=useState<"loading"|"ready"|"login"|"setup">("loading");
  const [requestVersion,setRequestVersion]=useState(0);

  async function refresh(){
    setBusy(true);setError("");
    try{
      const payload=await api(conf.endpoint);
      setRows(asRows(payload[conf.key]));
      setStatus("ready");
      if(kind==="alerts"){
        const extra=await api("/api/v1/notifications");setSecondary(asRows(extra.notifications));
      }else if(kind==="consult"){
        const extra=await api("/api/v1/astrologers");setSecondary(asRows(extra.astrologers));
      }
    }catch(e){
      const message=e instanceof Error?e.message:"Unable to load.";
      setError(message);
      setStatus(/sign in|authenticat/i.test(message)?"login":"setup");
    }finally{setBusy(false);}
  }
  useEffect(()=>{void refresh();},[requestVersion]);
  async function create(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");setNotice("");
    const payload=kind==="research"?{title:title.trim(),description:details.trim()}:
      kind==="alerts"?{name:title.trim(),filters:{query:details.trim()},delivery:{channel:"in_app"},enabled:true}:
      kind==="workflows"?{title:title.trim(),description:details.trim(),priority:option}:
      {mode:option,topic:details.trim()||title.trim(),consentRecording:false};
    try{
      await api(conf.endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      setNotice(kind==="consult"?"Request submitted, not a confirmed booking.":"Record saved to your private account.");
      setTitle("");setDetails("");setRequestVersion(x=>x+1);
    }catch(e){setError(e instanceof Error?e.message:"Unable to save.");}
    finally{setBusy(false);}
  }
  async function addNote(){
    if(!selected||!details.trim())return;
    setBusy(true);setError("");setNotice("");
    try{
      await api("/api/v1/research/items",{
        method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({notebookId:selected,kind:"note",note:details.trim(),payload:{sourceRequired:true}})
      });
      setNotice("Evidence note added to the selected private notebook.");setDetails("");
      await loadItems(selected);
    }catch(e){setError(e instanceof Error?e.message:"Unable to add note.");}
    finally{setBusy(false);}
  }
  async function loadItems(id:string){
    setSelected(id);setError("");
    try{
      const data=await api("/api/v1/research/items?notebookId="+encodeURIComponent(id));
      setSecondary(asRows(data.items));
    }catch(e){setError(e instanceof Error?e.message:"Could not read notes.");}
  }
  async function updateRow(id:string,value:string){
    setBusy(true);setError("");setNotice("");
    try{
      if(kind==="workflows")await api("/api/v1/workflows/orders/"+encodeURIComponent(id),{
        method:"PATCH",headers:{"content-type":"application/json"},
        body:JSON.stringify({status:value,payload:{source:"owner_console",reviewed:true}})
      });
      else if(kind==="alerts")await api("/api/v1/notifications/"+encodeURIComponent(id),{
        method:"PATCH",headers:{"content-type":"application/json"},
        body:JSON.stringify({read:true,acknowledged:true})
      });
      setNotice("Account record updated.");setRequestVersion(x=>x+1);
    }catch(e){setError(e instanceof Error?e.message:"Update rejected.");}
    finally{setBusy(false);}
  }
  return <section className="moduleWorkbench">
    <div className="workHero"><div className="eyebrow">{conf.eyebrow} · WORLD PATRO</div><h1>{conf.title}</h1><p>{conf.intro}</p>
      <div className="workModuleLinks"><Link href="/app/agents">Agent Conductor ↗</Link><Link href="/app/privacy">My private data ↗</Link><Link href="/app/admin">Administration ↗</Link></div>
    </div>
    {status==="loading"&&<p className="workMuted" role="status">Checking your account and data store…</p>}
    {status==="login"&&<p className="workWarning">Sign in to use the private workspace. <Link href="/login">Open account →</Link></p>}
    {status==="setup"&&<p className="workWarning">The authenticated database is not active or this collection is unavailable. Public World Patro tools remain accessible. <Link href="/app/patro">Open Patro →</Link></p>}
    {error&&<p className="workError" role="alert">{error}</p>}
    {notice&&<p className="workSuccess" role="status">{notice}</p>}
    {kind==="consult"&&<section className="workPanel">
      <h2>Published experts</h2>
      {secondary.length?secondary.map(item=><div className="workListItem" key={item.id}><strong>{human(item.name)}</strong><span>{human(item.specialities)}</span></div>)
      :<p className="workMuted">No independently published consultation profiles available from the provider yet. Requests are not guaranteed appointments.</p>}
    </section>}
    <div className="workColumns">
      <article className="workPanel"><div className="eyebrow">CREATE · YOUR ACCOUNT</div>
        <h2>{kind==="consult"?"Request a consultation":"Create a private record"}</h2>
        <form className="workForm" onSubmit={create}>
          {kind!=="consult"&&<label>{kind==="alerts"?"Watchlist name":kind==="research"?"Notebook title":"Workflow title"}
            <input value={title} minLength={kind==="workflows"?3:1} maxLength={160} required onChange={e=>setTitle(e.target.value)}/></label>}
          <label>{kind==="consult"?"Consultation topic":kind==="alerts"?"Search topic or trigger":kind==="research"?"Notebook description":"Workflow description"}
            <textarea value={details} maxLength={kind==="research"?2000:1000} minLength={kind==="consult"?2:undefined} rows={5} required={kind==="alerts"||kind==="consult"}
              onChange={e=>setDetails(e.target.value)}/></label>
          {kind==="workflows"&&<label>Priority<select value={option} onChange={e=>setOption(e.target.value)}><option value="normal">Normal</option><option value="low">Low</option><option value="high">High</option><option value="critical">Critical</option></select></label>}
          {kind==="consult"&&<label>Session mode<select value={option} onChange={e=>setOption(e.target.value)}><option value="chat">Chat</option><option value="call">Call</option><option value="video">Video</option><option value="in_person">In person</option></select></label>}
          <button className="primaryBtn" type="submit" disabled={busy||status!=="ready"}>{busy?"Saving…":kind==="consult"?"Send consultation request":"Create record"}</button>
        </form>
        {kind==="research"&&selected&&<div className="workNoteCreator">
          <h3>Add a note to selected notebook</h3><p>Notebook: {selected}</p><button type="button" className="ghost" disabled={!details.trim()||busy} onClick={addNote}>Add current text as note</button>
        </div>}
      </article>
      <article className="workPanel"><div className="workPanelHead"><div><div className="eyebrow">USER-OWNED COLLECTION</div><h2>{conf.label}</h2></div>
        <button className="ghost" disabled={busy} onClick={()=>setRequestVersion(x=>x+1)}>Refresh</button></div>
        {status==="ready"&&!rows.length&&<p className="workMuted">No private records yet.</p>}
        <div className="workList">{rows.map(item=><article key={item.id} className="workListItem">
          <div><strong>{human(item.title??item.name??item.topic??"Record")}</strong><small>{human(item.status??(item.enabled===true?"enabled":"created"))} · {human(item.priority??item.mode??"")}</small></div>
          {kind==="research"&&<button className="ghost" onClick={()=>loadItems(item.id)}>View notes</button>}
          {kind==="workflows"&&<select aria-label="Next workflow state" value="" disabled={busy} onChange={e=>{if(e.target.value)void updateRow(item.id,e.target.value);}}>
            <option value="">Advance status…</option>{(WORKFLOW_NEXT[String(item.status||"draft")]||[]).map(v=><option key={v} value={v}>{human(v)}</option>)}</select>}
        </article>)}</div>
      </article>
    </div>
    {(kind==="research"||kind==="alerts")&&<section className="workPanel">
      <div className="eyebrow">{kind==="research"?"EVIDENCE NOTES":"PRIVATE NOTIFICATIONS"}</div>
      <h2>{kind==="research"?"Notes in selected notebook":"Notification inbox"}</h2>
      {kind==="research"&&!selected&&<p className="workMuted">Select a notebook to load its evidence records.</p>}
      {secondary.map((item,i)=><article className="workListItem" key={item.id||i}>
        <div><strong>{human(item.title??item.kind??"Notification")}</strong><span>{human(item.note??item.body??"")}</span></div>
        {kind==="alerts"&&<button className="ghost" disabled={busy||Boolean(item.acknowledgedAt||item.acknowledged_at)} onClick={()=>updateRow(item.id,"acknowledged")}>Acknowledge</button>}
      </article>)}
    </section>}
  </section>;
}
