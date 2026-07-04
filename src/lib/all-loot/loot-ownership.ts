import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import type { AllLootItem } from "@/types/all-loot";

export function isLootHashOwned(
  itemHash: string,
  ownedSet: ReadonlySet<string>,
  catalogByHash: ReadonlyMap<string, AllLootItem>,
): boolean {
  if (ownedSet.has(itemHash)) return true;

  const item = catalogByHash.get(itemHash);
  if (!item) return false;

  return collectAllLootItemHashes(item).some((hash) => ownedSet.has(hash));
}
