"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ANCHORS, assessWbe, GRAHAS, POWERS, TRADITIONS } from "@/lib/wbe";

const CHANNELS = [
  { short:"Surya", glyph:"☉", color:"#eebc66", note:"Dharma · right order", action:"Clarify one responsibility; serve with accountability." },
  { short:"Chandra", glyph:"☽", color:"#86d8dc", note:"Wu Wei · receptive flow", action:"Listen carefully, reduce pressure, protect shared resources." },
  { short:"Mangala", glyph:"♂", color:"#e67d6f", note:"Seva · fearless service", action:"Convert urgency into a practical act of service." },
  { short:"Budha", glyph:"☿", color:"#91c99f", note:"Chokhmah · wisdom", action:"Question assumptions; check sources before deciding." },
  { short:"Guru", glyph:"♃", color:"#e4c685", note:"Tawhid · unity", action:"Name the common good and a fair next step." },
  { short:"Shukra", glyph:"♀", color:"#dfa4ce", note:"Agape · care", action:"Offer sincere care without removing boundaries." },
  { short:"Shani", glyph:"♄", color:"#8f9acb", note:"Tapas · discipline", action:"Choose one sustainable commitment and uphold it." },
  { short:"Rahu", glyph:"☊", color:"#a9a0ee", note:"Asha · truth", action:"Examine incentives; distinguish evidence from speculation." },
  { short:"Ketu", glyph:"☋", color:"#a6dbc0", note:"Liberation · letting go", action:"Release one unnecessary demand or distraction." }
] as const;

const PAIRS = [
  { left:0, right:6, text:"Light ↔ limits" },
  { left:4, right:3, text:"Vision ↔ analysis" },
  { left:5, right:2, text:"Harmony ↔ force" },
  { left:1, right:0, text:"Mind ↔ soul" },
  { left:7, right:8, text:"Desire ↔ release" }
];

const initial = [6, 6, 6, 6, 6, 6, 6, 6, 6];

function point(i: number, radius: number) {
  const angle = -Math.PI / 2 + (i * Math.PI * 2) / 9;
  return { x: 300 + radius * Math.cos(angle), y: 300 + radius * Math.sin(angle) };
}

function numericSnapshot(scores: number[]) {
  const assessed = assessWbe(scores);
  return {
    framework:"WBE-9 symbolic / self-reported reflection",
    createdAt:new Date().toISOString(),
    scores,
    assessment:assessed,
    notice:"These figures express a user's chosen reflection, not measured planetary or national conditions."
  };
}

export default function WbeStudio() {
  const [scores, setScores] = useState<number[]>(initial);
  const [selected, setSelected] = useState(0);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Array<{id:string;title:string;scores:number[];createdAt:string|null}>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState("");
  const [locale, setLocale] = useState<"en" | "ne">("en");
  const assessment = useMemo(() => assessWbe(scores), [scores]);
  const mean = scores.reduce((acc, n) => acc+n,0)/9;
  const mostNeeded = assessment.filter(x=>x.score < 4);
  const overextended = assessment.filter(x=>x.score > 8);
  const node = CHANNELS[selected];
  const path = scores.map((s,i) => {
    const p = point(i, Math.max(2,s)*19);
    return String(p.x)+","+String(p.y);
  }).join(" ");

  function update(index:number, value:number) {
    setScores(prev=> prev.map((current,i)=>i===index?value:current));
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response=await fetch("/api/v1/wbe/snapshots",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({title:"WBE-9 personal reflection",scores})
      });
      if(response.status===401) {
        setMessage("Sign in to save this reflection to your account.");
      } else if(!response.ok) {
        setMessage("Storage is not active or a save failed. Use Export JSON for a local copy.");
      } else {
        setMessage("Saved privately to your account.");
        await loadHistory(true);
      }
    } catch {
      setMessage("Storage is unavailable. Export a local copy instead.");
    } finally {setSaving(false);}
  }

  async function loadHistory(silent=false) {
    setLoadingHistory(true);
    try {
      const response=await fetch("/api/v1/wbe/snapshots",{cache:"no-store"});
      if(response.status===401){
        if(!silent)setMessage("Sign in to read your saved reflections.");
      } else if(!response.ok) {
        if(!silent)setMessage("Account storage is not available yet.");
      } else {
        const body=await response.json();
        const rows=Array.isArray(body.snapshots)?body.snapshots:[];
        setHistory(rows);
        if(!silent)setMessage(rows.length?String(rows.length)+" saved reflections loaded.":"No saved reflections yet.");
      }
    } catch {
      if(!silent)setMessage("Could not load account history.");
    } finally {setLoadingHistory(false);}
  }

  function restore(entry:{scores:number[];title:string}) {
    if(entry.scores.length===9&&entry.scores.every(v=>Number.isInteger(v)&&v>=0&&v<=10)){
      setScores([...entry.scores]);
      setSelected(0);
      setMessage("Loaded “"+entry.title+"” from your account. Saving again creates a new private snapshot.");
    }
  }

  function exportJson() {
    const data = JSON.stringify(numericSnapshot(scores),null,2);
    const url = URL.createObjectURL(new Blob([data],{type:"application/json"}));
    const link = document.createElement("a");
    link.href=url;
    link.download="worldpatro-wbe9-reflection.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Local reflection exported; no server action was performed.");
  }

  return <section className="wbeStudio" aria-label="Ninefold balance studio">
    <div className="wbeIntro">
      <div>
        <div className="eyebrow">WBE-9 · 9 × 9 × 9</div>
        <h2>Nine spokes. One still center.</h2>
        <p>Adapted from the uploaded Cosmic Balance design: a symbolic interfaith mandala for reflection, never a scientific claim or a doctrine about any religion.</p>
      </div>
      <div className="wbeStat"><strong>729</strong><span>comparative gates</span></div>
    </div>

    <div className="wbeControlsTop">
      <div className="wbeSegment" aria-label="Language">
        <button type="button" aria-pressed={locale==="en"} onClick={()=>setLocale("en")}>English</button>
        <button type="button" aria-pressed={locale==="ne"} onClick={()=>setLocale("ne")}>नेपाली</button>
      </div>
      <div className="wbeFootnote">All traditions are equal; pairings are thematic choices, not religious rulership.</div>
    </div>

    <div className="wbeStage">
      <div className="wbeWheel" role="group" aria-label="Nine interactive thematic spokes">
        <svg viewBox="0 0 600 600" aria-hidden="true" className="wbeWheelSvg">
          <defs>
            <radialGradient id="wbe-glow"><stop stopColor="#d6a752" stopOpacity=".22"/><stop offset="1" stopColor="#d6a752" stopOpacity="0"/></radialGradient>
          </defs>
          <circle cx="300" cy="300" r="285" fill="url(#wbe-glow)"/>
          {[55,114,175,238].map(r=><circle key={r} cx="300" cy="300" r={r} fill="none" stroke="#b99655" strokeOpacity=".22" strokeDasharray={r===238?"6 7":"2 6"}/>)}
          {CHANNELS.map((entry,i)=>{
            const a=point(i,238);
            return <line key={entry.short} x1="300" y1="300" x2={a.x} y2={a.y} stroke={entry.color} strokeOpacity={selected===i?.65:.22} strokeWidth={selected===i?2:1}/>;
          })}
          <polygon points={path} fill="#d7a94f" fillOpacity=".17" stroke="#e7c477" strokeWidth="2"/>
          {scores.map((value,i)=>{
            const p=point(i,Math.max(2,value)*19);
            return <circle key={i} cx={p.x} cy={p.y} r={selected===i?7:4} fill={CHANNELS[i].color}/>;
          })}
          <circle cx="300" cy="300" r="39" fill="#071521" stroke="#d7a94f" strokeWidth="2"/>
          <text x="300" y="300" dy="9" textAnchor="middle" fill="#f0d696" fontSize="31" fontFamily="Georgia, serif">G</text>
        </svg>
        {CHANNELS.map((entry,i)=>{
          const p=point(i,238);
          return <button
            key={entry.short}
            type="button"
            className="wbeSpokeButton"
            aria-label={GRAHAS[i][0]+" · "+TRADITIONS[i]+" · score "+scores[i]}
            aria-pressed={selected===i}
            onClick={()=>setSelected(i)}
            style={{left:(p.x/600*100)+"%",top:(p.y/600*100)+"%","--spoke":entry.color} as React.CSSProperties}
            title={GRAHAS[i][0]}
          ><span>{entry.glyph}</span><small>{entry.short}</small></button>;
        })}
      </div>

      <div className="wbeDetail">
        <div className="eyebrow">ANCHOR {String(selected+1).padStart(2,"0")} / 09 · {locale==="ne"?"प्रतीकात्मक":"SYMBOLIC"}</div>
        <div className="wbeDetailGlyph" style={{color:node.color}}>{node.glyph}</div>
        <h3>{GRAHAS[selected][0]}</h3>
        <p className="wbeCulture">{TRADITIONS[selected]} · {POWERS[selected]}</p>
        <p>{node.note}</p>
        <div className="wbeRangeHead"><label htmlFor="wbe-score">Personal reflection</label><strong>{scores[selected]} / 10</strong></div>
        <input id="wbe-score" type="range" min="0" max="10" step="1" value={scores[selected]} onChange={e=>update(selected,Number(e.target.value))}/>
        <div className="wbeRangeHelp"><span>0 · Low</span><span>5 · Mid</span><span>10 · High</span></div>
        <div className="wbePractice"><small>Consider</small><p>{node.action}</p></div>
        <div className="wbeSelectRail">{CHANNELS.map((item,i)=>
          <button type="button" aria-label={"Select "+item.short} aria-pressed={selected===i} key={item.short} onClick={()=>setSelected(i)}>{i+1}</button>
        )}</div>
      </div>
    </div>

    <div className="wbeFooterStats">
      <div><span>Reflective mean</span><strong>{mean.toFixed(1)} / 10</strong><small>Not an objective world score</small></div>
      <div><span>Low-scored themes</span><strong>{mostNeeded.length}</strong><small>Below 4, by your input</small></div>
      <div><span>High-scored themes</span><strong>{overextended.length}</strong><small>Above 8, by your input</small></div>
    </div>

    <div className="wbeSectionHead"><div><div className="eyebrow">DYNAMIC COUNTERBALANCE</div><h3>Paired tensions</h3></div><span>Symbolic comparison</span></div>
    <div className="wbePairs">{PAIRS.map(pair=><div key={pair.text} className="wbePair">
      <strong>{CHANNELS[pair.left].short} <span>↔</span> {CHANNELS[pair.right].short}</strong>
      <small>{pair.text}</small>
      <div className="wbePairBars"><i style={{width:(scores[pair.left]*10)+"%"}}/><i style={{width:(scores[pair.right]*10)+"%"}}/></div>
    </div>)}</div>

    <div className="wbeActions">
      <button className="primaryBtn" type="button" onClick={save} disabled={saving}>{saving?"Saving…":"Save reflection"}</button>
      <button className="ghost" type="button" onClick={exportJson}>Export JSON</button>
      <button className="ghost" type="button" disabled={loadingHistory} onClick={()=>loadHistory()}>{loadingHistory?"Loading…":"Saved reflections"}</button>
      <button className="ghost" type="button" onClick={()=>{setScores(initial);setSelected(0);setMessage("");}}>Reset</button>
      <Link className="ghost" href="/app/gates">Explore all 729 gates →</Link>
      <Link className="ghost" href="/login">Account</Link>
    </div>
    {message && <p className="wbeMessage" role="status">{message}</p>}
    {history.length>0&&<div className="wbeHistory" aria-label="Saved WBE reflections">
      <div className="eyebrow">PRIVATE ACCOUNT HISTORY</div>
      {history.map(item=><button type="button" key={item.id} onClick={()=>restore(item)}>
        <span>{item.title}</span><small>{item.createdAt?new Date(item.createdAt).toLocaleDateString():"Saved reflection"}</small>
        <strong>Load scores ↗</strong>
      </button>)}
    </div>}
    <div className="wbeDisclosure">Design heritage: uploaded Cosmic Balance mandala. Core pairings: WBE-9 Ninefold Pattern. The uploaded ZIP’s default “93% harmony,” planetary powers, decrees and seeded prayers were fictional examples; they are not imported as measured evidence or automatic authority.</div>
    <div className="wbeAnchorList" aria-label="Nine thematic pairings">{ANCHORS.map((a,i)=><button key={a.code} type="button" onClick={()=>setSelected(i)}><b>{String(i+1).padStart(2,"0")}</b> {a.graha}<span>{a.power}</span></button>)}</div>
  </section>;
}
