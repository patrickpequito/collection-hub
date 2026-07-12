import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { TRIALS_WEAPON_POOLS } from "@/data/activities/trials-of-osiris";
import type { TrialsWeaponSeasonGroup } from "@/types/activity-hub";
import type { AllLootItem } from "@/types/all-loot";

function isTrialsSource(source = ""): boolean {
  return /trials of osiris|saint-14 rank|lighthouse chest/i.test(source);
}

function baseWeaponName(name: string): string {
  return name.replace(/ \(Adept\)$/i, "");
}

function allTrialsPoolWeaponBaseNames(): Set<string> {
  const names = new Set<string>();
  for (const pool of TRIALS_WEAPON_POOLS) {
    for (const name of pool.weaponNames) {
      names.add(name);
    }
  }
  return names;
}

function isTrialsWeaponItem(
  item: AllLootItem,
  poolBaseNames: ReadonlySet<string>,
): boolean {
  if (item.type !== "Weapon" || !item.obtainable) return false;
  if (poolBaseNames.has(baseWeaponName(item.name))) return true;
  return isTrialsSource(item.source);
}

function sortWeaponItems(a: AllLootItem, b: AllLootItem): number {
  const baseCompare = baseWeaponName(a.name).localeCompare(baseWeaponName(b.name));
  if (baseCompare !== 0) return baseCompare;
  const aAdept = a.name.includes("(Adept)");
  const bAdept = b.name.includes("(Adept)");
  if (aAdept !== bAdept) return aAdept ? 1 : -1;
  return a.name.localeCompare(b.name);
}

/** Groups all obtainable Trials weapons by their original release season/expansion. */
export function groupTrialsWeaponsByReleaseSeason(
  catalogItems: AllLootItem[],
): TrialsWeaponSeasonGroup[] {
  const poolBaseNames = allTrialsPoolWeaponBaseNames();
  const trialsWeapons = catalogItems.filter((item) =>
    isTrialsWeaponItem(item, poolBaseNames),
  );

  const variantsByBase = new Map<string, AllLootItem[]>();
  for (const item of trialsWeapons) {
    const base = baseWeaponName(item.name);
    const bucket = variantsByBase.get(base) ?? [];
    bucket.push(item);
    variantsByBase.set(base, bucket);
  }

  const seasonBuckets = new Map<
    string,
    { seasonLabel: string; seasonNumber: number; items: AllLootItem[] }
  >();

  for (const variants of variantsByBase.values()) {
    const release = variants.reduce((earliest, item) =>
      (item.seasonNumber ?? 0) < (earliest.seasonNumber ?? 0) ? item : earliest,
    );

    const seasonNumber = release.seasonNumber ?? 0;
    const seasonLabel = release.seasonLabel ?? "Unknown";
    const key = `${seasonNumber}:${seasonLabel}`;
    const bucket = seasonBuckets.get(key) ?? {
      seasonLabel,
      seasonNumber,
      items: [],
    };

    for (const item of variants) {
      if (bucket.items.some((existing) => existing.itemHash === item.itemHash)) {
        continue;
      }
      bucket.items.push(item);
    }

    seasonBuckets.set(key, bucket);
  }

  return [...seasonBuckets.values()]
    .map(({ seasonLabel, seasonNumber, items }) => ({
      seasonLabel,
      seasonNumber,
      items: items.sort(sortWeaponItems).map(toLootItemFromCatalog),
    }))
    .sort(
      (a, b) =>
        b.seasonNumber - a.seasonNumber ||
        a.seasonLabel.localeCompare(b.seasonLabel),
    );
}
