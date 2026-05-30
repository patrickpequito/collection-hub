export type CollectibleItem = {
  itemHash: string;
  name: string;
  iconPath: string;
  source: string;
};

export type ExoticCategory =
  | "weapons"
  | "catalysts"
  | "hunter"
  | "titan"
  | "warlock";

export type WeaponSlot = "primary" | "special" | "heavy";

export type ArmorSlot =
  | "helmet"
  | "gauntlets"
  | "chest"
  | "legs"
  | "classItem";

export type ExoticItem = CollectibleItem & {
  category: ExoticCategory;
  weaponSlot?: WeaponSlot;
  armorSlot?: ArmorSlot;
};

export type ExoticCatalog = {
  generatedAt: string;
  items: ExoticItem[];
};
