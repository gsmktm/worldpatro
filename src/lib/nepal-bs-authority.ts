/**
 * Nepali BS 2083 date correspondences, bounded to municipality-published month grids.
 * Source: Kathmandu Metropolitan City public BS/AD month pages, inspected 2026-10-09.
 *
 * This is NOT a year-long table and NOT the Nepal Panchanga Nirnayak Vikas Samiti's
 * approval certificate. It is a government municipality's published civil dates.
 * No extrapolation outside exactly the published month ranges is permitted.
 */
export type BsPublishedMonth = {
  bsYear:number;
  bsMonth:number;
  nameEn:string;
  nameNe:string;
  startsAD:string;
  length:number;
  sourceUrl:string;
  publisher:string;
  checkedOn:string;
  verification:"municipality-published";
};
export const BS_PUBLISHED_MONTHS:readonly BsPublishedMonth[]=[
  {
    bsYear:2083,bsMonth:5,nameEn:"Bhadra",nameNe:"भदौ",
    startsAD:"2026-08-17",length:31,
    sourceUrl:"https://new.kathmandu.gov.np/en/calendar",
    publisher:"Kathmandu Metropolitan City",
    checkedOn:"2026-10-09",verification:"municipality-published"
  },
  {
    bsYear:2083,bsMonth:6,nameEn:"Asoj",nameNe:"असोज",
    startsAD:"2026-09-17",length:31,
    sourceUrl:"https://kathmandu.gov.np/en/calendar",
    publisher:"Kathmandu Metropolitan City",
    checkedOn:"2026-10-09",verification:"municipality-published"
  }
] as const;
const ONE_DAY_MS=86400000;

function isoDay(raw:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))throw new Error("Invalid AD date.");
  const millis=Date.parse(raw+"T00:00:00.000Z");
  if(!Number.isFinite(millis)||new Date(millis).toISOString().slice(0,10)!==raw)
    throw new Error("Invalid AD date.");
  return millis;
}
export function validateBsMonthCoverage() {
  const previous=BS_PUBLISHED_MONTHS.slice().sort((a,b)=>a.startsAD.localeCompare(b.startsAD));
  for(let i=0;i<previous.length;i++){
    const item=previous[i];
    if(item.length<28||item.length>33||!Number.isInteger(item.length))
      throw new Error("BS source month has invalid length.");
    if(!item.sourceUrl.startsWith("https://")||!item.publisher||!item.checkedOn)
      throw new Error("BS source must have an HTTPS publisher, date and source.");
    const start=isoDay(item.startsAD);
    if(i){
      const last=previous[i-1];
      if(isoDay(last.startsAD)+last.length*ONE_DAY_MS!==start)
        throw new Error("Adjacent BS source months are not continuous.");
    }
  }
  return true;
}
export function publishedBsFromAD(date:string) {
  const dateMs=isoDay(date);
  for(const row of BS_PUBLISHED_MONTHS){
    const start=isoDay(row.startsAD);
    const offset=(dateMs-start)/ONE_DAY_MS;
    if(offset>=0&&offset<row.length&&Number.isInteger(offset)){
      return {
        bsYear:row.bsYear,bsMonth:row.bsMonth,bsDay:offset+1,
        monthEn:row.nameEn,monthNe:row.nameNe,
        method:"Exact day offset within a municipality-published BS/AD month grid",
        provenance:{
          publisher:row.publisher,sourceUrl:row.sourceUrl,
          checkedOn:row.checkedOn,verification:row.verification,
          coverageStart:row.startsAD,
          coverageEnd:new Date(start+(row.length-1)*ONE_DAY_MS).toISOString().slice(0,10)
        }
      };
    }
  }
  return null;
}
export function publishedADFromBs(year:number,month:number,day:number) {
  if(![year,month,day].every(Number.isInteger))return null;
  const row=BS_PUBLISHED_MONTHS.find(x=>x.bsYear===year&&x.bsMonth===month);
  if(!row||day<1||day>row.length)return null;
  return {
    date:new Date(isoDay(row.startsAD)+(day-1)*ONE_DAY_MS).toISOString().slice(0,10),
    provenance:{publisher:row.publisher,sourceUrl:row.sourceUrl,checkedOn:row.checkedOn}
  };
}
