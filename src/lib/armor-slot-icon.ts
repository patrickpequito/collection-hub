const ARMOR_SLOT_ICON_PATHS: Record<string, string> = {
  Helmet: "/icons/d2/armor/helmet.png",
  Gauntlets: "/icons/d2/armor/gauntlets.png",
  "Chest Armor": "/icons/d2/armor/chest.png",
  "Leg Armor": "/icons/d2/armor/legs.png",
  "Class Item": "/icons/d2/armor/class_item.png",
};

export function armorSlotIconPath(slot: string | null | undefined): string | null {
  if (!slot) return null;
  return ARMOR_SLOT_ICON_PATHS[slot] ?? null;
}

export function armorSlotLabel(slot: string | null | undefined): string | null {
  if (!slot) return null;
  if (slot === "Class Item") return "Class Item";
  return slot;
}
