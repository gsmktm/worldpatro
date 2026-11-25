"use client";
import { useId } from "react";

/** Twelve original SVG line-symbols: one distinct path for each Vedic rāśi. */
export const RASHI_PATHS=[
  "M5 20C5 14 3 5 8 5c4 0 4 5 4 8 0-3 0-8 4-8 5 0 3 9 3 15",
  "M4 4c0 5 4 6 8 6s8-1 8-6M12 10a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13",
  "M4 4h16M4 20h16M7 5c2 4 2 10 0 14M17 5c-2 4-2 10 0 14",
  "M3 9c4-6 13-6 18 0M3 15c5 6 14 6 18 0M7 9a2 2 0 1 0 0 4a2 2 0 1 0 0-4M17 11a2 2 0 1 0 0 4a2 2 0 1 0 0-4",
  "M6 21c-3-5-1-10 3-10 3 0 5 3 3 6-2 2-4 1-4-1M8 11c-1-6 3-9 7-7 3 2 2 5 0 8-3 4-2 8 3 8h3",
  "M3 5v14M3 9c3-5 5-4 6 0v10M9 9c3-5 5-4 6 0v10M15 9c3-5 5-4 6 0v10l-4 3",
  "M4 20h16M6 17c0-7 3-11 6-11s6 4 6 11M3 17h18",
  "M3 5v14M3 9c3-5 5-4 6 0v10M9 9c3-5 5-4 6 0v10M15 9c3-5 5-4 6 0v10c0 3 3 3 5 0m-2 0 2 0-1 3",
  "M4 20 20 4M10 4h10v10M4 14l5 6",
  "M3 5c4-2 6 1 6 5v6c0 4 4 5 6 2l6-6M17 12l4 0-1 5M3 5v14",
  "M2 9c2-4 4-4 6 0s4 4 6 0 4-4 8 0M2 16c2-4 4-4 6 0s4 4 6 0 4-4 8 0",
  "M6 4c6 4 6 12 0 16M18 4c-6 4-6 12 0 16M3 12h18"
] as const;
export function ZodiacVector({index,size=40,className=""}:{index:number;size?:number;className?:string}){
  const idx=((Math.round(index)%12)+12)%12;
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    role="img" aria-label={"Unique vector zodiac sign "+(idx+1)}>
    <path d={RASHI_PATHS[idx]}/>
  </svg>;
}
function litShape(percent:number,waxing:boolean){
  const f=Math.max(0,Math.min(1,percent/100));
  const cx=150,top=36,bottom=264,r=114;
  if(f<=0.0001)return "";
  if(f>=0.9999)return "M150 36 A114 114 0 1 1 150 264 A114 114 0 1 1 150 36 Z";
  const ellipse=Math.max(0.01,Math.abs(2*f-1)*r);
  const beginning="M"+cx+" "+top;
  const edge=" A"+r+" "+r+" 0 0 "+(waxing?1:0)+" "+cx+" "+bottom;
  const end=f===0.5?" L"+cx+" "+top:
    " A"+ellipse+" "+r+" 0 0 "+(waxing?(f<0.5?0:1):(f<0.5?1:0))+" "+cx+" "+top;
  return beginning+edge+end+" Z";
}
/** Drawn illustrative lunar disk: size in pixels is not a physical scale. */
export function MoonDisk({phaseDegrees,illuminationPercent,size=288,className=""}:{
  phaseDegrees:number;illuminationPercent:number;size?:number;className?:string;
}){
  const uid=useId().replaceAll(":","-");
  const clip="moon-clip-"+uid,lit="moon-lit-"+uid,bright="moon-bright-"+uid,dark="moon-dark-"+uid,shade="moon-shade-"+uid;
  const waxing=phaseDegrees<180;
  const path=litShape(illuminationPercent,waxing);
  return <svg className={className} viewBox="0 0 300 300" width={size} height={size}
    style={{maxWidth:"100%",height:"auto"}} role="img" aria-label={Math.round(illuminationPercent)+"% illuminated "+(waxing?"waxing":"waning")+" Moon. Artistic north-oriented phase rendering."}>
    <defs>
      <clipPath id={clip}><circle cx="150" cy="150" r="114"/></clipPath>
      <clipPath id={lit}><path d={path}/></clipPath>
      <radialGradient id={dark} cx="36%" cy="32%" r="83%"><stop offset="0" stopColor="#263848"/><stop offset=".73" stopColor="#141c2a"/><stop offset="1" stopColor="#060d16"/></radialGradient>
      <radialGradient id={bright} cx="37%" cy="30%" r="80%"><stop offset="0" stopColor="#fff3d5"/><stop offset=".56" stopColor="#d7d7cb"/><stop offset="1" stopColor="#697b86"/></radialGradient>
      <radialGradient id={shade}><stop offset=".67" stopColor="#050c14" stopOpacity="0"/><stop offset="1" stopColor="#050c14" stopOpacity=".45"/></radialGradient>
    </defs>
    <circle cx="150" cy="150" r="123" fill="none" stroke="#d7b779" strokeOpacity=".12" strokeWidth=".7"/>
    <circle cx="150" cy="150" r="114" fill={"url(#"+dark+")"}/>
    <g clipPath={"url(#"+lit+")"}>
      <circle cx="150" cy="150" r="114" fill={"url(#"+bright+")"}/>
      <g fill="#596d74" opacity=".3">
        <circle cx="95" cy="112" r="18"/><circle cx="188" cy="92" r="25"/>
        <circle cx="176" cy="175" r="31"/><circle cx="112" cy="207" r="21"/>
        <circle cx="204" cy="216" r="11"/><circle cx="122" cy="72" r="13"/>
        <ellipse cx="91" cy="155" rx="17" ry="11"/><circle cx="150" cy="126" r="8"/>
      </g>
      <g fill="none" stroke="#f1ead7" strokeOpacity=".16" strokeWidth="2">
        <circle cx="95" cy="112" r="20"/><circle cx="188" cy="92" r="26"/><circle cx="112" cy="207" r="22"/>
      </g>
    </g>
    <circle cx="150" cy="150" r="114" fill={"url(#"+shade+")"} clipPath={"url(#"+clip+")"}/>
  </svg>;
}
