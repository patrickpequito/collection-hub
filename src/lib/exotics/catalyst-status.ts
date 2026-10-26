import type { CatalystPlugState } from "@/lib/exotics/catalyst-plugs";
import type { ExoticCatalystEntry } from "@/lib/exotics/page-data";
import type { RecordInstance } from "@/types/triumph";

/** DestinyRecordState flags. */
const RECORD_REDEEMED = 1;
const OBJECTIVE_NOT_COMPLETED = 4;
/** Set while a classic catalyst hasn't dropped yet. */
const OBSCURED = 8;

export type CatalystObjectiveProgress = {
  description: string;
  progress: number;
  completionValue: number;
};

export type CatalystStatus =
  | { kind: "unknown" }
  | { kind: "missing" }
  | { kind: "progress"; objectives: CatalystObjectiveProgress[] }
  | { kind: "unlocked" };

export type CatalystLiveData = {
  plugs: Record<string, CatalystPlugState> | null;
  instances: Record<string, RecordInstance> | null;
  ownedItemHashes: ReadonlySet<string>;
};

/** Share of the remaining objectives already done (0–1). */
export function progressShare(status: CatalystStatus): number {
  if (status.kind !== "progress") return status.kind === "unlocked" ? 1 : 0;
  const total = status.objectives.reduce((sum, entry) => sum + entry.completionValue, 0);
  const done = status.objectives.reduce((sum, entry) => sum + Math.min(entry.progress, entry.completionValue), 0);
  return total > 0 ? done / total : 0;
}

function describe(
  catalyst: ExoticCatalystEntry,
  live: { objectiveHash: string; progress: number; completionValue: number }[],
): CatalystObjectiveProgress[] {
  return catalyst.objectives.map((objective) => {
    const current = live.find((entry) => entry.objectiveHash === objective.objectiveHash);
    const completionValue = current?.completionValue ?? objective.completionValue;
    return {
      description: objective.description || "Progress",
      progress: Math.min(current?.progress ?? 0, completionValue),
      completionValue,
    };
  });
}

/**
 * One catalyst's state. Live plug data (account plug sets / weapon plug
 * objectives) carries the real kill counter; the catalyst triumph is only a
 * fallback for found / unlocked.
 */
export function catalystStatus(catalyst: ExoticCatalystEntry, data: CatalystLiveData): CatalystStatus {
  if (!data.plugs || !data.instances) return { kind: "unknown" };

  // Live plug data wins: the collection-wide ownership set also counts
  // locked options ("Not found yet" in game) as owned.
  const plug = catalyst.ownershipHashes.map((hash) => data.plugs![hash]).find(Boolean);
  if (plug) {
    if (plug.inserted || plug.canInsert) return { kind: "unlocked" };
    if (plug.found) {
      const objectives = describe(catalyst, plug.objectives);
      const open = objectives.filter((entry) => entry.progress < entry.completionValue);
      // Objectives done but not insertable yet still counts as ready.
      if (open.length === 0) return { kind: "unlocked" };
      return { kind: "progress", objectives };
    }
    if (!catalyst.recordHash) return { kind: "missing" };
  }

  if (!plug && catalyst.ownershipHashes.some((hash) => data.ownedItemHashes.has(hash))) {
    return { kind: "unlocked" };
  }

  const record = catalyst.recordHash ? data.instances[catalyst.recordHash] : undefined;
  if (record) {
    if (record.state & RECORD_REDEEMED) return { kind: "unlocked" };
    if (record.state & OBSCURED) return { kind: "missing" };
    if (!(record.state & OBJECTIVE_NOT_COMPLETED)) return { kind: "unlocked" };
    return { kind: "progress", objectives: describe(catalyst, record.objectives) };
  }
  return { kind: "missing" };
}

/** Weapon-level summary: the most advanced of its catalysts. */
export function bestCatalystStatus(statuses: CatalystStatus[]): CatalystStatus {
  if (statuses.length === 0) return { kind: "missing" };
  if (statuses.some((status) => status.kind === "unknown")) return { kind: "unknown" };
  const unlocked = statuses.find((status) => status.kind === "unlocked");
  if (unlocked) return unlocked;
  const inProgress = statuses
    .filter((status) => status.kind === "progress")
    .sort((a, b) => progressShare(b) - progressShare(a));
  return inProgress[0] ?? { kind: "missing" };
}
