"use client";

import { useMemo, useState } from "react";
import { GATES, GRAHAS, POWERS, TRADITIONS } from "@/lib/wbe";
import { WBGR,wbgrGateCode,displayWbgrGate } from "@/lib/wbgr";

const PAGE_SIZE = 24;

export default function GatesStudio() {
  const [q,setQ]=useState("");
  const [tradition,setTradition]=useState(-1);
  const [graha,setGraha]=useState(-1);
  const [power,setPower]=useState(-1);
  const [anchorsOnly,setAnchorsOnly]=useState(false);
  const [page,setPage]=useState(1);
  const [selectedCode,setSelectedCode]=useState("WBE-01-01-01");

  const filtered=useMemo(()=>GATES.filter((item,index)=>{
    const t=Math.floor(index/81),g=Math.floor((index%81)/9),p=index%9;
    return (tradition<0||t===tradition)
      &&(graha<0||g===graha)
      &&(power<0||p===power)
      &&(!anchorsOnly||item.anchor)
      &&(!q.trim()||[item.code,wbgrGateCode(item.code),item.tradition,item.graha,item.power,item.domain].some(v=>v.toLowerCase().includes(q.toLowerCase().trim())));
  }),[q,tradition,graha,power,anchorsOnly]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const current=Math.min(page,pageCount);
  const visible=filtered.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE);
  const selected=GATES.find(g=>g.code===selectedCode);

  function setFilter(fn:()=>void){fn();setPage(1);}
  return <section className="gatesExplorer">
    <div className="gatesSummary"><div><div className="eyebrow">{WBGR.title}</div><h2>WBGR-109 Gate Explorer</h2><p>WENS edition, designated 1799 BS. This existing engine has 729 generated symbolic combinations and nine keynote anchors; 1799 BS is not the count of gates or an officially verified calendar date.</p></div><strong>9³</strong></div>
    <div className="gatesFilter">
      <label>Search gates<input value={q} onChange={e=>setFilter(()=>setQ(e.target.value))} placeholder="Search by code, tradition, graha or theme" /></label>
      <label>Tradition<select value={tradition} onChange={e=>setFilter(()=>setTradition(Number(e.target.value)))}>
        <option value={-1}>All 9 traditions</option>{TRADITIONS.map((t,i)=><option key={t} value={i}>{t}</option>)}
      </select></label>
      <label>Graha<select value={graha} onChange={e=>setFilter(()=>setGraha(Number(e.target.value)))}>
        <option value={-1}>All 9 grahas</option>{GRAHAS.map(([n],i)=><option key={n} value={i}>{n}</option>)}
      </select></label>
      <label>Power<select value={power} onChange={e=>setFilter(()=>setPower(Number(e.target.value)))}>
        <option value={-1}>All 9 themes</option>{POWERS.map((p,i)=><option key={p} value={i}>{p}</option>)}
      </select></label>
      <label className="gatesCheck"><input type="checkbox" checked={anchorsOnly} onChange={e=>setFilter(()=>setAnchorsOnly(e.target.checked))}/> Nine keynote gates only</label>
    </div>
    <div className="gatesMain">
      <div className="gatesResults">
        <div className="gatesMeta">{filtered.length} gates match · page {current} / {pageCount}</div>
        <div className="gatesGrid">{visible.map(item=><button key={item.code} className="gateTile" type="button" aria-pressed={selectedCode===item.code} onClick={()=>setSelectedCode(item.code)}>
          <span>{wbgrGateCode(item.code)}{item.anchor?" · KEYNOTE":""}</span><strong>{item.power}</strong><small>{item.graha}</small><small>{item.tradition}</small>
        </button>)}</div>
        {filtered.length===0 && <p role="status">No matching gates. Change or clear the filters.</p>}
        <div className="gatesPagination">
          <button type="button" disabled={current<=1} onClick={()=>setPage(current-1)}>← Previous</button>
          <span>{current} / {pageCount}</span>
          <button type="button" disabled={current>=pageCount} onClick={()=>setPage(current+1)}>Next →</button>
        </div>
      </div>
      <aside className="gateDetail">
        <div className="eyebrow">SELECTED GATE</div>
        <h3>{selected?wbgrGateCode(selected.code):"—"}</h3>
        <div><span>Tradition</span><b>{selected?.tradition}</b></div>
        <div><span>Graha</span><b>{selected?.graha}</b></div>
        <div><span>Power/theme</span><b>{selected?.power}</b></div>
        <div><span>World domain</span><b>{selected?.domain}</b></div>
        <p>A thematic lens for discussion or self-reflection. This combination does not assert that a faith is governed by a planetary body.</p>
        <button type="button" className="ghost" onClick={()=>{
          if(selected) navigator.clipboard?.writeText(JSON.stringify(displayWbgrGate(selected),null,2));
        }}>Copy this gate</button>
      </aside>
    </div>
  </section>;
}
