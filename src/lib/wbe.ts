export const GRAHAS = [
  ["Sun · Surya", "Governance · leadership"],
  ["Moon · Chandra", "Water · ecology · nurture"],
  ["Mars · Mangala", "Protection · energy · emergency"],
  ["Mercury · Budha", "Education · communication · exchange"],
  ["Jupiter · Guru", "Community · law · philanthropy"],
  ["Venus · Shukra", "Peace · healing · arts"],
  ["Saturn · Shani", "Discipline · justice · sustainability"],
  ["Rahu", "Technology · truth · networks"],
  ["Ketu", "Contemplation · research · detachment"]
] as const;

export const TRADITIONS = [
  "Hindu traditions",
  "Taoist traditions",
  "Sikh tradition",
  "Jewish tradition",
  "Islamic tradition",
  "Christian traditions",
  "Jain traditions",
  "Zoroastrian tradition",
  "Buddhist traditions"
] as const;

export const POWERS = [
  "Dharma",
  "Wu Wei",
  "Seva",
  "Chokhmah",
  "Tawhid",
  "Agape",
  "Tapas / Ahimsa",
  "Asha",
  "Nirvana / Liberation"
] as const;

export type WbeGate = {
  code: string;
  tradition: string;
  graha: string;
  power: string;
  domain: string;
  anchor: boolean;
};

const code = (t: number, g: number, p: number) =>
  `WBE-${String(t + 1).padStart(2, "0")}-${String(g + 1).padStart(2, "0")}-${String(p + 1).padStart(2, "0")}`;

export const GATES: WbeGate[] = TRADITIONS.flatMap((tradition, t) =>
  GRAHAS.flatMap(([graha, domain], g) =>
    POWERS.map((power, p) => ({
      code: code(t, g, p),
      tradition,
      graha,
      power,
      domain,
      anchor: t === g && g === p
    }))
  )
);

export const ANCHORS = GATES.filter((gate) => gate.anchor);

export function classifyScore(score: number) {
  if (score < 4) return "deficiency";
  if (score > 8) return "potential excess";
  if (score >= 7) return "strong";
  return "constrained / stable";
}

export function assessWbe(scores: number[]) {
  if (scores.length !== 9) throw new Error("Exactly 9 scores are required.");
  const normalized = scores.map((score) => Math.max(0, Math.min(10, Number(score))));
  return normalized.map((score, index) => ({
    index: index + 1,
    graha: GRAHAS[index][0],
    domain: GRAHAS[index][1],
    anchorTradition: TRADITIONS[index],
    anchorPower: POWERS[index],
    score,
    state: classifyScore(score)
  }));
}
