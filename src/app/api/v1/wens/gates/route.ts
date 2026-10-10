import { NextRequest, NextResponse } from "next/server";
import { GATES } from "@/lib/wbe";
import { WBGR109, selectWensGate, WENS_DISCLOSURE } from "@/lib/wens";

export function GET(request:NextRequest) {
  const params=request.nextUrl.searchParams;
  const numberParam=(key:string,fallback:number)=> {
    const raw=params.get(key);
    return raw===null?fallback:Number(raw);
  };
  const page=numberParam("page",1);
  const limit=numberParam("limit",27);
  if(!Number.isInteger(page)||page<1||page>1000||!Number.isInteger(limit)||limit<1||limit>109)
    return NextResponse.json({error:"page must be a positive integer (max 1000), limit 1–109."},{status:400});
  const view=params.get("view")==="all"?"all":"curated";
  const search=(params.get("q")??"").trim().slice(0,100).toLowerCase();
  const dimension=["tradition","graha","power"].map(key=>params.get(key));
  const indexes=dimension.map(x=>x===null?null:Number(x));
  if(indexes.some(x=>x!==null&&(!Number.isInteger(x)||x<1||x>9)))
    return NextResponse.json({error:"Tradition, graha and power filters must be integers 1–9."},{status:400});
  let rows=view==="all"?GATES:WBGR109;
  if(indexes.some(x=>x!==null)){
    rows=rows.filter(g=>{
      const source=selectWensGate(
        indexes[0]===null?0:indexes[0]-1,
        indexes[1]===null?0:indexes[1]-1,
        indexes[2]===null?0:indexes[2]-1
      );
      void source; // selection is validated; use codes for actual filtering below.
      const parts=g.code.split("-").slice(1).map(Number);
      return indexes.every((value,index)=>value===null||parts[index]===value);
    });
  }
  if(search)rows=rows.filter(g=>[g.code,g.tradition,g.graha,g.power,g.domain].some(v=>v.toLowerCase().includes(search)));
  return NextResponse.json({
    view,registered:WBGR109.length,fullCube:GATES.length,total:rows.length,page,limit,
    gates:rows.slice((page-1)*limit,page*limit),
    disclosure:WENS_DISCLOSURE.symbolic
  },{headers:{"Cache-Control":"public, s-maxage=300"}});
}
