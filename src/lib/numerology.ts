export type NumerologyMode="pythagorean"|"chaldean";

const TABLES:Record<NumerologyMode,Record<string,number>>={
  pythagorean:{
    a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
    s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8
  },
  chaldean:{
    a:1,b:2,c:3,d:4,e:5,f:8,g:3,h:5,i:1,j:1,k:2,l:3,m:4,n:5,o:7,p:8,q:1,r:2,
    s:3,t:4,u:6,v:6,w:6,x:5,y:1,z:7
  }
};
const VOWELS=new Set(["a","e","i","o","u"]);
const ORDER=[4,9,2,3,5,7,8,1,6];
const NOTICE="Traditional numerology is a cultural/interpretive framework. Numbers are computed deterministically; interpretations are not scientific forecasts, diagnoses or evidence of fate.";

export function checkDate(date:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error("Date must be YYYY-MM-DD.");
  const parsed=new Date(date+"T12:00:00Z");
  if(Number.isNaN(parsed.valueOf())||parsed.toISOString().slice(0,10)!==date)throw new Error("Invalid calendar date.");
  return parsed;
}
export function reduceNumber(n:number,keepMaster=true):number {
  if(!Number.isInteger(n)||n<0)throw new Error("Numerology values must be nonnegative integers.");
  while(n>9){
    if(keepMaster&&(n===11||n===22||n===33))return n;
    n=String(n).split("").reduce((sum,d)=>sum+Number(d),0);
  }
  return n;
}
function textNumber(raw:string,mode:NumerologyMode){
  const chars=Array.from(raw.toLowerCase());
  const breakdown=chars.map(letter=>({letter,value:TABLES[mode][letter]||0}));
  const total=breakdown.reduce((sum,item)=>sum+item.value,0);
  const vowelTotal=breakdown.filter(item=>VOWELS.has(item.letter)).reduce((sum,item)=>sum+item.value,0);
  const consonantTotal=breakdown.filter(item=>/[a-z]/.test(item.letter)&&!VOWELS.has(item.letter)).reduce((sum,item)=>sum+item.value,0);
  return {total,reduced:reduceNumber(total),vowelTotal,consonantTotal,breakdown};
}
function monthDayYear(date:string) {
  const [year,month,day]=date.split("-").map(Number);
  return {year,month,day};
}

export function calculateNumerology(name:string,birthDate:string,mode:NumerologyMode="pythagorean",referenceDate:string="2026-10-09"){
  checkDate(birthDate);
  checkDate(referenceDate);
  const normalized=name.trim().slice(0,120);
  if(!normalized||![...normalized].some(c=>TABLES[mode][c.toLowerCase()]))throw new Error("Enter a name containing Latin letters.");
  const {year,month,day}=monthDayYear(birthDate);
  const now=monthDayYear(referenceDate);
  const n=textNumber(normalized,mode);
  const d1=reduceNumber(day,false),d2=reduceNumber(month,false),d3=reduceNumber(year,false);
  const lifePath=reduceNumber(d1+d2+d3);
  const birthNumber=reduceNumber(day);
  const destiny={total:n.total,reduced:n.reduced};
  const soulUrge={total:n.vowelTotal,reduced:reduceNumber(n.vowelTotal)};
  const personality={total:n.consonantTotal,reduced:reduceNumber(n.consonantTotal)};
  const maturity=reduceNumber(lifePath+destiny.reduced);
  const personalYear=reduceNumber(d1+d2+reduceNumber(now.year,false));
  const personalMonth=reduceNumber(personalYear+reduceNumber(now.month,false));
  const personalDay=reduceNumber(personalMonth+reduceNumber(now.day,false));
  const digits=(String(year)+String(month).padStart(2,"0")+String(day).padStart(2,"0")).split("").map(Number).filter(d=>d>0);
  const counts=new Map<number,number>();
  for(const digit of digits)counts.set(digit,(counts.get(digit)||0)+1);
  const folded=reduceNumber(lifePath,false);
  const p1=reduceNumber(d1+d2),p2=reduceNumber(d1+d3),p3=reduceNumber(p1+p2),p4=reduceNumber(d2+d3);
  return {
    name:normalized,birthDate,referenceDate,mode,
    lifePath,birthNumber,destiny,soulUrge,personality,maturity,personalYear,personalMonth,personalDay,
    loShu:{order:ORDER,grid:ORDER.map(n=>counts.get(n)?n:null),missing:ORDER.filter(n=>!counts.get(n)),repeated:[...counts.entries()].filter(([,c])=>c>1).map(([n])=>n)},
    pinnacles:[
      {stage:1,ages:"birth–"+(36-folded),value:p1},
      {stage:2,ages:(37-folded)+"–"+(45-folded),value:p2},
      {stage:3,ages:(46-folded)+"–"+(54-folded),value:p3},
      {stage:4,ages:(55-folded)+"+",value:p4}
    ],
    challenges:[
      {stage:1,value:Math.abs(d1-d2)},
      {stage:2,value:Math.abs(d2-d3)},
      {stage:3,value:Math.abs(p1-p2)},
      {stage:4,value:Math.abs(d1-d3)}
    ],
    lifeCycles:[{value:reduceNumber(month),from:"birth month"},{value:reduceNumber(day),from:"birth day"},{value:reduceNumber(year),from:"birth year"}],
    nameBreakdown:n.breakdown,
    provenance:{source:"User-uploaded Arko Jyotish numerology engine",method:mode,classification:"TRADITIONAL INTERPRETATION",notice:NOTICE}
  };
}
export function compareNumerology(a:{name:string;birthDate:string},b:{name:string;birthDate:string},mode:NumerologyMode,referenceDate:string){
  const first=calculateNumerology(a.name,a.birthDate,mode,referenceDate);
  const second=calculateNumerology(b.name,b.birthDate,mode,referenceDate);
  const delta=Math.abs(reduceNumber(first.lifePath,false)-reduceNumber(second.lifePath,false));
  return {
    left:{name:first.name,lifePath:first.lifePath,destiny:first.destiny.reduced,soulUrge:first.soulUrge.reduced},
    right:{name:second.name,lifePath:second.lifePath,destiny:second.destiny.reduced,soulUrge:second.soulUrge.reduced},
    delta,traditionalHarmonyScale:Math.max(0,9-delta),
    notice:"The 0–9 number is a traditional symbolic comparison, not a relationship outcome prediction.",
    source:"Arko Jyotish derived algorithm"
  };
}
export function businessNumerology(name:string,birthDate:string,mode:NumerologyMode,referenceDate:string){
  checkDate(birthDate);
  const profile=calculateNumerology("Owner",birthDate,mode,referenceDate);
  const value=textNumber(name.trim(),mode);
  if(!name.trim()||value.total===0)throw new Error("Enter a business name containing Latin letters.");
  return {
    businessName:name.trim(),nameValue:value.total,reduced:value.reduced,
    ownerLifePath:profile.lifePath,numberDifference:Math.abs(value.reduced-reduceNumber(profile.lifePath,false)),
    provenance:{method:mode,classification:"TRADITIONAL INTERPRETATION",notice:NOTICE}
  };
}
