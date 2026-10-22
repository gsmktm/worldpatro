export type TruthState =
  | "fact" | "authority" | "astronomy" | "interpretation" | "symbolism" | "scenario" | "unknown";

export const TRUTH_LABEL: Record<TruthState, string> = {
  fact: "Fact",
  authority: "Authority",
  astronomy: "Astronomy",
  interpretation: "Interpretation",
  symbolism: "WBGR-109 Symbol",
  scenario: "Scenario",
  unknown: "Unknown"
};

export function TruthChip({ state, title }: { state: TruthState; title?: string }) {
  return (
    <span className={`truthChip t-${state}`} title={title} aria-label={`Truth state: ${TRUTH_LABEL[state]}`}>
      {TRUTH_LABEL[state]}
    </span>
  );
}

export function TruthLegend() {
  return (
    <div className="truthLegend" aria-label="Truth states">
      {(Object.keys(TRUTH_LABEL) as TruthState[]).map(s => <TruthChip key={s} state={s} />)}
    </div>
  );
}
