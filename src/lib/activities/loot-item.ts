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
    itemType: item.type,
    rarity: item.rarity,
    ownershipHashes: collectAllLootItemHashes(item),
    ...weaponMetaFromCatalogItem(item),
  };
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
  if (!catalogItem || catalogItem.type !== "Weapon") {
    return item;
  }

  return {
    ...item,
    ...weaponMetaFromCatalogItem(catalogItem),
  };
}

export function enrichWeaponLootItems(
  items: LootItem[],
  catalogByHash: ReadonlyMap<string, AllLootItem>,
): LootItem[] {
  return items.map((item) => enrichLootItemFromCatalog(item, catalogByHash));
}
