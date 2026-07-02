import type { AllLootItem, WeaponStat } from "@/types/all-loot";
import {
  ARMOR_STAT_HASHES,
  ARMOR_STAT_HASHES_BY_NAME,
  ARMOR_STAT_ORDER,
  type ArmorStatName,
} from "@/lib/armor/constants";

function readStatValueFromHashMap(
  statsByHash: Record<string, { value?: number } | number>,
  hashes: readonly number[],
): number {
  let total = 0;
  for (const hash of hashes) {
    const entry = statsByHash[String(hash)];
    if (typeof entry === "number") {
      total += entry;
    } else if (entry?.value !== undefined) {
      total += entry.value;
    }
  }
  return total;
}

export function defaultArmorStats(): WeaponStat[] {
  return ARMOR_STAT_ORDER.map((name) => ({
    name,
    value: 0,
    max: 100,
  }));
}

export function armorStatsFromInstanceValues(
  values: Partial<Record<ArmorStatName, number>>,
  baseStats?: WeaponStat[],
): WeaponStat[] {
  const base = baseStats?.length ? baseStats : defaultArmorStats();
  const byName = new Map(base.map((stat) => [stat.name, stat]));

  return ARMOR_STAT_ORDER.map((name) => {
    const baseStat = byName.get(name);
    const value = values[name];
    return {
      name,
      value: value ?? baseStat?.value ?? 0,
      max: baseStat?.max ?? 100,
    };
  });
}

export function armorStatsFromHashMap(
  statsByHash: Record<string, { value?: number } | number>,
  baseStats?: WeaponStat[],
): WeaponStat[] {
  const values: Partial<Record<ArmorStatName, number>> = {};

  for (const name of ARMOR_STAT_ORDER) {
    const value = readStatValueFromHashMap(
      statsByHash,
      ARMOR_STAT_HASHES_BY_NAME[name],
    );
    if (value > 0) {
      values[name] = value;
    }
  }

  return armorStatsFromInstanceValues(values, baseStats);
}

export function sumArmorStats(stats: WeaponStat[]): number {
  return stats.reduce((total, stat) => total + stat.value, 0);
}

export function resolveArmorCatalogStats(
  armor: { stats?: WeaponStat[]; rarity: string },
): WeaponStat[] {
  if (armor.stats?.length) return armor.stats;
  return defaultArmorStats();
}

export function resolveArmorStatsForItemHash(
  armor: AllLootItem,
  itemHash: string,
): WeaponStat[] {
  // Exotic catalog stats are legacy investment intrinsics per hash, not armor
  // 3.0 roll stats — only show stats from inventory rolls for exotics.
  if (armor.rarity === "Exotic") {
    return defaultArmorStats();
  }

  const version = armor.versions?.find((entry) => entry.itemHash === itemHash);
  if (version?.stats?.length) {
    return version.stats;
  }

  if (itemHash === armor.itemHash) {
    return resolveArmorCatalogStats(armor);
  }

  return resolveArmorCatalogStats(armor);
}
