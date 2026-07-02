import type { AllLootItem } from "@/types/all-loot";
import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";

export function isItemOwned(
  item: AllLootItem,
  ownedSet: ReadonlySet<string>,
): boolean {
  const hashes =
    item.type === "Armor"
      ? collectArmorItemHashes(item)
      : collectWeaponItemHashes(item);
  return hashes.some((hash) => ownedSet.has(hash));
}
