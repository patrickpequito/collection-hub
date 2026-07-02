export type ArmorCategory =
  | "destinations"
  | "raids"
  | "dungeons"
  | "expansions"
  | "seasons";

export type ArmorSlot =
  | "helmet"
  | "gauntlets"
  | "chest"
  | "legs"
  | "classItem";

export type GuardianClass = "hunter" | "titan" | "warlock";

export type ArmorPiece = {
  itemHash: string;
  name: string;
  iconPath: string;
  /** All manifest hashes for this slot (versions / alternates). */
  itemHashes?: string[];
};

export type ClassArmorPieces = Partial<Record<ArmorSlot, ArmorPiece>>;

export type ArmorSet = {
  id: string;
  name: string;
  category: ArmorCategory;
  source: string;
  sourceLabel: string;
  classes: Partial<Record<GuardianClass, ClassArmorPieces>>;
};

export type ArmorSetCatalog = {
  generatedAt: string;
  sets: ArmorSet[];
};
