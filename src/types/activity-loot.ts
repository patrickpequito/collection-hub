import type { TriumphRecord } from "@/types/triumph";

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

export type ActivityTriumphPanel = {
  name: string;
  description: string;
  iconPath: string;
  recordHashes: string[];
  /** Vaulted activities whose records are not in triumphs.json. */
  records?: TriumphRecord[];
};

export type ActivityLootPage = {
  slug: string;
  title: string;
  headerImageFile: string;
  armorSets: ActivityArmorRow[];
  /** Optional extra armor preview images (e.g. Prophecy: prophecy.webp + prophecy2.webp). */
  armorSetPreviewFiles?: string[];
  weapons: LootItem[];
  timelostWeapons: LootItem[];
  /** Defaults to "Timelost Weapons" when omitted. */
  timelostWeaponsTitle?: string;
  other: LootItem[];
  /** Dungeon (or other) pages without a title seal in triumphs.json. */
  triumphPanel?: ActivityTriumphPanel;
  /** Label for the single-tier completions row (e.g. "Dungeon Completions"). */
  completionsLabel?: string;
};

export type ActivityEntry = {
  slug: string;
  title: string;
  /** When false, banner shows "Coming soon" and is not linked. */
  available: boolean;
  /** Full banner UI without a detail page link yet. */
  placeholder?: boolean;
  /** Optional: public/images/rad-loot/activities/{imageFile} */
  imageFile?: string;
};
