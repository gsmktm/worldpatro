import { NextResponse } from "next/server";
import { databaseProvider, isFirebaseAdminConfigured, isFirebaseClientConfigured } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    provider: databaseProvider(),
    firebase: {
      clientConfigured: isFirebaseClientConfigured(),
      adminConfigured: isFirebaseAdminConfigured(),
      firestoreRulesFile: "firestore.rules",
      indexesFile: "firestore.indexes.json"
    }
  });
}
