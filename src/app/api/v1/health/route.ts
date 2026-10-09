import { NextResponse } from "next/server";
import { GATES, ANCHORS } from "@/lib/wbe";
import { isSupabaseConfigured } from "@/lib/env";
export function GET(){return NextResponse.json({ok:true,service:"worldpatro",version:"1.0.0",runtime:"node>=22",supabaseConfigured:isSupabaseConfigured(),wbe:{gates:GATES.length,anchors:ANCHORS.length},time:new Date().toISOString()});}
