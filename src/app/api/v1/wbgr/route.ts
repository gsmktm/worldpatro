import {NextResponse} from "next/server";
import {WBGR} from "@/lib/wbgr";
export function GET(){return NextResponse.json({...WBGR,endpoints:{gates:"/api/v1/wbgr/gates",assess:"/api/v1/wbgr/assess",snapshots:"/api/v1/wbgr/snapshots"},routes:{studio:"/app/wbe",gates:"/app/gates"},compatibility:{legacyApi:"/api/v1/wbe",legacyGateIds:true,legacyStoredReports:true},designationNotice:"1799 BS is a user-specified identity, not a verified Bikram Sambat date or number of generated gates.",disclaimer:"Symbolic comparisons are not scientific or religious authority."});}
