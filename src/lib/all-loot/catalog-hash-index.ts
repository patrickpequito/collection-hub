import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";
import type { AllLootItem } from "@/types/all-loot";

let catalogHashIndex: Map<string, AllLootItem> | null = null;

export async function loadCatalogHashIndex(): Promise<
  Map<string, AllLootItem>
> {
  if (catalogHashIndex) return catalogHashIndex;

  const catalog = await loadAllLootCatalog();
  const index = new Map<string, AllLootItem>();

  for (const item of catalog.items) {
    if (item.type !== "Armor" && item.type !== "Weapon") continue;

    const hashes =
      item.type === "Armor"
        ? collectArmorItemHashes(item)
        : collectWeaponItemHashes(item);

    for (const hash of hashes) {
      index.set(hash, item);
    }
  }

  catalogHashIndex = index;
  return index;
}
