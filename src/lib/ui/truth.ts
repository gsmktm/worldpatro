import type { CalendarResult, CalendarStatus } from "@/lib/calendars";
import type { TruthState } from "@/components/ui/truth-chip";

/** Maps the existing CalendarStatus union to a visible truth state. Display only — no data changes. */
const STATUS_TRUTH: Record<CalendarStatus, TruthState> = {
  "calculated": "fact",
  "authority-sourced": "authority",
  "authority-required": "unknown",
  "astronomy-required": "astronomy"
};

export function calendarTruth(c: Pick<CalendarResult, "status">): TruthState {
  return STATUS_TRUTH[c.status] ?? "unknown";
}
