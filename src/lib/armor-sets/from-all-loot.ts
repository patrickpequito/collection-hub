import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import { resolveEquipableItemSetHash } from "@/lib/armor/set-bonuses";
import { guardianClassFromLabel } from "@/lib/armor-sets/lookup";
import {
  BINARY_PHOENIX_CRUCIBLE_GROUP,
  WING_CRUCIBLE_GROUP,
  binaryPhoenixClassItemForUniformSet,
  isGroupedCrucibleLegacySetName,
  isUniformCrucibleSetName,
  isWingCrucibleSetName,
  uniformCrucibleSetForClassItem,
} from "@/lib/armor-sets/uniform-crucible-sets";
import {
  catalogItemVersions,
} from "@/lib/armor/version-for-hash";
import type { AllLootItem } from "@/types/all-loot";
import type { ArmorSetBonusCatalog } from "@/types/armor-set-bonuses";
import type {
  ArmorCategory,
  ArmorPieceVersion,
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

const ARMOR_NAME_SUFFIXES = [
  "Chest Armor",
  "Leg Armor",
  "Class Item",
  "Gauntlets",
  "Greaves",
  "Strides",
  "Gloves",
  "Helmet",
  "Helm",
  "Crown",
  "Cowl",
  "Mask",
  "Rig",
  "Chassis",
  "Robe",
  "Mark",
  "Cloak",
  "Bond",
  "Grips",
  "Boots",
];

const ARMOR_CATALOG_GROUP_ALIASES: Record<string, string> = {
  "judgement's wrap": "Bond Judgment",
};

function canonicalArmorCatalogName(name: string): string {
  const withoutCoda = name.replace(/\s+\(CODA\)\s*$/i, "").trim();
  const normalized = withoutCoda
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return ARMOR_CATALOG_GROUP_ALIASES[normalized] ?? withoutCoda;
}

function extractLegendaryArmorSetName(name: string): string | null {
  const withoutCodaSuffix = canonicalArmorCatalogName(name);
  const parenthetical = withoutCodaSuffix.match(/\(([^)]+)\)\s*$/);
  if (parenthetical?.[1]) return parenthetical[1].trim();

  for (const suffix of ARMOR_NAME_SUFFIXES) {
    const needle = ` ${suffix}`;
    if (withoutCodaSuffix.endsWith(needle)) {
      return withoutCodaSuffix.slice(0, -needle.length).trim();
    }
  }

  return null;
}

function belongsToNamedArmorSet(item: AllLootItem, setName: string): boolean {
  if (item.type !== "Armor" || item.rarity === "Exotic") return false;
  const itemBase = canonicalArmorCatalogName(item.name);
  const setBase = canonicalArmorCatalogName(setName);
  const prefix = `${setBase} `;
  return (
    itemBase === setBase ||
    item.name === setName ||
    item.name.startsWith(prefix) ||
    item.name.endsWith(`(${setBase})`) ||
    item.name.endsWith(`(${setName})`)
  );
}

function resolveNamedArmorSetName(
  armor: AllLootItem,
  items: AllLootItem[],
): string | null {
  const fromClassItem = uniformCrucibleSetForClassItem(armor.name);
  if (fromClassItem) return fromClassItem.setName;

  for (const entry of Object.values(BINARY_PHOENIX_CRUCIBLE_GROUP)) {
    if (belongsToNamedArmorSet(armor, entry.setName)) {
      return entry.setName;
    }
  }

  for (const entry of Object.values(WING_CRUCIBLE_GROUP)) {
    if (belongsToNamedArmorSet(armor, entry.setName)) {
      return entry.setName;
    }
  }

  const extracted = extractLegendaryArmorSetName(armor.name);
  if (extracted) return extracted;

  if (armor.type !== "Armor" || armor.rarity === "Exotic") return null;

  const peers = items.filter(
    (item) =>
      item.type === "Armor" &&
      item.rarity === "Legendary" &&
      item.name === armor.name,
  );
  const slotKeys = new Set(
    peers.map((item) => `${item.classOrWeaponType ?? ""}::${item.slot ?? ""}`),
  );

  return slotKeys.size > 1 ? armor.name : null;
}

function collectBinaryPhoenixCrucibleItems(items: AllLootItem[]): AllLootItem[] {
  const collected: AllLootItem[] = [];
  const seen = new Set<string>();

  const add = (item: AllLootItem) => {
    if (seen.has(item.itemHash)) return;
    seen.add(item.itemHash);
    collected.push(item);
  };

  for (const [guardianClass, entry] of Object.entries(
    BINARY_PHOENIX_CRUCIBLE_GROUP,
  ) as [GuardianClass, (typeof BINARY_PHOENIX_CRUCIBLE_GROUP)[GuardianClass]][]) {
    for (const item of items) {
      if (belongsToNamedArmorSet(item, entry.setName)) add(item);
    }

    const classItem = items.find(
      (item) =>
        item.type === "Armor" &&
        item.name === entry.classItem &&
        guardianClassFromLabel(item.classOrWeaponType) === guardianClass,
    );
    if (classItem) add(classItem);
  }

  return collected;
}

function collectWingCrucibleItems(items: AllLootItem[]): AllLootItem[] {
  const collected: AllLootItem[] = [];
  const seen = new Set<string>();

  const add = (item: AllLootItem) => {
    if (seen.has(item.itemHash)) return;
    seen.add(item.itemHash);
    collected.push(item);
  };

  for (const entry of Object.values(WING_CRUCIBLE_GROUP)) {
    for (const item of items) {
      if (belongsToNamedArmorSet(item, entry.setName)) add(item);
    }
  }

  return collected;
}

function collectGroupedCrucibleLegacyItems(
  items: AllLootItem[],
  setName: string,
): AllLootItem[] {
  if (isUniformCrucibleSetName(setName)) {
    return collectBinaryPhoenixCrucibleItems(items);
  }
  if (isWingCrucibleSetName(setName)) {
    return collectWingCrucibleItems(items);
  }
  return collectArmorItemsForSetName(items, setName);
}

function collectArmorItemsForSetName(
  items: AllLootItem[],
  setName: string,
  referenceArmor?: AllLootItem,
): AllLootItem[] {
  const collected = items.filter((item) => belongsToNamedArmorSet(item, setName));
  const guardianClass =
    guardianClassFromLabel(referenceArmor?.classOrWeaponType) ??
    guardianClassFromLabel(
      collected.find((item) => item.classOrWeaponType)?.classOrWeaponType,
    );
  const classItemName = binaryPhoenixClassItemForUniformSet(
    setName,
    guardianClass,
  );

  if (!classItemName) return collected;

  const classLabel =
    referenceArmor?.classOrWeaponType ??
    collected.find((item) => item.classOrWeaponType)?.classOrWeaponType;
  const classItem = items.find(
    (item) =>
      item.type === "Armor" &&
      item.name === classItemName &&
      (!classLabel || item.classOrWeaponType === classLabel),
  );

  if (!classItem || collected.some((item) => item.itemHash === classItem.itemHash)) {
    return collected;
  }

  return [...collected, classItem];
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
  setNameOverride?: string,
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
    const versions: ArmorPieceVersion[] = [];
    const seenVersionHashes = new Set<string>();
    for (const entry of group) {
      for (const version of catalogItemVersions(entry)) {
        if (seenVersionHashes.has(version.itemHash)) continue;
        seenVersionHashes.add(version.itemHash);
        versions.push(version);
      }
    }
    if (!classes[guardianClass]) classes[guardianClass] = {};
    classes[guardianClass]![slot] = {
      itemHash: item.itemHash,
      name: item.name,
      iconPath: item.iconPath,
      itemHashes,
      versions,
    };
  }

  const setName =
    setNameOverride ??
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

  const viewingHashes = new Set(collectArmorItemHashes(armor));
  const classItemMatch = uniformCrucibleSetForClassItem(armor.name);
  const primaryClass =
    guardianClassFromLabel(armor.classOrWeaponType) ??
    classItemMatch?.guardianClass ??
    null;

  const setHash = resolveEquipableItemSetHash(armor, bonusCatalog);
  if (setHash) {
    const index = buildSetPieceIndex(items, bonusCatalog);
    const setItems = index.get(setHash);
    if (setItems?.length) {
      const set = itemsToArmorSet(
        setHash,
        setItems,
        bonusCatalog,
        viewingHashes,
      );
      if (set) return { set, primaryClass };
    }
  }

  const setName = resolveNamedArmorSetName(armor, items);
  if (!setName) return null;

  const namedSetItems =
    isGroupedCrucibleLegacySetName(setName) ||
    uniformCrucibleSetForClassItem(armor.name)
      ? collectGroupedCrucibleLegacyItems(items, setName)
      : collectArmorItemsForSetName(items, setName, armor);
  if (!namedSetItems.length) return null;

  const set = itemsToArmorSet(
    `name-${setName}`,
    namedSetItems,
    bonusCatalog,
    viewingHashes,
    setName,
  );
  if (!set) return null;

  return { set, primaryClass };
}
