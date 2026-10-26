import {
  toLootItemFromCatalog,
  toLootItemFromCatalogVersion,
} from "@/lib/activities/loot-item";
import { compareTrialsReleaseOrder } from "@/lib/activities/trials-release-order";
import { dedupeVersionsForDisplay } from "@/lib/all-loot/season-badges";
import { TRIALS_VENDOR_EXCLUSIVE_WEAPONS, TRIALS_WEAPON_POOLS } from "@/data/activities/trials-of-osiris";
import type { TrialsWeaponSeasonGroup } from "@/types/activity-hub";
import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";
import type { LootItem } from "@/types/activity-loot";

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

function sortLootItems(a: LootItem, b: LootItem): number {
  const baseCompare = baseWeaponName(a.name).localeCompare(baseWeaponName(b.name));
  if (baseCompare !== 0) return baseCompare;
  const aAdept = a.name.includes("(Adept)");
  const bAdept = b.name.includes("(Adept)");
  if (aAdept !== bAdept) return aAdept ? 1 : -1;
  return a.name.localeCompare(b.name);
}

function seasonBucketKey(seasonNumber: number, seasonLabel: string): string {
  return `${seasonNumber}:${seasonLabel}`;
}

/**
 * Groups obtainable Trials weapons into every season/expansion that has a
 * catalog version — each section shows that season’s hash, icon, and watermark.
 */
export function groupTrialsWeaponsByReleaseSeason(
  catalogItems: AllLootItem[],
): TrialsWeaponSeasonGroup[] {
  const poolBaseNames = allTrialsPoolWeaponBaseNames();
  const seedWeapons = catalogItems.filter((item) =>
    isTrialsWeaponItem(item, poolBaseNames),
  );

  /** Include non-Adept siblings when only the Adept row carries a Trials source. */
  const relatedBaseNames = new Set<string>(poolBaseNames);
  for (const item of seedWeapons) {
    relatedBaseNames.add(baseWeaponName(item.name));
  }

  const trialsWeapons = catalogItems.filter(
    (item) =>
      item.type === "Weapon" &&
      item.obtainable &&
      relatedBaseNames.has(baseWeaponName(item.name)),
  );

  const seasonBuckets = new Map<
    string,
    { seasonLabel: string; seasonNumber: number; items: LootItem[] }
  >();

  for (const item of trialsWeapons) {
    const versions: AllLootItemVersion[] = dedupeVersionsForDisplay(item);

    for (const version of versions) {
      const seasonLabel = version.seasonLabel || item.seasonLabel || "Unknown";
      const seasonNumber = version.seasonNumber ?? item.seasonNumber ?? 0;
      const key = seasonBucketKey(seasonNumber, seasonLabel);
      const bucket = seasonBuckets.get(key) ?? {
        seasonLabel,
        seasonNumber,
        items: [],
      };

      if (bucket.items.some((existing) => existing.itemHash === version.itemHash)) {
        continue;
      }

      bucket.items.push(toLootItemFromCatalogVersion(item, version));
      seasonBuckets.set(key, bucket);
    }
  }

  return [...seasonBuckets.values()]
    .map(({ seasonLabel, seasonNumber, items }) => ({
      seasonLabel,
      seasonNumber,
      items: items.sort(sortLootItems),
    }))
    .sort(compareTrialsReleaseOrder);
}

/**
 * Trials weapons outside the bonus / Lighthouse pools, grouped by how you get them,
 * one entry per weapon (its newest version):
 * - vendorExclusive: sold only by Saint-14 (Focused Decoding → Vendor Exclusive Gear),
 * - adept: every Adept version (flawless rewards), pool weapons included,
 * - legacy: older Trials weapons still in the catalog.
 */
export function groupTrialsWeaponsByAcquisition(catalogItems: AllLootItem[]): {
  vendorExclusive: LootItem[];
  adept: LootItem[];
  legacy: LootItem[];
} {
  const poolBaseNames = allTrialsPoolWeaponBaseNames();
  const relatedBaseNames = new Set<string>(poolBaseNames);
  for (const item of catalogItems) {
    if (isTrialsWeaponItem(item, poolBaseNames)) relatedBaseNames.add(baseWeaponName(item.name));
  }
  for (const name of TRIALS_VENDOR_EXCLUSIVE_WEAPONS) relatedBaseNames.add(name);

  const newestByName = new Map<string, AllLootItem>();
  for (const item of catalogItems) {
    if (item.type !== "Weapon" || !item.obtainable || !relatedBaseNames.has(baseWeaponName(item.name))) continue;
    if (!newestByName.has(item.name)) newestByName.set(item.name, item);
  }

  const vendorNames = new Set<string>(TRIALS_VENDOR_EXCLUSIVE_WEAPONS);
  const groups = { vendorExclusive: [] as LootItem[], adept: [] as LootItem[], legacy: [] as LootItem[] };
  for (const item of newestByName.values()) {
    const lootItem = toLootItemFromCatalog(item);
    if (item.name.endsWith("(Adept)")) groups.adept.push(lootItem);
    else if (poolBaseNames.has(item.name)) continue;
    else if (vendorNames.has(item.name)) groups.vendorExclusive.push(lootItem);
    else groups.legacy.push(lootItem);
  }
  for (const list of Object.values(groups)) list.sort(sortLootItems);
  return groups;
}
