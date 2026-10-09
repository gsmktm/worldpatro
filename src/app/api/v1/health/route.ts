import { NextResponse } from "next/server";
import { GATES, ANCHORS } from "@/lib/wbe";
import { isSupabaseConfigured } from "@/lib/env";
import { isFirebaseAdminConfigured, isFirebaseClientConfigured, useFirebaseBackend } from "@/lib/firebase/config";

export function GET(){
  return NextResponse.json({
    ok:true,
    service:"worldpatro",
    version:"1.1.0",
    runtime:"node>=22",
    dataBackend: useFirebaseBackend() ? "firebase" : isSupabaseConfigured() ? "supabase" : "public-only",
    firebase:{
      clientConfigured:isFirebaseClientConfigured(),
      adminConfigured:isFirebaseAdminConfigured()
    },
    supabaseConfigured:isSupabaseConfigured(),
    wbe:{gates:GATES.length,anchors:ANCHORS.length},
    time:new Date().toISOString()
  });
}
