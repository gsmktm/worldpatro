import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured, isFirebaseClientConfigured, useFirebaseBackend } from "@/lib/firebase/config";

export function GET() {
  return NextResponse.json({
    backendRequested: process.env.WORLD_PATRO_DATA_BACKEND || "supabase",
    firebaseClientConfigured: isFirebaseClientConfigured(),
    firebaseAdminConfigured: isFirebaseAdminConfigured(),
    firebaseActive: useFirebaseBackend(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null
  });
}
