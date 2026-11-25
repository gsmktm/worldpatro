import { VEDIC_FEATURE_ICONS } from "@/lib/vedic-feature-icons";

/** Small original, dependency-free medallion icon. No external asset fetching. */
export function VedicFeatureIcon({id,size=36,label,className=""}:{
 id:string;size?:number;label?:string;className?:string;
}){
 const icon=VEDIC_FEATURE_ICONS.find(i=>i.id===id);
 if(!icon)return null;
 return <svg className={className} width={size} height={size} viewBox="0 0 24 24"
   fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
   role={label?"img":undefined} aria-label={label} aria-hidden={label?undefined:true}>
   <path d={icon.path}/>
 </svg>;
}
