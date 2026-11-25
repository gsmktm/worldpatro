import { WORLD_ICON_GROUPS, type IconGroup } from "@/lib/world-iconography";

/**
 * Reusable WorldPatro vector icon.
 * Default decorative: pair with a visible label; pass label only if standalone.
 */
export function WorldVectorIcon({family,name,size=24,className="",label}:{
  family:IconGroup["id"];name:string;size?:number;className?:string;label?:string;
}){
 const glyph=WORLD_ICON_GROUPS.find(group=>group.id===family)?.entries.find(icon=>icon.id===name);
 if(!glyph)return null;
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
   className={className} role={label?"img":undefined} aria-label={label}
   aria-hidden={label?undefined:true}>
   <path d={glyph.path}/>
 </svg>;
}
