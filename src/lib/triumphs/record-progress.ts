import type {
  RecordInstance,
  RecordObjectiveProgress,
  TitleEntry,
  TriumphProgress,
  TriumphRecord,
  TitleCompletionTier,
} from "@/types/triumph";

/** DestinyRecordState flags from Bungie manifest. */
const RECORD_REDEEMED = 1;
const OBJECTIVE_NOT_COMPLETED = 2;
const OBSCURED = 4;
const RECORD_BLOCKED = 8;

export function isRecordRedeemed(state: number | undefined): boolean {
  return Boolean(state && (state & RECORD_REDEEMED));
}

export function isRecordComplete(state: number | undefined): boolean {
  if (!state) return false;
  if (state & RECORD_REDEEMED) return true;
  if (state & RECORD_BLOCKED) return false;
  if (state === OBSCURED) return false;
  if (state & OBJECTIVE_NOT_COMPLETED) return false;
  return true;
}

function isObjectiveComplete(
  progress: number,
  completionValue: number,
  completeFlag?: boolean,
): boolean {
  if (completeFlag) return true;
  return completionValue > 0 && progress >= completionValue;
}

/**
 * Title triumphs must match in-game seal progress — Bungie record state only.
 * Lifetime objective progress must not mark a title triumph complete.
 */
export function isTitleTriumphComplete(
  instance: RecordInstance | undefined,
): boolean {
  return isRecordComplete(instance?.state);
}

/** Triumph groups may infer completion from objective progress when state lags. */
export function isRecordInstanceComplete(
  record: TriumphRecord,
  instance: RecordInstance | undefined,
): boolean {
  if (isRecordComplete(instance?.state)) return true;

  if (!record.objectives.length) {
    return false;
  }

  const progressByHash = new Map(
    (instance?.objectives ?? []).map((objective) => [
      objective.objectiveHash,
      objective,
    ]),
  );

  return record.objectives.every((manifestObjective) => {
    const live = progressByHash.get(manifestObjective.objectiveHash);
    return isObjectiveComplete(
      live?.progress ?? 0,
      manifestObjective.completionValue,
      live?.complete,
    );
  });
}

function countRecordsProgress(
  records: TriumphRecord[],
  recordInstances: Map<string, RecordInstance>,
  isComplete: (
    record: TriumphRecord,
    instance: RecordInstance | undefined,
  ) => boolean,
): TriumphProgress {
  const total = records.length;
  let completed = 0;
  for (const record of records) {
    if (isComplete(record, recordInstances.get(record.recordHash))) {
      completed += 1;
    }
  }
  return { completed, total };
}

export function countTriumphProgress(
  records: TriumphRecord[],
  recordInstances: Map<string, RecordInstance>,
): TriumphProgress {
  return countRecordsProgress(records, recordInstances, isRecordInstanceComplete);
}

export function countTitleTriumphProgress(
  records: TriumphRecord[],
  recordInstances: Map<string, RecordInstance>,
): TriumphProgress {
  return countRecordsProgress(
    records,
    recordInstances,
    (record, instance) => isTitleTriumphComplete(instance),
  );
}

export function progressPercent({ completed, total }: TriumphProgress): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function splitTitleRecords(records: TriumphRecord[]) {
  return {
    baseRecords: records.filter((record) => !record.forTitleGilding),
    gildingRecords: records.filter((record) => record.forTitleGilding),
  };
}

function fullProgress(total: number): TriumphProgress {
  return { completed: total, total };
}

function isBaseTitleComplete(
  title: TitleEntry,
  base: TriumphProgress,
  recordInstances: Map<string, RecordInstance>,
): boolean {
  if (
    title.completionRecordHash !== null &&
    isRecordRedeemed(recordInstances.get(title.completionRecordHash)?.state)
  ) {
    return true;
  }
  return base.total > 0 && base.completed === base.total;
}

function isGildingTitleComplete(
  title: TitleEntry,
  gilding: TriumphProgress,
  recordInstances: Map<string, RecordInstance>,
): boolean {
  if (
    title.gildingTrackingRecordHash !== null &&
    isRecordRedeemed(recordInstances.get(title.gildingTrackingRecordHash)?.state)
  ) {
    return true;
  }
  return gilding.total > 0 && gilding.completed === gilding.total;
}

export function countTitleProgress(
  title: TitleEntry,
  recordInstances: Map<string, RecordInstance>,
) {
  const { baseRecords, gildingRecords } = splitTitleRecords(title.records);
  const baseFromRecords = countTitleTriumphProgress(baseRecords, recordInstances);
  const gildingFromRecords = countTitleTriumphProgress(
    gildingRecords,
    recordInstances,
  );

  const titleSealEarned =
    title.completionRecordHash !== null &&
    isRecordRedeemed(recordInstances.get(title.completionRecordHash)?.state);

  const gildingSealEarned =
    title.gildingTrackingRecordHash !== null &&
    isRecordRedeemed(recordInstances.get(title.gildingTrackingRecordHash)?.state);

  const base = titleSealEarned ? fullProgress(baseRecords.length) : baseFromRecords;
  const gilding = gildingFromRecords;

  const baseCompleted = base.completed;
  const gildingCompleted = gildingSealEarned
    ? gildingRecords.length
    : gilding.completed;

  return {
    base,
    gilding,
    all: {
      completed: baseCompleted + gildingCompleted,
      total: baseRecords.length + gildingRecords.length,
    },
  };
}

export function getTitleCompletionTier(
  title: TitleEntry,
  recordInstances: Map<string, RecordInstance>,
): TitleCompletionTier {
  const progress = countTitleProgress(title, recordInstances);
  const baseComplete = isBaseTitleComplete(
    title,
    progress.base,
    recordInstances,
  );

  if (!baseComplete) {
    return "none";
  }

  if (isGildingTitleComplete(title, progress.gilding, recordInstances)) {
    return "gilded";
  }

  return "base";
}

export type DisplayObjective = {
  label: string;
  progress: number;
  completionValue: number;
  complete: boolean;
};

export function getDisplayObjectives(
  record: TriumphRecord,
  instance: RecordInstance | undefined,
  options?: { strictCompletion?: boolean },
): DisplayObjective[] {
  if (!record.objectives.length) return [];

  const strict = options?.strictCompletion ?? false;
  const progressByHash = new Map(
    (instance?.objectives ?? []).map((objective) => [
      objective.objectiveHash,
      objective,
    ]),
  );

  const recordComplete = strict
    ? isTitleTriumphComplete(instance)
    : isRecordInstanceComplete(record, instance);

  return record.objectives.map((manifestObjective) => {
    const live = progressByHash.get(manifestObjective.objectiveHash);
    const completionValue = manifestObjective.completionValue;
    const progress = live?.progress ?? 0;
    const objectiveComplete = isObjectiveComplete(
      progress,
      completionValue,
      live?.complete,
    );
    const complete = recordComplete
      ? true
      : strict
        ? objectiveComplete
        : recordComplete || objectiveComplete;

    return {
      label: manifestObjective.progressDescription || record.name,
      progress: complete ? completionValue : progress,
      completionValue,
      complete,
    };
  });
}

export function getDisplayObjective(
  record: TriumphRecord,
  instance: RecordInstance | undefined,
  options?: { strictCompletion?: boolean },
) {
  const objectives = getDisplayObjectives(record, instance, options);
  if (!objectives.length) return null;

  const firstIncomplete = objectives.find((objective) => !objective.complete);
  return firstIncomplete ?? objectives[objectives.length - 1];
}

export function mergeObjectiveProgress(
  existing: RecordObjectiveProgress[],
  incoming: RecordObjectiveProgress[],
): RecordObjectiveProgress[] {
  const byHash = new Map(
    existing.map((objective) => [objective.objectiveHash, { ...objective }]),
  );

  for (const objective of incoming) {
    const current = byHash.get(objective.objectiveHash);
    if (!current) {
      byHash.set(objective.objectiveHash, { ...objective });
      continue;
    }

    current.progress = Math.max(current.progress, objective.progress);
    current.complete = current.complete || objective.complete;
    if (objective.completionValue > current.completionValue) {
      current.completionValue = objective.completionValue;
    }
  }

  return [...byHash.values()];
}

export function mergeRecordState(a: number, b: number): number {
  if (isRecordRedeemed(a) || isRecordRedeemed(b)) {
    return isRecordRedeemed(a) ? a : b;
  }
  if (isRecordComplete(a) || isRecordComplete(b)) {
    return isRecordComplete(a) ? a : b;
  }
  return a || b;
}
