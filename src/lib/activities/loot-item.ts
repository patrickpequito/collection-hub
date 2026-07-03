import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";

export function weaponMetaFromCatalogItem(
  item: AllLootItem,
): Pick<LootItem, "classOrWeaponType" | "damageType" | "ammoType"> {
  if (item.type !== "Weapon") {
    return {};
  }

  return {
    classOrWeaponType: item.classOrWeaponType,
    damageType: item.damageType,
    ammoType: item.ammoType,
  };
}

export function toLootItemFromCatalog(item: AllLootItem): LootItem {
  return {
    itemHash: item.itemHash,
    name: item.name,
    iconPath: item.iconPath,
    source: item.source,
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
