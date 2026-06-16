import type { AllLootItem } from "@/types/all-loot";

export function isItemOwned(
  item: AllLootItem,
  ownedSet: ReadonlySet<string>,
): boolean {
  if (ownedSet.has(item.itemHash)) return true;
  return item.alternateItemHashes?.some((hash) => ownedSet.has(hash)) ?? false;
}
