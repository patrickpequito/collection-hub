import type { ResolvedWeaponGodRoll } from "@/types/weapon-god-rolls";
import type {
  ResolvedWeaponPerkColumn,
  WeaponPlugDefinition,
} from "@/types/all-loot";
import { resolveGodRollPlugsByColumn } from "@/lib/weapons/god-roll-highlights";
import type { WeaponRollScores } from "@/types/weapon-rolls";

function equippedPlugNames(
  equippedPlugHashes: readonly string[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): Set<string> {
  const names = new Set<string>();
  for (const hash of equippedPlugHashes) {
    const name = plugIndex[hash]?.name;
    if (name) names.add(name);
  }
  return names;
}

export function scoreGodRollMode(
  equippedPlugHashes: readonly string[],
  godPlugs: string[] | undefined,
  options?: {
    columns?: ResolvedWeaponPerkColumn[];
    plugIndex?: Record<string, WeaponPlugDefinition>;
  },
): number | null {
  if (!godPlugs?.length) return null;

  const plugIndex = options?.plugIndex ?? {};
  const columns = options?.columns ?? [];
  const equipped = new Set(equippedPlugHashes);
  const equippedNames = equippedPlugNames(equippedPlugHashes, plugIndex);

  if (columns.length) {
    const resolved = resolveGodRollPlugsByColumn(godPlugs, columns, plugIndex);
    let matches = 0;

    for (let index = 0; index < godPlugs.length; index++) {
      const resolvedHash = resolved[index];
      const godName = plugIndex[godPlugs[index]]?.name;

      if (resolvedHash && equipped.has(resolvedHash)) {
        matches++;
        continue;
      }

      if (godName && equippedNames.has(godName)) {
        matches++;
      }
    }

    return Math.round((matches / godPlugs.length) * 100);
  }

  const matches = godPlugs.filter((plugHash) => equipped.has(plugHash)).length;
  return Math.round((matches / godPlugs.length) * 100);
}

export function scoreWeaponRoll(
  equippedPlugHashes: readonly string[],
  godRoll: ResolvedWeaponGodRoll | null,
  options?: {
    columns?: ResolvedWeaponPerkColumn[];
    plugIndex?: Record<string, WeaponPlugDefinition>;
  },
): WeaponRollScores {
  if (!godRoll) {
    return { pvePercent: null, pvpPercent: null };
  }

  return {
    pvePercent: scoreGodRollMode(equippedPlugHashes, godRoll.pve, options),
    pvpPercent: scoreGodRollMode(equippedPlugHashes, godRoll.pvp, options),
  };
}

function strictlyDominatesBothModes(
  challenger: WeaponRollScores,
  target: WeaponRollScores,
): boolean {
  const { pvePercent: challengerPve, pvpPercent: challengerPvp } = challenger;
  const { pvePercent: targetPve, pvpPercent: targetPvp } = target;

  if (
    challengerPve === null ||
    challengerPvp === null ||
    targetPve === null ||
    targetPvp === null
  ) {
    return false;
  }

  return challengerPve > targetPve && challengerPvp > targetPvp;
}

function paretoDominates(
  challenger: WeaponRollScores,
  target: WeaponRollScores,
): boolean {
  const { pvePercent: challengerPve, pvpPercent: challengerPvp } = challenger;
  const { pvePercent: targetPve, pvpPercent: targetPvp } = target;

  const pveBeats =
    challengerPve !== null &&
    targetPve !== null &&
    challengerPve >= targetPve;
  const pvpBeats =
    challengerPvp !== null &&
    targetPvp !== null &&
    challengerPvp >= targetPvp;

  if (!pveBeats || !pvpBeats) return false;

  const pveStrict =
    challengerPve !== null && targetPve !== null && challengerPve > targetPve;
  const pvpStrict =
    challengerPvp !== null && targetPvp !== null && challengerPvp > targetPvp;

  return pveStrict || pvpStrict;
}

export type ScoredWeaponRoll<T> = T & {
  scores: WeaponRollScores;
  isBest: boolean;
  isShardCandidate: boolean;
};

export function rankWeaponRolls<T extends { scores: WeaponRollScores }>(
  rolls: T[],
): ScoredWeaponRoll<T>[] {
  return rolls.map((roll) => {
    const isShardCandidate = rolls.some(
      (other) =>
        other !== roll && strictlyDominatesBothModes(other.scores, roll.scores),
    );

    const isBest =
      rolls.length <= 1 ||
      !rolls.some(
        (other) => other !== roll && paretoDominates(other.scores, roll.scores),
      );

    return { ...roll, isBest, isShardCandidate };
  });
}

export function compareWeaponRollsByPveThenPvp<
  T extends { scores: WeaponRollScores },
>(a: T, b: T): number {
  const pveDiff = (b.scores.pvePercent ?? -1) - (a.scores.pvePercent ?? -1);
  if (pveDiff !== 0) return pveDiff;
  return (b.scores.pvpPercent ?? -1) - (a.scores.pvpPercent ?? -1);
}
