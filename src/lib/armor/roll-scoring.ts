import type { WeaponStat } from "@/types/all-loot";
import { sumArmorStats } from "@/lib/armor/stats";
import type { ArmorRollInstance } from "@/types/armor-rolls";

export type ScoredArmorRoll<T> = T & {
  isBest: boolean;
  isShardCandidate: boolean;
};

export function rankArmorRolls<T extends Pick<ArmorRollInstance, "archetype" | "totalStats">>(
  rolls: T[],
): ScoredArmorRoll<T>[] {
  const bestTotalByArchetype = new Map<string, number>();

  for (const roll of rolls) {
    const key = roll.archetype ?? "";
    const current = bestTotalByArchetype.get(key) ?? -1;
    if (roll.totalStats > current) {
      bestTotalByArchetype.set(key, roll.totalStats);
    }
  }

  return rolls.map((roll) => {
    const key = roll.archetype ?? "";
    const bestTotal = bestTotalByArchetype.get(key) ?? roll.totalStats;
    const isBest = roll.totalStats >= bestTotal;
    const isShardCandidate =
      Boolean(key) &&
      rolls.length > 1 &&
      roll.totalStats < bestTotal &&
      rolls.some(
        (other) =>
          other !== roll &&
          other.archetype === roll.archetype &&
          other.totalStats > roll.totalStats,
      );

    return { ...roll, isBest, isShardCandidate };
  });
}

export function compareArmorRollsByTotal<
  T extends Pick<ArmorRollInstance, "totalStats" | "tier">,
>(a: T, b: T): number {
  const totalDiff = b.totalStats - a.totalStats;
  if (totalDiff !== 0) return totalDiff;
  return (b.tier ?? 0) - (a.tier ?? 0);
}

export function buildArmorRollMetrics(
  stats: WeaponStat[],
  archetype: string | null,
  tier: number | null,
) {
  return {
    totalStats: sumArmorStats(stats),
    tier,
    archetype,
  };
}
