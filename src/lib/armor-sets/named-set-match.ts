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
  "Robes",
  "Mark",
  "Cloak",
  "Bond",
  "Grips",
  "Boots",
  "Cover",
  "Sleeves",
  "Plate",
  "Vest",
];

const ARMOR_CATALOG_GROUP_ALIASES: Record<string, string> = {
  "judgement's wrap": "Bond Judgment",
};

const ARMOR_SET_DISPLAY_ALIASES: Record<string, string> = {
  "wall-watcher": "Wall-Watcher",
};

function canonicalArmorCatalogName(name: string): string {
  const withoutCoda = name.replace(/\s+\(CODA\)\s*$/i, "").trim();
  const normalized = withoutCoda
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return ARMOR_CATALOG_GROUP_ALIASES[normalized] ?? withoutCoda;
}

export function canonicalArmorSetDisplayName(name: string): string {
  const normalized = name.trim().toLowerCase();
  return ARMOR_SET_DISPLAY_ALIASES[normalized] ?? name;
}

export function extractLegendaryArmorSetName(name: string): string | null {
  const withoutCodaSuffix = canonicalArmorCatalogName(name);
  const parenthetical = withoutCodaSuffix.match(/\(([^)]+)\)\s*$/);
  if (parenthetical?.[1]) {
    return canonicalArmorSetDisplayName(parenthetical[1].trim());
  }

  for (const suffix of ARMOR_NAME_SUFFIXES) {
    const needle = ` ${suffix}`;
    if (withoutCodaSuffix.endsWith(needle)) {
      return canonicalArmorSetDisplayName(
        withoutCodaSuffix.slice(0, -needle.length).trim(),
      );
    }
  }

  return null;
}

export function itemNameBelongsToArmorSet(
  itemName: string,
  setName: string,
): boolean {
  const displaySetName = canonicalArmorSetDisplayName(setName);
  const extracted = extractLegendaryArmorSetName(itemName);
  if (extracted && canonicalArmorSetDisplayName(extracted) === displaySetName) {
    return true;
  }

  const itemBase = canonicalArmorCatalogName(itemName);
  const setBase = canonicalArmorCatalogName(setName);
  const prefix = `${setBase} `;
  return (
    canonicalArmorSetDisplayName(itemBase) === displaySetName ||
    itemName === setName ||
    itemName.startsWith(prefix) ||
    itemName.toLowerCase().startsWith(`${displaySetName.toLowerCase()} `) ||
    itemName.endsWith(`(${setBase})`) ||
    itemName.endsWith(`(${setName})`)
  );
}
