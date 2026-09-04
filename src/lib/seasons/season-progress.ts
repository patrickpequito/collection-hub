import { countOwnedGroups } from "@/lib/expansions/expansion-progress";

export type SeasonProgressInputs = {
  slug: string;
  progressTotal: number;
  progressOwnershipGroups: string[][];
};

export type SeasonOverallProgress = {
  completed: number;
  total: number;
  /** 0–1 when signed in; null when unknown. */
  progress: number | null;
  /** 0–100 rounded when signed in; null when unknown. */
  percent: number | null;
};

export function computeSeasonOverallProgress(
  inputs: SeasonProgressInputs,
  ownedItemHashes: Set<string> | null,
  signedIn: boolean,
): SeasonOverallProgress {
  const total = inputs.progressTotal;

  if (!signedIn || !ownedItemHashes) {
    return { completed: 0, total, progress: null, percent: null };
  }

  const completed = countOwnedGroups(
    inputs.progressOwnershipGroups,
    ownedItemHashes,
  );
  const progress = total === 0 ? 0 : completed / total;
  const percent = Math.round(progress * 100);

  return { completed, total, progress, percent };
}
