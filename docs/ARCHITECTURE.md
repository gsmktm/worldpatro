# Architecture

World Patro is organized as independent layers:

1. **Time & Calendar Facts** — canonical date context, calendar adapters, timezone policy and astronomy.
2. **Sacred Time** — Panchang, religious observances and regional variants with method badges.
3. **Public World Intelligence** — future source-backed country, leader, diplomacy, treaty, election and indicator modules.
4. **WBE-9 Symbolism** — 729-gate comparative framework, never blended into empirical scoring.
5. **Research & Provenance** — future source registry, claims, evidence and correction history.
6. **Operations** — future watchlists, notifications and authorized workflows.

## Calendar adapter contract

Every production calendar adapter should implement:

- parseInput
- validate
- toCanonical
- fromCanonical
- getVariants
- getProvenance
- explain

Unsupported dates must return **unsupported/uncertain** rather than guessed values.

## Canonical context

Production should evolve toward:

```ts
type DateContext = {
  instantUtc: string;
  localDateTime: string;
  timezoneIana: string;
  utcOffset: string;
  lat?: number;
  lon?: number;
  altitudeM?: number;
  jurisdiction?: string;
  inputCalendar: string;
  variant?: string;
  locale: string;
  precision: "date" | "minute" | "second";
  sourceVersions: Record<string,string>;
};
```

## WBE

`src/lib/wbe.ts` generates the 729 Gates deterministically. Exactly nine gates have `anchor=true`.

The system must label WBE output as **WBE SYMBOLISM** and must never infer a user's religion or present planetary symbolism as a factual causal model.
