import {
  ARMOR_30_BASE_SOCKET_INDICES,
  ARMOR_30_EXOTIC_CLASS_SOCKET_INDICES,
  canonicalArmorStatHash,
  isTrackedArmorStatHash,
} from "@/lib/armor/constants";
import type {
  AllLootItem,
  PlugInvestmentStat,
  WeaponPlugDefinition,
} from "@/types/all-loot";

function addInvestment(
  totals: Record<string, number>,
  investment: PlugInvestmentStat,
) {
  const canonicalHash = canonicalArmorStatHash(investment.statHash);
  if (!canonicalHash) return;
  totals[canonicalHash] = (totals[canonicalHash] ?? 0) + investment.value;
}

export function isBaseArmorRollPlug(plug: WeaponPlugDefinition | undefined) {
  if (!plug) return false;
  const category = plug.plugCategoryIdentifier ?? "";
  return (
    category.includes("armor_archetypes") ||
    category.includes("armor_stats") ||
    category.includes("intrinsics")
  );
}

export function resolveIsArmor30ForHash(
  armor: AllLootItem,
  itemHash: string,
): boolean {
  return (
    armor.isArmor30ByItemHash?.[itemHash] ??
    (armor.itemHash === itemHash ? armor.isArmor30 : false) ??
    false
  );
}

export function resolveManifestInvestmentStats(
  armor: AllLootItem,
  itemHash: string,
): PlugInvestmentStat[] {
  return (
    armor.manifestInvestmentByItemHash?.[itemHash] ??
    (armor.itemHash === itemHash ? armor.manifestInvestmentStats : undefined) ??
    []
  );
}

export function buildArmor30BaseStatsByHash(
  manifestInvestmentStats: readonly PlugInvestmentStat[],
  socketPlugHashesByIndex: readonly (string | undefined)[],
  plugIndex: Record<string, WeaponPlugDefinition>,
  options?: { includeExoticClassSockets?: boolean },
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const investment of manifestInvestmentStats) {
    addInvestment(totals, investment);
  }

  const socketIndices: number[] = [...ARMOR_30_BASE_SOCKET_INDICES];
  if (options?.includeExoticClassSockets) {
    socketIndices.push(...ARMOR_30_EXOTIC_CLASS_SOCKET_INDICES);
  }

  for (const socketIndex of socketIndices) {
    const plugHash = socketPlugHashesByIndex[socketIndex];
    if (!plugHash) continue;

    const plug = plugIndex[plugHash];
    for (const investment of plug?.investmentStats ?? []) {
      addInvestment(totals, investment);
    }
  }

  return totals;
}

function normalizeStatsByHash(
  statsByHash: Record<string, number>,
): Record<string, number> {
  const normalized: Record<string, number> = {};

  for (const [hash, value] of Object.entries(statsByHash)) {
    const canonicalHash = canonicalArmorStatHash(hash);
    if (!canonicalHash) continue;
    normalized[canonicalHash] = (normalized[canonicalHash] ?? 0) + value;
  }

  return normalized;
}

export function subtractNonBasePlugInvestments(
  statsByHash: Record<string, number>,
  equippedPlugHashes: readonly string[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): Record<string, number> {
  const adjusted = normalizeStatsByHash(statsByHash);

  for (const plugHash of equippedPlugHashes) {
    const plug = plugIndex[plugHash];
    if (!plug?.investmentStats?.length || isBaseArmorRollPlug(plug)) {
      continue;
    }

    for (const investment of plug.investmentStats) {
      if (!isTrackedArmorStatHash(investment.statHash)) continue;
      const canonicalHash = canonicalArmorStatHash(investment.statHash);
      if (!canonicalHash) continue;
      const current = adjusted[canonicalHash];
      if (current === undefined) continue;
      adjusted[canonicalHash] = Math.max(0, current - investment.value);
    }
  }

  return adjusted;
}

function sumStatsByHash(statsByHash: Record<string, number>) {
  return Object.values(statsByHash).reduce((total, value) => total + value, 0);
}

export function resolveBaseArmorStatsByHash(
  armor: AllLootItem,
  instance: {
    itemHash: string;
    statsByHash: Record<string, number>;
    equippedPlugHashes: readonly string[];
    socketPlugHashesByIndex: readonly (string | undefined)[];
  },
  plugIndex: Record<string, WeaponPlugDefinition>,
): Record<string, number> {
  const isArmor30 = resolveIsArmor30ForHash(armor, instance.itemHash);

  const fromApi = subtractNonBasePlugInvestments(
    instance.statsByHash,
    instance.equippedPlugHashes,
    plugIndex,
  );

  if (isArmor30) {
    const fromInvestment = buildArmor30BaseStatsByHash(
      resolveManifestInvestmentStats(armor, instance.itemHash),
      instance.socketPlugHashesByIndex,
      plugIndex,
      {
        includeExoticClassSockets: armor.rarity === "Exotic",
      },
    );

    if (sumStatsByHash(fromInvestment) === 0) {
      return fromApi;
    }

    const merged = { ...fromApi };
    for (const [statHash, value] of Object.entries(fromInvestment)) {
      if (value > (merged[statHash] ?? 0)) {
        merged[statHash] = value;
      }
    }
    return merged;
  }

  return fromApi;
}
