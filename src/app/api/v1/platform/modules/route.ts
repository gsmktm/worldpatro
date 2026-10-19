import {NextResponse} from "next/server";
import {FEATURES} from "@/lib/features";
import {AGENT_PROFILES} from "@/lib/agents/contracts";
import {agentAccessMode} from "@/lib/agents/security";
import {useFirebaseBackend,isFirebaseAdminConfigured,isFirebaseClientConfigured} from "@/lib/firebase/config";
import {isSupabaseConfigured} from "@/lib/env";

export const dynamic="force-dynamic";
const GROUPS=[
 {name:"TIME",slugs:["patro","panchang","astrology","kundli","muhurat","numerology","religions"]},
 {name:"INTELLIGENCE",slugs:["world","research","sources","alerts"]},
 {name:"BALANCE",slugs:["wens","wbe","gates"]},
 {name:"OPERATIONS",slugs:["agents","workflows","admin","privacy","consult","learn"]}
] as const;
const authSlugs=new Set(["research","alerts","workflows","privacy","consult"]);
const editorialSlugs=new Set(["religions","learn"]);
export function GET(){
  const backend=useFirebaseBackend()?"firebase":isSupabaseConfigured()?"supabase":"not-configured";
  const gateway=Boolean(process.env.VERCEL_OIDC_TOKEN||process.env.AI_GATEWAY_API_KEY);
  const access=agentAccessMode();
  const modules=FEATURES.map(feature=>{
    let accessType:"public"|"account"|"admin"|"gateway"="public";
    let state:"available"|"requires-database"|"requires-admin-role"|"requires-ai-access"|"requires-published-sources"="available";
    if(authSlugs.has(feature.slug)){
      accessType="account";
      if(backend==="not-configured")state="requires-database";
    }else if(feature.slug==="admin"){
      accessType="admin";
      state="requires-admin-role";
    }else if(feature.slug==="agents"){
      accessType="gateway";
      if(!gateway||(access==="authenticated"&&backend==="not-configured"))state="requires-ai-access";
    }else if(editorialSlugs.has(feature.slug)){
      state="requires-published-sources";
    }
    return {
      slug:feature.slug,title:feature.title,group:GROUPS.find(g=>(g.slugs as readonly string[]).includes(feature.slug))?.name||"OTHER",
      url:"/app/"+feature.slug,api:feature.api||[],
      access:accessType,availability:state,implementation:feature.status,
      requiresExternalAuthority:feature.slug==="religions"||feature.slug==="patro",
      note:state==="available"?"Route and core implementation available; individual source providers may still fail.":
       state==="requires-published-sources"?"Page exists; only reviewed, published records will appear.":
       state==="requires-admin-role"?"Server-verified administrator role and database required.":
       state==="requires-ai-access"?"Gateway and access mode must be configured before AI agent execution.":
       "Login and activated user-owned database required."
    };
  });
  return NextResponse.json({
    total:modules.length,
    categories:GROUPS.map(g=>({title:g.name,count:g.slugs.length})),
    modules,agentSpecialists:AGENT_PROFILES.map(p=>({name:p.name,role:p.role,mission:p.mission,boundary:p.boundary})),
    infrastructure:{
      dataBackend:backend,supabaseConfigured:isSupabaseConfigured(),firebaseWebConfigured:isFirebaseClientConfigured(),
      firebaseAdminConfigured:isFirebaseAdminConfigured(),gatewayConfigured:gateway,agentAccess:access
    },
    caveat:"Static route availability does not prove live provider data, live database access or third-party booking. Account and administrator actions require verified authentication."
  },{headers:{"Cache-Control":"no-store"}});
}
