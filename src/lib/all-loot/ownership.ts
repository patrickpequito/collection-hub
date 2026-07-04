import type { AllLootItem } from "@/types/all-loot";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";

export function isItemOwned(
  item: AllLootItem,
  ownedSet: ReadonlySet<string>,
): boolean {
  return collectAllLootItemHashes(item).some((hash) => ownedSet.has(hash));
}
