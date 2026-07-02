import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";
import type { AllLootItem } from "@/types/all-loot";

export function isLootHashOwned(
  itemHash: string,
  ownedSet: ReadonlySet<string>,
  catalogByHash: ReadonlyMap<string, AllLootItem>,
): boolean {
  if (ownedSet.has(itemHash)) return true;

  const item = catalogByHash.get(itemHash);
  if (!item) return false;

  const hashes =
    item.type === "Armor"
      ? collectArmorItemHashes(item)
      : collectWeaponItemHashes(item);

  return hashes.some((hash) => ownedSet.has(hash));
}
