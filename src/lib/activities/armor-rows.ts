import { ARMOR_SLOTS, GUARDIAN_CLASSES } from "@/lib/armor-sets/constants";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";
import type { ArmorSet, ArmorSlot, GuardianClass } from "@/types/armor-set";

const CLASS_BY_LABEL: Record<string, GuardianClass> = {
  Hunter: "hunter",
  Titan: "titan",
  Warlock: "warlock",
};

const SLOT_BY_LABEL: Record<string, ArmorSlot> = {
  Helmet: "helmet",
  Gauntlets: "gauntlets",
  "Chest Armor": "chest",
  "Leg Armor": "legs",
  "Class Item": "classItem",
};

function toLootItem(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
): LootItem {
  return { itemHash, name, iconPath, source };
}

export function buildArmorRowsFromSet(set: ArmorSet): ActivityArmorRow[] {
  const rows: ActivityArmorRow[] = [];

  for (const guardianClass of GUARDIAN_CLASSES) {
    const classPieces = set.classes[guardianClass];
    if (!classPieces) continue;

    const pieces: ActivityArmorRow["pieces"] = {};
    for (const slot of ARMOR_SLOTS) {
      const piece = classPieces[slot];
      if (!piece) continue;
      pieces[slot] = toLootItem(
        piece.itemHash,
        piece.name,
        piece.iconPath,
        set.source,
      );
    }

    if (Object.keys(pieces).length > 0) {
      rows.push({ setName: set.name, guardianClass, pieces });
    }
  }

  return rows;
}

function indexCatalogItemsByClassSlot(
  items: AllLootItem[],
): Map<string, AllLootItem> {
  const byClassSlot = new Map<string, AllLootItem>();

  for (const item of items) {
    const guardianClass = item.classOrWeaponType
      ? CLASS_BY_LABEL[item.classOrWeaponType]
      : null;
    const slot = item.slot ? SLOT_BY_LABEL[item.slot] : null;
    if (!guardianClass || !slot) continue;
    byClassSlot.set(`${guardianClass}::${slot}`, item);
  }

  return byClassSlot;
}

export function buildArmorRowsFromCatalogItems(
  items: AllLootItem[],
  setName: string,
): ActivityArmorRow[] {
  const byClassSlot = indexCatalogItemsByClassSlot(items);
  const rows: ActivityArmorRow[] = [];

  for (const guardianClass of GUARDIAN_CLASSES) {
    const pieces: ActivityArmorRow["pieces"] = {};
    let complete = true;

    for (const slot of ARMOR_SLOTS) {
      const item = byClassSlot.get(`${guardianClass}::${slot}`);
      if (!item) {
        complete = false;
        break;
      }
      pieces[slot] = toLootItem(
        item.itemHash,
        item.name,
        item.iconPath,
        item.source,
      );
    }

    if (complete) {
      rows.push({ setName, guardianClass, pieces });
    }
  }

  return rows;
}

/** Like buildArmorRowsFromSet — includes rows with any filled slots (legacy sets). */
export function buildPartialArmorRowsFromCatalogItems(
  items: AllLootItem[],
  setName: string,
): ActivityArmorRow[] {
  const byClassSlot = indexCatalogItemsByClassSlot(items);
  const rows: ActivityArmorRow[] = [];

  for (const guardianClass of GUARDIAN_CLASSES) {
    const pieces: ActivityArmorRow["pieces"] = {};

    for (const slot of ARMOR_SLOTS) {
      const item = byClassSlot.get(`${guardianClass}::${slot}`);
      if (!item) continue;
      pieces[slot] = toLootItem(
        item.itemHash,
        item.name,
        item.iconPath,
        item.source,
      );
    }

    if (Object.keys(pieces).length > 0) {
      rows.push({ setName, guardianClass, pieces });
    }
  }

  return rows;
}

export function countOwnedArmorPieces(
  rows: ActivityArmorRow[],
  isOwned: (itemHash: string) => boolean,
): { owned: number; total: number } {
  let owned = 0;
  let total = 0;

  for (const row of rows) {
    for (const piece of Object.values(row.pieces)) {
      if (!piece) continue;
      total += 1;
      if (isOwned(piece.itemHash)) owned += 1;
    }
  }

  return { owned, total };
}
