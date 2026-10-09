"use client";

import { FormEvent, useState, useTransition } from "react";

type AgentReply = {
  answer: string;
  supervisor: string;
  model: string;
  delegated: Array<{ role: string; name: string }>;
};

const suggestions = [
  "Give me today's World Patro brief for Nepal.",
  "Explain today's Panchang and clearly separate astronomy from interpretation.",
  "Build a research plan for a country comparison using only public-source facts.",
  "Draft a verified workflow for publishing a World Patro daily brief."
];

export function AgentConsole({ date }: { date: string }) {
  const [input, setInput] = useState(suggestions[0]);
  const [reply, setReply] = useState<AgentReply | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function run(message: string) {
    const trimmed = message.trim();
    if (!trimmed) return;

    startTransition(async () => {
      setError("");
      setReply(null);
      try {
        const response = await fetch("/api/v1/agents/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            context: { date, iso3: "NPL", tz: "Asia/Kathmandu" }
          })
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.detail || body.error || "Agent request failed.");
        setReply(body);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Agent request failed.");
      }
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(input);
  }

  return <section className="agentConsole" aria-label="World Patro agent conductor">
    <div className="agentHead">
      <div>
        <div className="eyebrow">CONDUCTOR · SUPERVISOR + 6 SPECIALISTS</div>
        <h2>Ask the whole system.</h2>
      </div>
      <span className="liveBadge"><i/> bounded agents</span>
    </div>

    <div className="agentOrbit" aria-hidden="true">
      {["काल","ज्योति","पृथ्वी","सूत्र","मण्डल","कर्म"].map((mark, index) =>
        <span key={mark} style={{ "--i": index } as React.CSSProperties}>{mark}</span>
      )}
      <strong>G</strong>
    </div>

    <form className="agentForm" onSubmit={submit}>
      <label htmlFor="world-agent">Command / question</label>
      <textarea id="world-agent" value={input} onChange={event => setInput(event.target.value)} rows={4}/>
      <div className="agentActions">
        <button className="primaryBtn" disabled={pending}>{pending ? "Delegating…" : "Run Conductor"}</button>
        <span>Facts ≠ interpretation ≠ WBE symbolism</span>
      </div>
    </form>

    <div className="promptRail">
      {suggestions.map(item =>
        <button key={item} onClick={() => { setInput(item); run(item); }} disabled={pending}>{item}</button>
      )}
    </div>

    {error ? <div className="agentError">{error}</div> : null}

    {reply ? <div className="agentReply">
      <div className="delegationLine">
        <span>Delegated</span>
        {reply.delegated.length
          ? reply.delegated.map(item => <b key={item.role}>{item.name}</b>)
          : <b>Conductor only</b>}
      </div>
      <p>{reply.answer}</p>
      <small>{reply.supervisor} · {reply.model}</small>
    </div> : null}
  </section>;
}
