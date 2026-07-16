import type { GuardianClass } from "@/types/armor-set";

export const VANGUARD_SET_DISPLAY_NAME = "Vanguard Set";

export type UniformVanguardClassEntry = {
  setName: string;
  classItem: string;
};

/** Cross-class Vanguard sets that share one armor bonus. */
export const VANGUARD_SET_GROUP: Record<GuardianClass, UniformVanguardClassEntry> =
  {
    titan: { setName: "The Shelter in Place", classItem: "Mark of Shelter" },
    hunter: { setName: "The Took Offense", classItem: "The Took Offense" },
    warlock: { setName: "Xenos Vale IV", classItem: "Xenos Vale Bond" },
  };

const VANGUARD_SET_ARMOR_NAMES = new Set(
  Object.values(VANGUARD_SET_GROUP).map((entry) => entry.setName),
);

export function isVanguardSetArmorPieceName(setName: string): boolean {
  return VANGUARD_SET_ARMOR_NAMES.has(setName);
}

export function isGroupedVanguardLegacySetName(setName: string): boolean {
  return (
    setName === VANGUARD_SET_DISPLAY_NAME || isVanguardSetArmorPieceName(setName)
  );
}

export function uniformVanguardSetForClassItem(itemName: string): {
  setName: typeof VANGUARD_SET_DISPLAY_NAME;
  guardianClass: GuardianClass;
} | null {
  for (const [guardianClass, entry] of Object.entries(VANGUARD_SET_GROUP) as [
    GuardianClass,
    UniformVanguardClassEntry,
  ][]) {
    if (entry.classItem === itemName) {
      return { setName: VANGUARD_SET_DISPLAY_NAME, guardianClass };
    }
  }
  return null;
}

export function vanguardClassItemForSetName(
  setName: string,
  guardianClass: GuardianClass | null,
): string | null {
  if (!guardianClass) return null;
  const entry = VANGUARD_SET_GROUP[guardianClass];
  if (!entry || entry.setName !== setName) return null;
  return entry.classItem === entry.setName ? null : entry.classItem;
}
