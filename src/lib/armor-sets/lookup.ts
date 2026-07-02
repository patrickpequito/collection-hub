import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import {
  ARMOR_SLOTS,
  GUARDIAN_CLASSES,
} from "@/lib/armor-sets/constants";
import type { AllLootItem } from "@/types/all-loot";
import type { ArmorSet, ArmorSetCatalog, GuardianClass } from "@/types/armor-set";

export function guardianClassFromLabel(
  label: string | null | undefined,
): GuardianClass | null {
  if (!label) return null;
  const normalized = label.trim().toLowerCase();
  if (
    normalized === "hunter" ||
    normalized === "titan" ||
    normalized === "warlock"
  ) {
    return normalized;
  }
  return null;
}

export function orderedGuardianClasses(
  primaryClass: GuardianClass | null,
): GuardianClass[] {
  if (!primaryClass) return [...GUARDIAN_CLASSES];
  return [
    primaryClass,
    ...GUARDIAN_CLASSES.filter((guardianClass) => guardianClass !== primaryClass),
  ];
}

export function findArmorSetForItem(
  catalog: ArmorSetCatalog,
  armor: AllLootItem,
): { set: ArmorSet; primaryClass: GuardianClass | null } | null {
  const hashes = new Set(collectArmorItemHashes(armor));

  for (const set of catalog.sets) {
    for (const guardianClass of GUARDIAN_CLASSES) {
      const pieces = set.classes[guardianClass];
      if (!pieces) continue;

      for (const slot of ARMOR_SLOTS) {
        const piece = pieces[slot];
        if (piece && hashes.has(piece.itemHash)) {
          return {
            set,
            primaryClass: guardianClassFromLabel(armor.classOrWeaponType),
          };
        }
      }
    }
  }

  return null;
}
