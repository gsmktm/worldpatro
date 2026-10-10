import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProbeStatus =
  | "connected"
  | "not-configured"
  | "invalid-config"
  | "invalid-credentials"
  | "schema-missing"
  | "permission-denied"
  | "upstream-error"
  | "network-error";

function result(status: ProbeStatus, httpStatus: number | null = null) {
  return NextResponse.json(
    {
      service: "supabase",
      status,
      connected: status === "connected",
      databaseVerified: status === "connected",
      // A successful anonymous SELECT verifies the API, connection and public read policy.
      // It does NOT test authentication, elevated privileges, writes or all schema migrations.
      scope: "read-only anonymous SELECT of calendar_profiles",
      httpStatus,
      checkedAt: new Date().toISOString()
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * Tests the actual Supabase PostgREST -> Postgres path rather than just
 * checking that environment variables exist. No credentials, data or raw
 * upstream error responses are returned to the caller.
 */
export async function GET() {
  if (!isSupabaseConfigured()) return result("not-configured");

  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  let origin: URL;

  try {
    origin = new URL(endpoint);
    if (origin.protocol !== "https:" || origin.username || origin.password ||
        origin.search || origin.hash || origin.pathname !== "/") {
      return result("invalid-config");
    }
  } catch {
    return result("invalid-config");
  }

  try {
    const url = new URL("/rest/v1/calendar_profiles", origin);
    url.searchParams.set("select", "slug");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000)
    });

    if (response.ok) {
      // A JSON response from this table proves a database query was served.
      const data: unknown = await response.json();
      return Array.isArray(data)
        ? result("connected", response.status)
        : result("upstream-error", response.status);
    }

    if (response.status === 401) return result("invalid-credentials", 401);
    if (response.status === 403) return result("permission-denied", 403);
    if (response.status === 404) return result("schema-missing", 404);
    return result("upstream-error", response.status);
  } catch {
    return result("network-error");
  }
}
