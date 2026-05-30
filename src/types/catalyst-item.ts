import type { CollectibleItem, WeaponSlot } from "@/types/exotic-item";

export type CatalystItem = CollectibleItem & {
  weaponSlot: WeaponSlot;
  weaponName: string;
  weaponHash: string;
  /** Triumph record when the catalyst is finished (DestinyRecordDefinition). */
  recordHash?: string;
  /** All manifest hashes for this catalyst (for ownership matching). */
  alternateItemHashes: string[];
};

export type CatalystCatalog = {
  generatedAt: string;
  items: CatalystItem[];
};
