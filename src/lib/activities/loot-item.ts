import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";

export function weaponMetaFromCatalogItem(
  item: AllLootItem,
): Pick<LootItem, "classOrWeaponType" | "damageType" | "ammoType"> {
  if (item.type === "Weapon") {
    return {
      classOrWeaponType: item.classOrWeaponType,
      damageType: item.damageType,
      ammoType: item.ammoType,
    };
  }

  if (item.type === "Armor") {
    return { classOrWeaponType: item.classOrWeaponType };
  }

  return {};
}

export function toLootItemFromCatalog(item: AllLootItem): LootItem {
  return {
    itemHash: item.itemHash,
    name: item.name,
    iconPath: item.iconPath,
    source: item.source,
    seasonIconPath: item.seasonIconPath,
    seasonLabel: item.seasonLabel,
    seasonNumber: item.seasonNumber,
    // Finishers and combat flair are catalog "Emote"s; show their real kind in tooltips.
    itemType: item.emoteKind ?? item.type,
    rarity: item.rarity,
    ownershipHashes: collectAllLootItemHashes(item),
    ...weaponMetaFromCatalogItem(item),
  };
}

/**
 * Art (icon + watermark) of the catalog version released in one of
 * `seasonLabels`, so season / expansion pages show the item as it was then
 * (e.g. an S23 weapon later reissued in Monument of Triumph). Null when the
 * primary entry already matches or no version does.
 */
export function seasonVersionArt(
  item: AllLootItem,
  seasonLabels: readonly string[],
): Pick<LootItem, "iconPath" | "seasonIconPath" | "seasonLabel" | "seasonNumber"> | null {
  if (seasonLabels.includes(item.seasonLabel ?? "")) return null;
  for (const label of seasonLabels) {
    const version = item.versions?.find((entry) => entry.seasonLabel === label);
    if (!version) continue;
    return {
      iconPath: version.iconPath || item.iconPath,
      seasonIconPath: version.seasonIconPath ?? item.seasonIconPath,
      seasonLabel: version.seasonLabel ?? item.seasonLabel,
      seasonNumber: version.seasonNumber ?? item.seasonNumber,
    };
  }
  return null;
}

/**
 * Grid item showing the art of the version from `seasonLabels`; keeps the
 * primary hash so links and ownership (all versions) work as before.
 */
export function toLootItemForSeason(
  item: AllLootItem,
  seasonLabels: readonly string[],
): LootItem {
  return { ...toLootItemFromCatalog(item), ...seasonVersionArt(item, seasonLabels) };
}

/** Build a grid item from a specific catalog version (season watermark / hash). */
export function toLootItemFromCatalogVersion(
  item: AllLootItem,
  version: Pick<
    AllLootItemVersion,
    | "itemHash"
    | "name"
    | "iconPath"
    | "seasonIconPath"
    | "seasonLabel"
    | "seasonNumber"
  >,
): LootItem {
  return {
    itemHash: version.itemHash,
    name: version.name || item.name,
    iconPath: version.iconPath || item.iconPath,
    source: item.source,
    seasonIconPath: version.seasonIconPath ?? item.seasonIconPath,
    seasonLabel: version.seasonLabel ?? item.seasonLabel,
    seasonNumber: version.seasonNumber ?? item.seasonNumber,
    itemType: item.type,
    rarity: item.rarity,
    ownershipHashes: collectAllLootItemHashes(item),
    ...weaponMetaFromCatalogItem(item),
  };
}

export function enrichLootItemFromCatalog(
  item: LootItem,
  catalogByHash: ReadonlyMap<string, AllLootItem>,
): LootItem {
  const catalogItem = catalogByHash.get(item.itemHash);
  if (!catalogItem) return item;

  return {
    ...item,
    rarity: item.rarity ?? catalogItem.rarity,
    itemType: item.itemType ?? catalogItem.type,
    ...weaponMetaFromCatalogItem(catalogItem),
  };
}

export function enrichWeaponLootItems(
  items: LootItem[],
  catalogByHash: ReadonlyMap<string, AllLootItem>,
): LootItem[] {
  return items.map((item) => enrichLootItemFromCatalog(item, catalogByHash));
}
