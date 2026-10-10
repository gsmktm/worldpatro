"use client";

import { useCallback, useEffect, useState } from "react";

type CheckStatus = "connected" | "not-configured" | "invalid-config" | "invalid-credentials" |
  "schema-missing" | "permission-denied" | "upstream-error" | "network-error";

type Probe = {
  service: "supabase";
  status: CheckStatus;
  connected: boolean;
  databaseVerified: boolean;
  scope: string;
  httpStatus: number | null;
  checkedAt: string;
};

const messages: Record<CheckStatus, { title: string; detail: string; next: string }> = {
  connected: {
    title: "Reference database reachable",
    detail: "Supabase returned a valid anonymous database query. This does not verify private operations or admin access.",
    next: "Validate sign-in, owner-only records, content permissions and audit policies before changing the primary backend."
  },
  "not-configured": {
    title: "Supabase not configured",
    detail: "The deployment does not have both the Supabase URL and publishable key.",
    next: "Set the two NEXT_PUBLIC_SUPABASE_* variables in Vercel and deploy a fresh build."
  },
  "invalid-config": {
    title: "Endpoint configuration invalid",
    detail: "The Supabase API origin is missing or malformed.",
    next: "Use the exact HTTPS project URL, with no path, query or credentials."
  },
  "invalid-credentials": {
    title: "Publishable key rejected",
    detail: "The configured API key did not authenticate with the selected Supabase project.",
    next: "Check the project reference and active publishable key in Supabase Settings → API Keys."
  },
  "schema-missing": {
    title: "Reference schema unavailable",
    detail: "The project is reachable, but the expected public calendar_profiles table/API is missing.",
    next: "Apply the reviewed World Patro SQL migrations to this specific project and expose the table in the Data API."
  },
  "permission-denied": {
    title: "Reference read is denied",
    detail: "The anonymous app cannot read the expected reference table.",
    next: "Review the Data API grants and row-level security policies; do not disable RLS to fix this."
  },
  "upstream-error": {
    title: "Database API returned an error",
    detail: "The live Supabase response was not a successful reference-table query.",
    next: "Inspect the Supabase Data API, migrations and server logs; test again after correcting the error."
  },
  "network-error": {
    title: "Network connection unavailable",
    detail: "The World Patro server could not complete the Supabase request.",
    next: "Check regional networking, Supabase service health and DNS before retrying."
  }
};

export default function DatabaseHealth({ compact = false }: { compact?: boolean }) {
  const [probe, setProbe] = useState<Probe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/supabase/status", {
        cache: "no-store",
        signal,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("The database status endpoint is unavailable.");
      const result: Probe = await response.json();
      if (!result || result.service !== "supabase" || !(result.status in messages)) {
        throw new Error("The database status response is invalid.");
      }
      if (!signal?.aborted) setProbe(result);
    } catch (cause) {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : "Database check failed.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const connected = probe?.status === "connected";
  const message = probe ? messages[probe.status] : null;

  return <section className={"dbHealth" + (compact ? " dbHealthCompact" : "")} aria-label="Live Supabase connection check">
    <div className="dbHealthTop">
      <div className="dbHealthHeading">
        <span className="dbHealthGlyph" aria-hidden="true">◎</span>
        <div>
          <span className="eyebrow">DATA PLANE · WORLD PATRO</span>
          <h2>Supabase live connection</h2>
          <p>Real database read · public reference table · no credentials exposed</p>
        </div>
      </div>
      <button type="button" className="dbHealthRefresh" onClick={() => void refresh()} disabled={loading}>
        {loading ? "Checking…" : "Run live check ↻"}
      </button>
    </div>
    <div className="dbHealthResult" aria-live="polite" aria-atomic="true">
      <span className={"dbHealthSignal " + (loading ? "dbHealthSignalBusy" : connected ? "dbHealthSignalGood" : "dbHealthSignalPending")} aria-hidden="true" />
      <div>
        <strong>{loading ? "Checking database…" : error ? "Verification unavailable" : message?.title ?? "Not checked"}</strong>
        <p>{error || (loading ? "Requesting a bounded, read-only table query from the server." : message?.detail)}</p>
      </div>
      <span className={"dbHealthBadge " + (connected ? "dbHealthBadgeGood" : "")}>{loading ? "TESTING" : connected ? "READ VERIFIED" : "NOT VERIFIED"}</span>
    </div>
    <div className="dbHealthMeta">
      <div><span>Probe</span><strong>calendar_profiles</strong></div>
      <div><span>HTTP</span><strong>{probe?.httpStatus ?? "—"}</strong></div>
      <div><span>Last checked</span><strong>{probe && !Number.isNaN(Date.parse(probe.checkedAt)) ? new Date(probe.checkedAt).toLocaleString() : "—"}</strong></div>
    </div>
    {message && !loading && <p className="dbHealthNext"><strong>Next:</strong> {message.next}</p>}
    <p className="dbHealthBoundary">A successful public read confirms only this API/database path. It does not certify migrations, login, RLS for private records, admin permissions or production writes. Existing Firebase data is not modified.</p>
  </section>;
}
