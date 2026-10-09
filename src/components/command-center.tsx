"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarResult } from "@/lib/calendars";
import { ANCHORS } from "@/lib/wbe";

type ApiPayload = {
  canonical: { isoDate: string; generatedAt: string; mode: string };
  calendars: CalendarResult[];
};

const commands = [
  "World Today",
  "Convert across 9 calendars",
  "Run WBE-9",
  "Open 729 Gates",
  "Country Brief",
  "Leader Brief",
  "Today's Sacred Time",
  "Show Sources"
];

export default function CommandCenter() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<ApiPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (target = date) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/patro/today?date=${encodeURIComponent(target)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not calculate the selected date.");
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(date); }, []);

  const calculated = useMemo(() => data?.calendars.filter((c) => c.status === "calculated").length ?? 0, [data]);

  return (
    <>
      <section className="hero">
        <div className="heroInner">
          <div className="eyebrow">Time · Calendars · Sacred Time · World Balance</div>
          <div className="om">ॐ</div>
          <h1>World Patro</h1>
          <div className="subtitle">Global Calendar & World Balance OS</div>
          <p className="tagline">
            Nine calendar systems, one canonical date context, and WBE-9 — 9 traditions × 9 grahas × 9 powers = 729 symbolic gates around one silent hub.
          </p>
          <nav className="nav">
            <a className="pill" href="#patro">9 Calendars</a>
            <a className="pill" href="#wbe">WBE-9</a>
            <a className="pill" href="/gates">729 Gates</a>
            <a className="pill" href="/api/v1/health">API Health</a>
          </nav>
        </div>
      </section>

      <main className="shell">
        <section id="patro" className="section">
          <div className="sectionHead">
            <div>
              <h2>9 Calendars → One Patro</h2>
              <p>Real calculation where the platform has a deterministic engine; explicit unsupported/source-required states where it does not.</p>
            </div>
            <p>{calculated}/9 currently calculated in this clean core.</p>
          </div>

          <div className="toolbar">
            <label htmlFor="date">Canonical date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className="button" onClick={() => void load()} disabled={loading}>{loading ? "Calculating…" : "One-Click Convert"}</button>
            {error && <span className="error">{error}</span>}
          </div>

          <div className="grid9">
            {(data?.calendars ?? []).map((calendar, index) => (
              <article className={`card ${index === 0 ? "primary" : ""}`} key={calendar.id}>
                <div className="cardTop">
                  <span className="icon">{calendar.icon}</span>
                  <span className={`badge ${calendar.status === "calculated" ? "status-ok" : "status-warn"}`}>{calendar.provenance}</span>
                </div>
                <h3>{calendar.name}</h3>
                <div className="date">{calendar.value}</div>
                <div className="meta"><strong>Method:</strong> {calendar.method}<br />{calendar.note}</div>
              </article>
            ))}
          </div>

          <div className="legend">
            <span>CALCULATED = deterministic engine</span>
            <span>OFFICIAL TABLE REQUIRED = no guessed date</span>
            <span>EPHEMERIS REQUIRED = astronomy/location needed</span>
          </div>
        </section>

        <section id="wbe" className="section">
          <div className="sectionHead">
            <div>
              <h2>WBE-9 · World Balance Ecosystem</h2>
              <p>Symbolic comparative framework. It is deliberately separated from empirical facts and does not claim any religion is ruled by a planet.</p>
            </div>
          </div>

          <div className="wbe">
            <div className="wheel">
              <div className="spokes">
                {ANCHORS.map((gate) => (
                  <div className="spoke" key={gate.code}>
                    <strong>{gate.graha}</strong>
                    <span>{gate.tradition}</span>
                    <span>{gate.power}</span>
                    <span>{gate.domain}</span>
                  </div>
                ))}
              </div>
              <div className="hub"><div><strong>G</strong><br /><small>Silent Hub</small></div></div>
            </div>

            <aside className="panel">
              <div className="eyebrow">One-Click Command Center</div>
              <h2>Nine spokes. One still center.</h2>
              <p className="meta">The 729 Gates are the full cross-product of traditions, grahas and powers. Only nine are Anchor Gates. Cross-gates are comparative lenses, never doctrinal assignments.</p>
              <div className="commands">
                {commands.map((command) => <div className="command" key={command}>{command}</div>)}
              </div>
              <div className="legend">
                <span>FACT</span><span>INTERPRETATION</span><span>WBE SYMBOLISM</span><span>SCENARIO</span><span>UNKNOWN</span>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell">World Patro · Nepal-origin, globally neutral · Symbolic WBE content is not scientific or doctrinal fact.</div>
      </footer>
    </>
  );
}
