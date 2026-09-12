import { MONUMENT_OF_TRIUMPH_LABEL } from "@/lib/all-loot/season-icon-label";

/**
 * Chronological sort key for Trials loot (oldest → newest).
 * Monument of Triumph shares a chapter number with Renegades but is the
 * current Trials era, so it always sorts after other labels at the same number.
 */
export function trialsReleaseSortKey(
  seasonLabel?: string,
  seasonNumber?: number,
): number {
  const base = seasonNumber ?? 0;
  if (seasonLabel === MONUMENT_OF_TRIUMPH_LABEL) {
    return base + 0.5;
  }
  return base;
}

export function compareTrialsReleaseOrder(
  a: { seasonLabel?: string; seasonNumber?: number; name?: string },
  b: { seasonLabel?: string; seasonNumber?: number; name?: string },
): number {
  const seasonDiff =
    trialsReleaseSortKey(a.seasonLabel, a.seasonNumber) -
    trialsReleaseSortKey(b.seasonLabel, b.seasonNumber);
  if (seasonDiff !== 0) return seasonDiff;
  const labelDiff = (a.seasonLabel ?? "").localeCompare(b.seasonLabel ?? "");
  if (labelDiff !== 0) return labelDiff;
  return (a.name ?? "").localeCompare(b.name ?? "");
}
