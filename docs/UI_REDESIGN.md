# UI Redesign · Himalayan Observatory

Rule: change the look, not the truth. No API, zod, RLS or calculation changes.

## Phase 1 (this branch)
- `src/app/styles/tokens.css` — prefixed design tokens + 7 truth-state colours + `.truthChip`.
- `src/components/ui/truth-chip.tsx` — `<TruthChip state>` and `<TruthLegend/>`.
- `src/lib/ui/truth.ts` — `CalendarStatus` → truth state (calculated→Fact, authority-sourced→Authority, authority-required→Unknown, astronomy-required→Astronomy).
- `src/lib/ui/moment.ts` — shared date/place context in the URL (lat limited to ±66 like `patro-day.ts`).

## Next phases
2. Shell: collapsible rail, top bar (city/date/clock/⌘K), mobile bottom bar.
3. Command Center: `/api/v1/patro/day` + `Promise.allSettled` so one failed feed never blanks the page; orbital clock hero; calendar stack with TruthChip.
4. Time modules: Patro, Panchang, Kundli, Muhurat.
5. Intelligence / Balance / Ops modules.
6. Playwright visual snapshots + axe on every `/app/*` route.
