import {NextRequest,NextResponse} from "next/server";
import {GATES} from "@/lib/wbe";
import {WBGR,displayWbgrGate} from "@/lib/wbgr";
export function GET(request:NextRequest){
 const q=request.nextUrl.searchParams;const rawPage=q.get("page")??"1",rawLimit=q.get("limit")??"27";
 if(!/^[1-9][0-9]*$/.test(rawPage)||!/^[1-9][0-9]*$/.test(rawLimit))return NextResponse.json({error:"Use positive numeric page and limit."},{status:400});
 const page=Number(rawPage),limit=Number(rawLimit);
 if(!Number.isSafeInteger(page)||!Number.isSafeInteger(limit)||page>10000||limit>100)return NextResponse.json({error:"Page max 10000, limit max 100."},{status:400});
 const anchors=q.get("anchors")==="true",term=(q.get("q")??"").trim().toLowerCase().slice(0,180);
 let rows=anchors?GATES.filter(g=>g.anchor):GATES;
 if(term)rows=rows.filter(g=>{const d=displayWbgrGate(g);return [g.code,d.code,g.tradition,g.graha,g.power,g.domain].some(v=>v.toLowerCase().includes(term));});
 return NextResponse.json({framework:WBGR.title,edition:WBGR.edition,series:WBGR.series,total:rows.length,engineGateCount:WBGR.gateCount,anchorCount:WBGR.anchorCount,page,limit,gates:rows.slice((page-1)*limit,page*limit).map(displayWbgrGate),disclaimer:"1799 BS is a user-defined designation, not a verified calendar date or 1,799 generated gates; 729 = 9×9×9 symbolic combinations."},{headers:{"Cache-Control":"public, s-maxage=300"}});
}
