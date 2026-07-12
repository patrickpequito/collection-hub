import type { AllLootItem } from "@/types/all-loot";

/** Player-facing expansion chapters (mirrors scripts/all-loot-mappings.mjs). */
const EXPANSION_LABELS = new Set([
  "Red War",
  "Curse of Osiris",
  "Warmind",
  "Forsaken",
  "Shadowkeep",
  "Beyond Light",
  "The Witch Queen",
  "Lightfall",
  "The Final Shape",
  "Into the Light",
  "The Edge of Fate",
  "Monument of Triumph",
  "Renegades",
]);

/**
 * Introduction season for legacy armor sets whose catalog row reflects a
 * re-release rather than debut (e.g. Y1/Y2 Crucible sets in Worthy/Arrivals).
 */
const LEGACY_ARMOR_INTRODUCTION_SEASONS: Record<
  string,
  { seasonLabel: string; seasonNumber: number }
> = {
  "binary phoenix set": { seasonLabel: "Red War", seasonNumber: 1 },
  "wing set": { seasonLabel: "Forsaken", seasonNumber: 4 },
};

function normalizeLegacySetKey(setName: string): string {
  return setName.replace(/\s+set$/i, "").trim().toLowerCase();
}

type SeasonCandidate = { seasonNumber: number; seasonLabel?: string };

function addCandidate(
  candidates: SeasonCandidate[],
  seasonNumber?: number,
  seasonLabel?: string,
) {
  if (!seasonNumber || seasonNumber <= 0) return;
  candidates.push({ seasonNumber, seasonLabel });
}

function collectSeasonCandidates(items: AllLootItem[]): SeasonCandidate[] {
  const candidates: SeasonCandidate[] = [];
  for (const item of items) {
    addCandidate(candidates, item.seasonNumber, item.seasonLabel);
    for (const version of item.versions ?? []) {
      addCandidate(candidates, version.seasonNumber, version.seasonLabel);
    }
  }
  return candidates;
}

/** Introduction season for a legacy armor set (debut, not latest re-release). */
export function resolveIntroductionSeasonFromItems(
  items: AllLootItem[],
  setName?: string,
): { seasonLabel?: string; seasonNumber: number } {
  if (setName) {
    const override =
      LEGACY_ARMOR_INTRODUCTION_SEASONS[normalizeLegacySetKey(setName)];
    if (override) return override;
  }

  if (!items.length) {
    return { seasonLabel: undefined, seasonNumber: 0 };
  }

  let primaryMin = Infinity;
  let primaryLabel: string | undefined;
  for (const item of items) {
    const number = item.seasonNumber ?? 0;
    if (number > 0 && number < primaryMin) {
      primaryMin = number;
      primaryLabel = item.seasonLabel;
    }
  }

  const candidates = collectSeasonCandidates(items);
  let expansionMin = Infinity;
  let expansionLabel: string | undefined;
  for (const candidate of candidates) {
    const label = candidate.seasonLabel ?? "";
    if (!EXPANSION_LABELS.has(label)) continue;
    if (candidate.seasonNumber < expansionMin) {
      expansionMin = candidate.seasonNumber;
      expansionLabel = label;
    }
  }

  // Re-released Y1/Y2 vendor sets keep a newer canonical row but retain an
  // expansion-labeled version from their original drop.
  if (
    Number.isFinite(primaryMin) &&
    primaryMin >= 10 &&
    expansionMin < primaryMin
  ) {
    return { seasonLabel: expansionLabel, seasonNumber: expansionMin };
  }

  if (!Number.isFinite(primaryMin)) {
    return { seasonLabel: undefined, seasonNumber: 0 };
  }

  return { seasonLabel: primaryLabel, seasonNumber: primaryMin };
}
