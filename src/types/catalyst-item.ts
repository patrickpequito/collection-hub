import type { CollectibleItem, WeaponSlot } from "@/types/exotic-item";

export type CatalystItem = CollectibleItem & {
  weaponSlot: WeaponSlot;
  weaponName: string;
  weaponHash: string;
  /** Triumph record when the catalyst is finished (DestinyRecordDefinition). */
  recordHash?: string;
  /** Objectives on that record (e.g. "Targets defeated" × 500). */
  objectives?: { objectiveHash: string; description: string; completionValue: number }[];
  /** Bungie's plug text (often the generic masterwork blurb). */
  description?: string;
  /** What the catalyst actually does: its perk name, text and icon. */
  effect?: { name: string; description: string; iconPath: string };
  /** All manifest hashes for this catalyst (for ownership matching). */
  alternateItemHashes: string[];
};

export type CatalystCatalog = {
  generatedAt: string;
  items: CatalystItem[];
};
