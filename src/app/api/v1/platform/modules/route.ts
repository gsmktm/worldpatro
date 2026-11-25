import {NextResponse} from "next/server";
import {FEATURE_MAP} from "@/lib/features";
import {NAV_ITEMS} from "@/lib/navigation";
import {AGENT_PROFILES} from "@/lib/agents/contracts";
import {agentAccessMode} from "@/lib/agents/security";
import {useFirebaseBackend,isFirebaseAdminConfigured,isFirebaseClientConfigured} from "@/lib/firebase/config";
import {isSupabaseConfigured} from "@/lib/env";

export const dynamic="force-dynamic";
const GROUPS=["TIME","INTELLIGENCE","BALANCE","OPERATIONS"] as const;
type Group=typeof GROUPS[number];
type Availability="available"|"requires-database"|"requires-database-verification"|"requires-admin-role"|"requires-ai-access"|"requires-published-sources";
const accountSlugs=new Set(["research","alerts","workflows","privacy","consult","account"]);
const editorialSlugs=new Set(["religions","learn","people","authorities"]);
function groupFor(navGroup:string):Group{
 if(navGroup==="DAILY"||navGroup==="JYOTISH")return "TIME";
 if(navGroup==="EXPLORE")return "INTELLIGENCE";
 if(navGroup==="WENS")return "BALANCE";
 return "OPERATIONS";
}

export function GET(){
 const backend=useFirebaseBackend()?"firebase":isSupabaseConfigured()?"supabase":"not-configured";
 const gateway=Boolean(process.env.VERCEL_OIDC_TOKEN||process.env.AI_GATEWAY_API_KEY);
 const access=agentAccessMode();
 // Availability is a capability gate, not a claim of tested accounts or reachable third-party services.
 const modules=NAV_ITEMS.filter(item=>item.slug).map(item=>{
  const feature=FEATURE_MAP.get(item.slug);
  let accessType:"public"|"account"|"admin"|"gateway"="public";
  let state:Availability="available";
  if(accountSlugs.has(item.slug)){
   accessType="account";
   state=backend==="not-configured"?"requires-database":"requires-database-verification";
  }else if(item.slug==="admin"){
   accessType="admin";
   state="requires-admin-role";
  }else if(item.slug==="agents"){
   accessType="gateway";
   state=!gateway?"requires-ai-access":
    access==="authenticated"?(backend==="not-configured"?"requires-database":"requires-database-verification"):"available";
  }else if(editorialSlugs.has(item.slug)){
   state="requires-published-sources";
  }
  const note=item.slug==="planner"
   ?"Device planner is available; account sync still requires successful authentication and an owner-protected database."
   :state==="requires-database-verification"?"Backend settings were found; connectivity, sign-in and owner-only access have not been verified."
   :state==="requires-database"?"A configured, working database and authenticated account are required."
   :state==="requires-admin-role"?"Server-verified administrator identity and publishing permissions are required."
   :state==="requires-ai-access"?"AI Gateway and its configured access mode are required; no paid AI request is enabled by this page."
   :state==="requires-published-sources"?"Only independently reviewed and published reference records are shown; coverage may be incomplete."
   :"The page and core interface exist. This does not certify every third-party provider or private operation.";
  return {
   slug:item.slug,title:feature?.title||item.label,group:groupFor(item.group),
   url:"/app/"+item.slug,api:feature?.api||[],
   access:accessType,availability:state,implementation:feature?.status||"ui-route",
   requiresExternalAuthority:item.slug==="religions"||item.slug==="patro"||item.slug==="authorities",
   note
  };
 });
 return NextResponse.json({
  total:modules.length,
  categories:GROUPS.map(title=>({title,count:modules.filter(m=>m.group===title).length})),
  modules,
  agentSpecialists:AGENT_PROFILES.map(p=>({name:p.name,role:p.role,mission:p.mission,boundary:p.boundary})),
  infrastructure:{
   dataBackend:backend,supabaseConfigured:isSupabaseConfigured(),
   backendConnectivityVerified:false,
   firebaseWebConfigured:isFirebaseClientConfigured(),firebaseAdminConfigured:isFirebaseAdminConfigured(),
   gatewayConfigured:gateway,agentAccess:access
  },
  caveat:"Navigation completeness and route existence are not service readiness. Database presence is not connectivity; authenticated writes, RLS, subscriptions and external sources need separate verification."
 },{headers:{"Cache-Control":"no-store"}});
}
