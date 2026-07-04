import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import type { AllLootItem } from "@/types/all-loot";

let catalogHashIndex: Map<string, AllLootItem> | null = null;

export async function loadCatalogHashIndex(): Promise<
  Map<string, AllLootItem>
> {
  if (catalogHashIndex) return catalogHashIndex;

  const catalog = await loadAllLootCatalog();
  const index = new Map<string, AllLootItem>();

  for (const item of catalog.items) {
    for (const hash of collectAllLootItemHashes(item)) {
      index.set(hash, item);
    }
  }

  catalogHashIndex = index;
  return index;
}
