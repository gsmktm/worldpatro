// Vimshottari chronology adapted from user's Arko Jyotish archive.
// Important correction: first partial mahadasha children are clipped from the
// full mahadasha timeline, not restarted at birth (which shifts antardashas).
export const DASHA_ORDER=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"] as const;
export const DASHA_YEARS:Record<string,number>={
  Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17
};
const YEAR_MS=365.25*86400000;
const norm=(v:number)=>((v%360)+360)%360;
export type DashaPeriod={
  lord:string;
  level:"mahadasha"|"antardasha"|"pratyantardasha";
  startUTC:string;
  endUTC:string;
  children?:DashaPeriod[];
};
function clipPeriods(
  lord:string,
  fullStart:number,
  fullLength:number,
  floor:number,
  ceiling:number,
  level:0|1|2,
  depth:number
):DashaPeriod[] {
  const levels=["mahadasha","antardasha","pratyantardasha"] as const;
  if(level===0) {
    const start=Math.max(fullStart,floor),end=Math.min(fullStart+fullLength,ceiling);
    if(end<=start)return [];
    const result:DashaPeriod={lord,level:"mahadasha",startUTC:new Date(start).toISOString(),endUTC:new Date(end).toISOString()};
    if(depth>1)result.children=clipPeriods(lord,fullStart,fullLength,floor,ceiling,1,depth);
    return [result];
  }
  const parts:DashaPeriod[]=[];
  const startIndex=DASHA_ORDER.indexOf(lord as typeof DASHA_ORDER[number]);
  let cursor=fullStart;
  for(let i=0;i<9;i++){
    const sub=DASHA_ORDER[(startIndex+i)%9];
    const duration=fullLength*DASHA_YEARS[sub]/120;
    const start=Math.max(cursor,floor),end=Math.min(cursor+duration,ceiling);
    if(end>start){
      const result:DashaPeriod={
        lord:sub,level:levels[level],startUTC:new Date(start).toISOString(),endUTC:new Date(end).toISOString()
      };
      if(level===1 && depth>2)result.children=clipPeriods(sub,cursor,duration,floor,ceiling,2,depth);
      parts.push(result);
    }
    cursor+=duration;
  }
  return parts;
}
export function vimshottari(moonSidereal:number,birth:Date,depth:1|2|3=3) {
  const moon=norm(moonSidereal),span=360/27;
  const index=Math.floor(moon/span);
  const fraction=(moon-index*span)/span;
  const firstLord=DASHA_ORDER[index%9];
  const totalDays=120*365.25;
  const start=birth.getTime(),ceiling=start+totalDays*86400000;
  const firstFullLength=DASHA_YEARS[firstLord]*YEAR_MS;
  let currentStart=start-fraction*firstFullLength;
  const beginIndex=DASHA_ORDER.indexOf(firstLord);
  const tree:DashaPeriod[]=[];
  for(let n=0;n<12&&currentStart<ceiling;n++){
    const lord=DASHA_ORDER[(beginIndex+n)%9];
    const fullLength=DASHA_YEARS[lord]*YEAR_MS;
    tree.push(...clipPeriods(lord,currentStart,fullLength,start,ceiling,0,depth));
    currentStart+=fullLength;
  }
  return {
    birthBalance:{lord:firstLord,years:+((1-fraction)*DASHA_YEARS[firstLord]).toFixed(6),elapsedPercent:+(fraction*100).toFixed(4)},
    yearBasisDays:365.25,
    periods:tree
  };
}
export function currentDashaPath(periods:DashaPeriod[],at:Date) {
  const result:DashaPeriod[]=[];
  let branch=periods;
  while(branch.length){
    const active=branch.find(p=>new Date(p.startUTC)<=at && at<new Date(p.endUTC));
    if(!active)break;
    result.push({...active,children:undefined});
    branch=active.children||[];
  }
  return result;
}
