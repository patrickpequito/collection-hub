import type {
  RecordInstance,
  RecordObjectiveProgress,
  TitleEntry,
  TriumphProgress,
  TriumphRecord,
  TriumphStringVariables,
  TitleCompletionTier,
} from "@/types/triumph";

const STRING_VAR_PLACEHOLDER = /\{var:(\d+)\}/g;

export function resolveStringVariable(
  hash: string,
  stringVariables?: TriumphStringVariables,
): number | undefined {
  if (!stringVariables) return undefined;

  const profileValue = stringVariables.profile[hash];
  if (profileValue !== undefined) return profileValue;

  for (const charVars of Object.values(stringVariables.byCharacter)) {
    const value = charVars[hash];
    if (value !== undefined) return value;
  }

  return undefined;
}

/** Replaces Bungie {var:hash} placeholders in objective progress text. */
export function formatProgressDescription(
  text: string,
  options?: {
    stringVariables?: TriumphStringVariables;
    progressByHash?: Map<string, RecordObjectiveProgress>;
    fallbackValue?: number;
    /** Interval triumphs: match the progress bar, not unrelated account string vars. */
    preferFallbackValue?: boolean;
  },
): string {
  if (!text.includes("{var:")) return text;

  return text.replace(STRING_VAR_PLACEHOLDER, (_, hash) => {
    const fromProgress = options?.progressByHash?.get(hash)?.progress;
    const fromStringVar = resolveStringVariable(hash, options?.stringVariables);
    const fromFallback = options?.fallbackValue;

    const value = options?.preferFallbackValue
      ? (fromProgress ?? fromFallback ?? fromStringVar)
      : (fromStringVar ?? fromProgress ?? fromFallback);

    return value !== undefined ? String(value) : "0";
  });
}

/** DestinyRecordState flags from Bungie manifest. */
const RECORD_REDEEMED = 1;

export function isRecordRedeemed(state: number | undefined): boolean {
  return Boolean(state && (state & RECORD_REDEEMED));
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
  return isRecordRedeemed(instance?.state);
}

/** Triumph groups may infer completion from objective progress when state lags. */
export function isRecordInstanceComplete(
  record: TriumphRecord,
  instance: RecordInstance | undefined,
): boolean {
  if (isRecordRedeemed(instance?.state)) return true;

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
  intervalThresholds?: number[];
};

export type IntervalSegmentState = "empty" | "partial" | "complete";

export type IntervalSegment = {
  state: IntervalSegmentState;
  partialRatio: number;
};

export function getIntervalSegments(
  progress: number,
  thresholds: number[],
): IntervalSegment[] {
  return thresholds.map((threshold, index) => {
    const previousThreshold = index === 0 ? 0 : thresholds[index - 1];

    if (progress >= threshold) {
      return { state: "complete", partialRatio: 1 };
    }

    if (progress > previousThreshold) {
      return {
        state: "partial",
        partialRatio: (progress - previousThreshold) / (threshold - previousThreshold),
      };
    }

    return { state: "empty", partialRatio: 0 };
  });
}

function getIntervalProgress(
  record: TriumphRecord,
  progressByHash: Map<string, RecordObjectiveProgress>,
  recordComplete: boolean,
) {
  const objectives = record.objectives
    .slice()
    .sort((a, b) => a.completionValue - b.completionValue);
  const thresholds = objectives.map((objective) => objective.completionValue);
  const total = thresholds[thresholds.length - 1] ?? 1;

  let progress = 0;
  for (const manifestObjective of objectives) {
    const live = progressByHash.get(manifestObjective.objectiveHash);
    if (!live) continue;

    const threshold = manifestObjective.completionValue;

    if (live.complete) {
      progress = threshold;
      continue;
    }

    const liveProgress = live.progress ?? 0;
    if (liveProgress > 0) {
      progress = Math.max(progress, Math.min(liveProgress, threshold));
    }
  }

  const complete = recordComplete || progress >= total;

  return {
    progress: complete ? total : Math.min(progress, total),
    total,
    thresholds,
    complete,
  };
}

export function isTriumphRecordDisplayComplete(
  record: TriumphRecord,
  instance: RecordInstance | undefined,
  options?: { strictCompletion?: boolean; showProgress?: boolean },
): boolean {
  if (!options?.showProgress) return false;

  const strictCompletion = options.strictCompletion ?? false;
  const complete = strictCompletion
    ? isTitleTriumphComplete(instance)
    : isRecordInstanceComplete(record, instance);
  const objectives = getDisplayObjectives(record, instance, { strictCompletion });

  return (
    complete || (objectives.length > 0 && objectives.every((objective) => objective.complete))
  );
}

export function getDisplayObjectives(
  record: TriumphRecord,
  instance: RecordInstance | undefined,
  options?: {
    strictCompletion?: boolean;
    stringVariables?: TriumphStringVariables;
  },
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

  if (record.progressStyle === "interval") {
    const interval = getIntervalProgress(record, progressByHash, recordComplete);
    const rawLabel =
      record.objectives.find((objective) => objective.progressDescription)
        ?.progressDescription || record.name;
    const label = formatProgressDescription(rawLabel, {
      stringVariables: options?.stringVariables,
      progressByHash,
      fallbackValue: interval.progress,
      preferFallbackValue: true,
    });

    return [
      {
        label,
        progress: interval.progress,
        completionValue: interval.total,
        complete: interval.complete,
        intervalThresholds: interval.thresholds,
      },
    ];
  }

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

    const rawLabel = manifestObjective.progressDescription || record.name;

    return {
      label: formatProgressDescription(rawLabel, {
        stringVariables: options?.stringVariables,
        progressByHash,
        fallbackValue: progress,
      }),
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
  return a | b;
}
