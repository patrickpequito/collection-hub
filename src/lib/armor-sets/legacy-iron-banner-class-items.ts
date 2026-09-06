import type { GuardianClass } from "@/types/armor-set";

/**
 * Legacy Iron Banner sets whose class items do not share the set name prefix
 * (e.g. Iron Truage uses Radegast's Iron Sash, not "Iron Truage Mark").
 *
 * Shared by the Iron Banner activity hub, season hubs, and armor detail pages.
 */
export const LEGACY_IRON_BANNER_CLASS_ITEMS: Partial<
  Record<string, Record<GuardianClass, string>>
> = {
  "Iron Remembrance": {
    hunter: "Cloak of Remembrance",
    titan: "Mark of Remembrance",
    warlock: "Bond of Remembrance",
  },
  "Iron Truage": {
    hunter: "Mantle of Efrideet",
    titan: "Radegast's Iron Sash",
    warlock: "Timur's Iron Bond",
  },
  "Iron Companion": {
    hunter: "Wolfswood Cloak",
    titan: "Wolfswood Mark",
    warlock: "Wolfswood Bond",
  },
};

const CLASS_ITEM_TO_SET = new Map<
  string,
  { setName: string; guardianClass: GuardianClass }
>();

for (const [setName, byClass] of Object.entries(
  LEGACY_IRON_BANNER_CLASS_ITEMS,
) as [string, Record<GuardianClass, string>][]) {
  for (const [guardianClass, itemName] of Object.entries(byClass) as [
    GuardianClass,
    string,
  ][]) {
    CLASS_ITEM_TO_SET.set(itemName, { setName, guardianClass });
  }
}

export function ironBannerSetForClassItem(itemName: string): {
  setName: string;
  guardianClass: GuardianClass;
} | null {
  return CLASS_ITEM_TO_SET.get(itemName) ?? null;
}

export function isLegacyIronBannerClassItemForSet(
  itemName: string,
  setName: string,
): boolean {
  const byClass = LEGACY_IRON_BANNER_CLASS_ITEMS[setName];
  if (!byClass) return false;
  return Object.values(byClass).includes(itemName);
}

export function legacyIronBannerClassItemNamesForSet(
  setName: string,
): readonly string[] {
  const byClass = LEGACY_IRON_BANNER_CLASS_ITEMS[setName];
  return byClass ? Object.values(byClass) : [];
}
