import type { RecordInstance } from "@/types/triumph";
import { isRecordRedeemed } from "@/lib/triumphs/record-progress";

/**
 * Destination "Activities" section (Combat / Exploration), built from
 * data/destination-activities.json (record, objective and checklist hashes
 * taken from the Bungie manifest).
 */

/** One trackable thing: a whole record, one objective of it, or a checklist entry. */
export type ActivityCheck = { r: string; o?: string } | { c: string; e: string };

/** Progress through a set: listed checks, or one objective's progress out of its total. */
export type ActivitySetSource =
  | { items: ActivityCheck[] }
  | { r: string; o: string; total: number };

export type ActivityTableBlock = {
  type: "table";
  title: string;
  columns: string[];
  rows: { name: string; sub?: string; cells: (ActivityCheck | null)[] }[];
};

export type ActivitySetBlock = {
  type: "set";
  title: string;
  items?: ActivityCheck[];
  progress?: { r: string; o: string; total: number };
};

export type ActivityTile = {
  name: string;
  /** Named rows, one mark each (Overthrow bosses). */
  rows?: { name: string; sub?: string | null; check: ActivityCheck }[];
  /** A run of marks (feathers per region, terminals per area). */
  set?: ActivitySetSource;
};

export type ActivityTilesBlock = {
  type: "tiles";
  title: string;
  columns: number;
  tiles: ActivityTile[];
};

/** The destination's repeatable activity, in its own colours. */
export type ActivityCardBlock = {
  type: "card";
  title: string;
  description: string;
  /** Count from activity history… */
  activityHashes?: string[];
  /** …or from a counting record's objective progress. */
  counter?: string;
};

export type ActivityBlock =
  | ActivityTableBlock
  | ActivitySetBlock
  | ActivityTilesBlock
  | ActivityCardBlock;

/** Row → columns → stacked blocks. A single column is full width. */
export type ActivityRow = ActivityBlock[][];

export type DestinationActivities = {
  combat: ActivityRow[];
  exploration: ActivityRow[];
};

export type ProgressSources = {
  signedIn: boolean;
  instances: Record<string, RecordInstance>;
  checklists: Record<string, Record<string, boolean>>;
};

function objectiveDone(instance: RecordInstance | undefined, objectiveHash: string): boolean {
  const objective = instance?.objectives.find((entry) => entry.objectiveHash === objectiveHash);
  return Boolean(objective && (objective.complete || objective.progress >= objective.completionValue));
}

function recordDone(instance: RecordInstance | undefined): boolean {
  if (!instance) return false;
  if (isRecordRedeemed(instance.state)) return true;
  if (!instance.objectives.length) return false;
  return instance.objectives.every((objective) => objective.complete || objective.progress >= objective.completionValue);
}

/** null when signed out (nothing to show yet). */
export function checkDone(check: ActivityCheck, sources: ProgressSources): boolean | null {
  if (!sources.signedIn) return null;
  if ("c" in check) return Boolean(sources.checklists[check.c]?.[check.e]);
  const instance = sources.instances[check.r];
  return check.o ? objectiveDone(instance, check.o) : recordDone(instance);
}

/** Marks for a set: true/false per item (null when signed out). */
export function setMarks(source: ActivitySetSource, sources: ProgressSources): (boolean | null)[] {
  if ("items" in source) return source.items.map((check) => checkDone(check, sources));
  if (!sources.signedIn) return Array.from({ length: source.total }, () => null);
  const objective = sources.instances[source.r]?.objectives.find((entry) => entry.objectiveHash === source.o);
  const done = Math.min(source.total, objective?.progress ?? 0);
  return Array.from({ length: source.total }, (_, index) => index < done);
}

export function blockSetSource(block: ActivitySetBlock): ActivitySetSource {
  return block.items ? { items: block.items } : block.progress!;
}

/** Highest objective progress on a counting record (interval objectives keep counting). */
export function counterValue(recordHash: string, sources: ProgressSources): number | null {
  if (!sources.signedIn) return null;
  const objectives = sources.instances[recordHash]?.objectives ?? [];
  return objectives.reduce((max, objective) => Math.max(max, objective.progress), 0);
}

/** Every mark in a block (cards don't count toward progress). */
export function blockMarks(block: ActivityBlock, sources: ProgressSources): (boolean | null)[] {
  switch (block.type) {
    case "table":
      return block.rows.flatMap((row) =>
        row.cells.filter((cell): cell is ActivityCheck => cell !== null).map((cell) => checkDone(cell, sources)),
      );
    case "set":
      return setMarks(blockSetSource(block), sources);
    case "tiles":
      return block.tiles.flatMap((tile) =>
        tile.rows
          ? tile.rows.map((row) => checkDone(row.check, sources))
          : tile.set
            ? setMarks(tile.set, sources)
            : [],
      );
    case "card":
      return [];
  }
}

export function allBlocks(activities: DestinationActivities): ActivityBlock[] {
  return [...activities.combat, ...activities.exploration].flatMap((row) => row.flat());
}

export function activitiesTally(activities: DestinationActivities, sources: ProgressSources) {
  const marks = allBlocks(activities).flatMap((block) => blockMarks(block, sources));
  return { done: marks.filter((mark) => mark === true).length, total: marks.length };
}

/** Activity hashes the page needs from activity history (repeatable cards). */
export function activityHistoryHashes(activities: DestinationActivities): string[] {
  return allBlocks(activities).flatMap((block) => (block.type === "card" ? (block.activityHashes ?? []) : []));
}
