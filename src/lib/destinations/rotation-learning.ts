import type { ManualRotation } from "@/data/destinations/weekly-rotations";

/**
 * Learns a weekly rotation from the values the owner confirms in /admin.
 * Once every value has been seen, the confirmed weeks pin down the cycle (value by week
 * modulo its length) and the site predicts future weeks from it. Until then it falls back
 * to the hand-written order in weekly-rotations.ts.
 */

export type RotationStatus = "learning" | "predicted" | "confirmed";

export type ResolvedRotation = {
  entry: ManualRotation["order"][number];
  /** "override": the owner picked this week's value in /admin. */
  source: "override" | "learned" | "code";
  status: RotationStatus;
  /** Confirmed weeks, oldest first. */
  history: { week: number; name: string }[];
  /** Distinct values confirmed so far / cycle length. */
  seen: number;
};

const mod = (value: number, length: number) => ((value % length) + length) % length;

/**
 * Value by position in the cycle from confirmed weeks (newest wins when they disagree, so a
 * correction in /admin re-learns the order); null until every position is known.
 */
function learnedCycle(rotation: ManualRotation, history: { week: number; name: string }[]): {
  cycle: string[];
  consistent: boolean;
} | null {
  const length = rotation.order.length;
  const byPosition: (string | undefined)[] = Array.from({ length });
  let consistent = true;
  for (const { week, name } of [...history].reverse()) {
    const position = mod(week, length);
    if (!byPosition[position]) byPosition[position] = name;
    else if (byPosition[position] !== name) consistent = false;
  }
  if (byPosition.some((name) => !name)) return null;
  return { cycle: byPosition as string[], consistent };
}

export function resolveRotation(
  rotation: ManualRotation,
  week: number,
  historyByWeek: Record<string, string> | undefined,
  override: string | undefined,
): ResolvedRotation {
  const history = Object.entries(historyByWeek ?? {})
    .map(([key, name]) => ({ week: Number(key), name }))
    .filter((entry) => Number.isFinite(entry.week))
    .sort((a, b) => a.week - b.week);
  const seen = new Set(history.map((entry) => entry.name)).size;
  const length = rotation.order.length;
  const find = (name: string) => rotation.order.find((entry) => entry.name === name) ?? { name, detail: "" };

  const learned = learnedCycle(rotation, history);
  const repeated = learned !== null && learned.consistent && history.length > length;
  const status: RotationStatus = rotation.confirmed || repeated ? "confirmed" : learned ? "predicted" : "learning";

  if (override) return { entry: find(override), source: "override", status, history, seen };
  if (learned) return { entry: find(learned.cycle[mod(week, length)]), source: "learned", status, history, seen };

  const anchor = rotation.anchorWeek ?? week;
  return { entry: rotation.order[mod(week - anchor, length)], source: "code", status, history, seen };
}
