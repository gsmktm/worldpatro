import Link from "next/link";
import { GATES } from "@/lib/wbe";
import { wbgrGateCode } from "@/lib/wbgr";

export default function GatesPage() {
  const preview = GATES.slice(0, 81);
  return (
    <main className="shell section">
      <div className="sectionHead">
        <div>
          <div className="eyebrow">WBGR-109 · 1799 BS · WENS</div>
          <h2>Gate Explorer</h2>
          <p>9 traditions × 9 grahas × 9 powers. Showing the first 81; the API exposes every gate with pagination.</p>
        </div>
        <Link className="pill" href="/">← Command Center</Link>
      </div>
      <div className="grid9">
        {preview.map((gate) => (
          <article className={`card ${gate.anchor ? "primary" : ""}`} key={gate.code}>
            <div className="cardTop"><strong>{wbgrGateCode(gate.code)}</strong><span className="badge">{gate.anchor ? "ANCHOR" : "CROSS-GATE"}</span></div>
            <div className="date">{gate.graha}</div>
            <div className="meta">{gate.tradition}<br />{gate.power}<br />{gate.domain}</div>
          </article>
        ))}
      </div>
    </main>
  );
}
