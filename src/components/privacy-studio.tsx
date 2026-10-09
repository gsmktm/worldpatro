"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

type UserExport={
  exportedAt:string;
  backend:string;
  perCollectionLimit:number;
  partial:boolean;
  caveat:string;
  collections:Record<string,{items:Array<Record<string,unknown>>;truncated:boolean}>;
};
const COLLECTION_DESCRIPTIONS:Record<string,string>={
  birthProfiles:"Recorded birth date, time and place",
  savedReports:"Kundli, Panchang and WBE reports",
  researchNotebooks:"Private research workspaces",
  researchItems:"Saved research citations and notes",
  watchlists:"Subjects and topics followed",
  notifications:"Application notifications",
  workflowOrders:"Human-reviewed workflow tasks",
  agentRuns:"Private AI Conductor history"
};
export default function PrivacyStudio(){
  const [snapshot,setSnapshot]=useState<UserExport|null>(null);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [pending,startTransition]=useTransition();

  function load(){
    startTransition(async()=>{
      setError("");setMessage("");setSnapshot(null);
      try{
        const response=await fetch("/api/v1/account/export?limit=100",{cache:"no-store"});
        if(response.status===401)throw new Error("Sign in to view or export private account data.");
        if(!response.ok)throw new Error("Account data export is currently unavailable; an authenticated backend may still need activation.");
        const json=await response.json() as UserExport;
        setSnapshot(json);
        setMessage("Private data snapshot loaded in this browser; no export file has been created yet.");
      }catch(e){
        setError(e instanceof Error?e.message:"Failed to load data.");
      }
    });
  }
  function download(){
    if(!snapshot)return;
    const file=new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(file);
    const anchor=document.createElement("a");
    anchor.href=url;anchor.download="worldpatro-private-data-"+new Date().toISOString().slice(0,10)+".json";
    anchor.click();URL.revokeObjectURL(url);
    setMessage("JSON snapshot downloaded locally. Protect this file: it may contain sensitive birth information.");
  }
  return <section className="privacyStudio">
    <div className="privacyHero">
      <div className="eyebrow">ACCOUNT TRUST · YOUR INFORMATION</div>
      <h2>Privacy &amp; data control</h2>
      <p>View a bounded snapshot of application data that belongs to your signed-in account. Your birth time, birthplace, astrology reports and research notes are private information.</p>
      <div className="privacyActions">
        <button type="button" className="primaryBtn" onClick={load} disabled={pending}>{pending?"Checking account…":"Load my data inventory"}</button>
        <button type="button" className="ghost" disabled={!snapshot} onClick={download}>Export private JSON</button>
        <Link href="/login" className="ghost">Sign in</Link>
      </div>
    </div>
    {error&&<p className="privacyError" role="alert">{error}</p>}
    {message&&<p className="privacyNotice" role="status">{message}</p>}
    {snapshot&&<>
      <div className="privacyMeta">
        <div><span>Storage provider</span><strong>{snapshot.backend}</strong></div>
        <div><span>Exported</span><strong>{new Date(snapshot.exportedAt).toLocaleString()}</strong></div>
        <div><span>Coverage</span><strong>{snapshot.partial?"Partial (limit reached)":"Within indexed collection limits"}</strong></div>
      </div>
      <div className="privacyCollectionGrid">
        {Object.entries(snapshot.collections).map(([key,value])=><article key={key} className="privacyCollection">
          <span>{COLLECTION_DESCRIPTIONS[key]||"Private application records"}</span>
          <h3>{key}</h3>
          <strong>{value.items.length} records</strong>
          <small>{value.truncated?"More records exist; this snapshot is incomplete.":"No truncation within the selected query."}</small>
        </article>)}
      </div>
      <div className="privacyWarning"><b>Important export boundary</b><p>{snapshot.caveat}</p><p>The download includes the displayed records. Authentication-provider data, backups and unrelated connected services are outside this export.</p></div>
    </>}
    <div className="privacyHelp">
      <h3>Delete a saved Kundli report</h3>
      <p>World Patro already supports authenticated owner-only deletion of an individual saved chart. Open the Kundli Studio, select “My saved charts,” then confirm deletion of the particular report. This does not erase your complete account or upstream provider backups.</p>
      <Link href="/app/kundli">Manage saved Kundli reports →</Link>
    </div>
  </section>;
}
