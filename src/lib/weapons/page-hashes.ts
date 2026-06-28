import type { AllLootItem } from "@/types/all-loot";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";

export function collectWeaponPageItemHashes(weapon: AllLootItem): Set<string> {
  return new Set(collectWeaponItemHashes(weapon));
}
