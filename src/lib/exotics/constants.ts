import type {
  ArmorSlot,
  ExoticCategory,
  ExoticItem,
  WeaponSlot,
} from "@/types/exotic-item";

export const EXOTIC_TABS: { id: ExoticCategory; label: string }[] = [
  { id: "weapons", label: "Weapons" },
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

export function filterExoticsByCategory(
  items: ExoticItem[],
  category: ExoticCategory,
): ExoticItem[] {
  return items
    .filter((item) => item.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));
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
): Record<ExoticCategory, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    { weapons: 0, hunter: 0, titan: 0, warlock: 0 } as Record<
      ExoticCategory,
      number
    >,
  );
}
