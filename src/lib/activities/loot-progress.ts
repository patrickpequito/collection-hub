import { RAD_LOOT_ACTIVITY_PAGES } from "@/data/rad-loot/activity-pages";
import { filterExpiredActivityLoot } from "@/lib/activity-expired-content";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import type { AllLootItem } from "@/types/all-loot";
import type { LootItem } from "@/types/activity-loot";
import type { GuardianClass } from "@/types/armor-set";

export type Progress = { owned: number; total: number };

export type ActivityLootProgress = {
  weapons: Progress;
  /** Armor pieces owned per class for the activity's armor set(s). */
  armor: Partial<Record<GuardianClass, Progress>>;
  /** Everything on the page: weapons (incl. timelost), all-class armor, cosmetics. */
  total: Progress;
};

export function isCatalogItemOwned(item: AllLootItem, owned: Set<string>): boolean {
  return collectAllLootItemHashes(item).some((hash) => owned.has(hash));
}

/** Owned check by any manifest hash, resolving reissues through the catalog. */
export function buildOwnsHash(
  items: AllLootItem[],
  owned: Set<string>,
): (itemHash: string) => boolean {
  const catalogByHash = new Map<string, AllLootItem>();
  for (const item of items) {
    for (const hash of collectAllLootItemHashes(item)) {
      if (!catalogByHash.has(hash)) catalogByHash.set(hash, item);
    }
  }
  return (itemHash) => {
    const catalogItem = catalogByHash.get(itemHash);
    return catalogItem ? isCatalogItemOwned(catalogItem, owned) : owned.has(itemHash);
  };
}

function ownsLootItem(item: LootItem, ownsHash: (itemHash: string) => boolean): boolean {
  return [item.itemHash, ...(item.ownershipHashes ?? [])].some(ownsHash);
}

/** Weapons, per-class armor and total loot owned for one raid / dungeon / Pantheon page. */
export function activityLootProgress(
  slug: string,
  ownsHash: (itemHash: string) => boolean,
): ActivityLootProgress | null {
  const rawPage = RAD_LOOT_ACTIVITY_PAGES[slug];
  if (!rawPage) return null;
  const page = filterExpiredActivityLoot(rawPage);

  const armor: ActivityLootProgress["armor"] = {};
  for (const row of page.armorSets) {
    const pieces = Object.values(row.pieces).filter((piece) => piece !== undefined);
    const current = armor[row.guardianClass] ?? { owned: 0, total: 0 };
    armor[row.guardianClass] = {
      owned: current.owned + pieces.filter((piece) => ownsHash(piece.itemHash)).length,
      total: current.total + pieces.length,
    };
  }

  // Every distinct item on the page, counted once.
  const allItems = new Map<string, LootItem>();
  for (const item of [
    ...page.weapons,
    ...page.timelostWeapons,
    ...page.armorSets.flatMap((row) =>
      Object.values(row.pieces).filter((piece) => piece !== undefined),
    ),
    ...page.other,
  ]) {
    if (!allItems.has(item.itemHash)) allItems.set(item.itemHash, item);
  }
  const items = [...allItems.values()];

  return {
    total: {
      owned: items.filter((item) => ownsLootItem(item, ownsHash)).length,
      total: items.length,
    },
    weapons: {
      owned: page.weapons.filter((weapon) => ownsHash(weapon.itemHash)).length,
      total: page.weapons.length,
    },
    armor,
  };
}
