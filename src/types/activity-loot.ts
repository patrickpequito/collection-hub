export type LootItem = {
  itemHash: string;
  name: string;
  iconPath: string;
  source: string;
};

export type ActivityArmorRow = {
  setName: string;
  guardianClass: "hunter" | "titan" | "warlock";
  pieces: {
    helmet: LootItem;
    gauntlets: LootItem;
    chest: LootItem;
    legs: LootItem;
    classItem: LootItem;
  };
};

export type ActivityLootPage = {
  slug: string;
  title: string;
  headerImageFile: string;
  armorSets: ActivityArmorRow[];
  weapons: LootItem[];
  timelostWeapons: LootItem[];
  other: LootItem[];
};

export type ActivityEntry = {
  slug: string;
  title: string;
  /** When false, banner shows "Coming soon" and is not linked. */
  available: boolean;
  /** Optional: public/images/rad-loot/activities/{imageFile} */
  imageFile?: string;
};
