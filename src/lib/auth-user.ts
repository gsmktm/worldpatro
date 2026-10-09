import { getFirebaseUser } from "@/lib/firebase/user";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type AppUser = {
  id: string;
  email?: string;
  provider: "firebase" | "supabase";
};

export async function getAuthenticatedUser(): Promise<AppUser | null> {
  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    return user ? { id: user.uid, email: user.email, provider: "firebase" } : null;
  }

  if (isSupabaseConfigured()) {
    const client = await createClient();
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? undefined,
      provider: "supabase"
    };
  }

  return null;
}
