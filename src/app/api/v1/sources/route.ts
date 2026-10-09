import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sourceRegistryIntegrations } from "@/lib/integrations/catalog";

const builtIn = [
  ...sourceRegistryIntegrations(),
  {slug:"iana-tzdb",name:"IANA Time Zone Database",tier:"A",kind:"official_dataset",url:"https://www.iana.org/time-zones",status:"active"},
  {slug:"astronomy-engine",name:"Astronomy Engine",tier:"B",kind:"calculation_library",url:"https://github.com/cosinekitty/astronomy",status:"active"}
];

function mergeSources(databaseSources: Array<Record<string, unknown>>) {
  const merged = new Map<string, Record<string, unknown>>();
  for (const source of builtIn) merged.set(source.slug, source);
  for (const source of databaseSources) {
    const slug = typeof source.slug === "string" ? source.slug : "";
    if (slug) merged.set(slug, { ...merged.get(slug), ...source });
  }
  return Array.from(merged.values());
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({configured:false,sources:builtIn});

  const {data,error} = await supabase
    .from("source_registry")
    .select("slug,name,tier,kind,url,status,last_verified_at")
    .eq("status","active")
    .order("tier");

  if (error) {
    return NextResponse.json({configured:true,error:error.message,sources:builtIn},{status:200});
  }

  return NextResponse.json({
    configured:true,
    sources:mergeSources((data || []) as Array<Record<string, unknown>>)
  });
}
