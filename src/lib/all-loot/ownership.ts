import type { AllLootItem } from "@/types/all-loot";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";

export function isItemOwned(
  item: AllLootItem,
  ownedSet: ReadonlySet<string>,
): boolean {
  return collectWeaponItemHashes(item).some((hash) => ownedSet.has(hash));
}
