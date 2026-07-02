import type { AllLootItemVersion } from "@/types/all-loot";

/** Seasons where Bungie gear tier (1–5) applies to weapons. */
export const GEAR_TIER_WEAPON_SEASON_LABELS = new Set([
  "The Edge of Fate",
  "Renegades",
  "Monument of Triumph",
]);

export function versionHasGearTierSystem(
  version: Pick<AllLootItemVersion, "seasonLabel" | "eventLabel">,
): boolean {
  const label = version.eventLabel ?? version.seasonLabel;
  return GEAR_TIER_WEAPON_SEASON_LABELS.has(label);
}

export function isValidGearTier(
  tier: number | null | undefined,
): tier is number {
  return typeof tier === "number" && tier >= 1 && tier <= 5;
}
