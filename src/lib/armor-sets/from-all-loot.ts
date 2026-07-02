import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import { resolveEquipableItemSetHash } from "@/lib/armor/set-bonuses";
import { guardianClassFromLabel } from "@/lib/armor-sets/lookup";
import type { AllLootItem } from "@/types/all-loot";
import type { ArmorSetBonusCatalog } from "@/types/armor-set-bonuses";
import type {
  ArmorCategory,
  ArmorSet,
  ArmorSlot,
  ClassArmorPieces,
  GuardianClass,
} from "@/types/armor-set";

const SLOT_BY_LABEL: Record<string, ArmorSlot> = {
  Helmet: "helmet",
  Gauntlets: "gauntlets",
  "Chest Armor": "chest",
  "Leg Armor": "legs",
  "Class Item": "classItem",
};

function armorSlotFromLabel(slot: string | null | undefined): ArmorSlot | null {
  if (!slot) return null;
  return SLOT_BY_LABEL[slot] ?? null;
}

function categorizeSource(source = ""): ArmorCategory {
  const normalized = source.toLowerCase();
  if (normalized.includes("raid")) return "raids";
  if (normalized.includes("dungeon")) return "dungeons";
  if (normalized.includes("season")) return "seasons";
  if (
    normalized.includes("vanguard") ||
    normalized.includes("patrol") ||
    normalized.includes("exploration") ||
    normalized.includes("public event") ||
    normalized.includes("terminal") ||
    normalized.includes("onslaught") ||
    normalized.includes("strike")
  ) {
    return "destinations";
  }
  return "expansions";
}

function normalizeSource(source = ""): string {
  const quoted = source.match(/"([^"]+)"/);
  if (quoted) return quoted[1];
  return source.replace(/^Source:\s*/i, "").trim();
}

function buildSetPieceIndex(
  items: AllLootItem[],
  bonusCatalog: ArmorSetBonusCatalog,
): Map<string, AllLootItem[]> {
  const index = new Map<string, AllLootItem[]>();

  for (const item of items) {
    if (item.type !== "Armor" || item.rarity === "Exotic") continue;

    const setHash = resolveEquipableItemSetHash(item, bonusCatalog);
    if (!setHash) continue;

    const bucket = index.get(setHash) ?? [];
    bucket.push(item);
    index.set(setHash, bucket);
  }

  return index;
}

function pickRepresentativePiece(
  candidates: AllLootItem[],
  viewingHashes: Set<string>,
): AllLootItem {
  const matchingView = candidates.find((item) => {
    if (viewingHashes.has(item.itemHash)) return true;
    return collectArmorItemHashes(item).some((hash) => viewingHashes.has(hash));
  });
  if (matchingView) return matchingView;

  return candidates.reduce((best, item) =>
    (item.seasonNumber ?? 0) > (best.seasonNumber ?? 0) ? item : best,
  );
}

function itemsToArmorSet(
  setHash: string,
  items: AllLootItem[],
  bonusCatalog: ArmorSetBonusCatalog,
  viewingHashes: Set<string>,
): ArmorSet | null {
  const byClassSlot = new Map<string, AllLootItem[]>();

  for (const item of items) {
    const guardianClass = guardianClassFromLabel(item.classOrWeaponType);
    const slot = armorSlotFromLabel(item.slot);
    if (!guardianClass || !slot) continue;

    const key = `${guardianClass}::${slot}`;
    const group = byClassSlot.get(key) ?? [];
    group.push(item);
    byClassSlot.set(key, group);
  }

  if (!byClassSlot.size) return null;

  const classes: Partial<Record<GuardianClass, ClassArmorPieces>> = {};

  for (const [key, group] of byClassSlot) {
    const [guardianClass, slot] = key.split("::") as [GuardianClass, ArmorSlot];
    const item = pickRepresentativePiece(group, viewingHashes);
    const itemHashes = [
      ...new Set(group.flatMap((entry) => collectArmorItemHashes(entry))),
    ];
    if (!classes[guardianClass]) classes[guardianClass] = {};
    classes[guardianClass]![slot] = {
      itemHash: item.itemHash,
      name: item.name,
      iconPath: item.iconPath,
      itemHashes,
    };
  }

  const setName =
    bonusCatalog.sets[setHash]?.setName ??
    items.find((item) => item.name)?.name ??
    "Armor Set";
  const source = items.find((item) => item.source)?.source ?? "";

  return {
    id: `loot-set-${setHash}`,
    name: setName,
    category: categorizeSource(source),
    source,
    sourceLabel: normalizeSource(source),
    classes,
  };
}

export function resolveArmorSetForItem(
  items: AllLootItem[],
  bonusCatalog: ArmorSetBonusCatalog,
  armor: AllLootItem,
): { set: ArmorSet; primaryClass: GuardianClass | null } | null {
  if (armor.rarity === "Exotic") return null;

  const setHash = resolveEquipableItemSetHash(armor, bonusCatalog);
  if (!setHash) return null;

  const index = buildSetPieceIndex(items, bonusCatalog);
  const setItems = index.get(setHash);
  if (!setItems?.length) return null;

  const viewingHashes = new Set(collectArmorItemHashes(armor));
  const set = itemsToArmorSet(setHash, setItems, bonusCatalog, viewingHashes);
  if (!set) return null;

  return {
    set,
    primaryClass: guardianClassFromLabel(armor.classOrWeaponType),
  };
}
