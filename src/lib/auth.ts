import { NextResponse } from "next/server";
import { firebaseIdentityFromRequest } from "@/lib/firebase/auth-server";
import { firebaseAdminConfigured } from "@/lib/firebase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthContext = {
  provider: "firebase" | "supabase";
  userId: string;
  firebase: boolean;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

export async function requireUser() {
  if (firebaseAdminConfigured()) {
    const identity = await firebaseIdentityFromRequest();
    if (!identity) {
      return {
        auth: null,
        error: NextResponse.json(
          { error: "Authentication required", provider: "firebase", hint: "Send a Firebase ID token as Authorization: Bearer <token>." },
          { status: 401 }
        )
      };
    }

    return {
      auth: {
        provider: "firebase" as const,
        userId: identity.uid,
        firebase: true,
        supabase: null
      },
      error: null
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      auth: null,
      error: NextResponse.json({ error: "No authenticated database backend is configured" }, { status: 503 })
    };
  }

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId || typeof userId !== "string") {
    return { auth: null, error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }

  return {
    auth: {
      provider: "supabase" as const,
      userId,
      firebase: false,
      supabase
    },
    error: null
  };
}
