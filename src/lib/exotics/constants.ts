import type {
  ArmorSlot,
  CollectibleItem,
  ExoticCategory,
  ExoticItem,
  WeaponSlot,
} from "@/types/exotic-item";
import type { CatalystItem } from "@/types/catalyst-item";

export const EXOTIC_TABS: { id: ExoticCategory; label: string }[] = [
  { id: "weapons", label: "Weapons" },
  { id: "catalysts", label: "Catalysts" },
  { id: "hunter", label: "Hunter Armor" },
  { id: "titan", label: "Titan Armor" },
  { id: "warlock", label: "Warlock Armor" },
];

export const WEAPON_SECTIONS: { id: WeaponSlot; label: string }[] = [
  { id: "primary", label: "Primary Weapons" },
  { id: "special", label: "Special Weapons" },
  { id: "heavy", label: "Heavy Weapons" },
];

export const ARMOR_SECTIONS: { id: ArmorSlot; label: string }[] = [
  { id: "helmet", label: "Helmet" },
  { id: "gauntlets", label: "Gauntlets" },
  { id: "chest", label: "Chest Armor" },
  { id: "legs", label: "Leg Armor" },
  { id: "classItem", label: "Class Item" },
];

/** One icon per display name; ownership still matches any manifest variant via hash index. */
export function dedupeCollectiblesByName<T extends CollectibleItem>(
  items: T[],
): T[] {
  const byName = new Map<string, T>();
  for (const item of items) {
    const existing = byName.get(item.name);
    if (!existing || item.itemHash < existing.itemHash) {
      byName.set(item.name, item);
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterExoticsByCategory(
  items: ExoticItem[],
  category: ExoticCategory,
): ExoticItem[] {
  const filtered = items
    .filter((item) => item.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));

  return category === "weapons" ? dedupeCollectiblesByName(filtered) : filtered;
}

export function groupCatalystsByWeaponSlot(
  items: CatalystItem[],
): Record<WeaponSlot, CatalystItem[]> {
  return {
    primary: items.filter((i) => i.weaponSlot === "primary"),
    special: items.filter((i) => i.weaponSlot === "special"),
    heavy: items.filter((i) => i.weaponSlot === "heavy"),
  };
}

export function groupExoticsByWeaponSlot(
  items: ExoticItem[],
): Record<WeaponSlot, ExoticItem[]> {
  return {
    primary: items.filter((i) => i.weaponSlot === "primary"),
    special: items.filter((i) => i.weaponSlot === "special"),
    heavy: items.filter((i) => i.weaponSlot === "heavy"),
  };
}

export function groupExoticsByArmorSlot(
  items: ExoticItem[],
): Record<ArmorSlot, ExoticItem[]> {
  return {
    helmet: items.filter((i) => i.armorSlot === "helmet"),
    gauntlets: items.filter((i) => i.armorSlot === "gauntlets"),
    chest: items.filter((i) => i.armorSlot === "chest"),
    legs: items.filter((i) => i.armorSlot === "legs"),
    classItem: items.filter((i) => i.armorSlot === "classItem"),
  };
}

export function countExoticsByCategory(
  items: ExoticItem[],
  catalystCount = 0,
): Record<ExoticCategory, number> {
  return {
    weapons: dedupeCollectiblesByName(
      items.filter((item) => item.category === "weapons"),
    ).length,
    catalysts: catalystCount,
    hunter: items.filter((item) => item.category === "hunter").length,
    titan: items.filter((item) => item.category === "titan").length,
    warlock: items.filter((item) => item.category === "warlock").length,
  };
}
