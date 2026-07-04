import type { AllLootItem } from "@/types/all-loot";
import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";

/** Every manifest item hash represented by a catalog row (ships, sparrows, etc.). */
export function collectCatalogItemHashes(item: AllLootItem): string[] {
  const hashes = new Set<string>([item.itemHash]);

  for (const hash of item.alternateItemHashes ?? []) {
    hashes.add(hash);
  }
  for (const hash of item.mergedVersionHashes ?? []) {
    hashes.add(hash);
  }
  for (const version of item.versions ?? []) {
    hashes.add(version.itemHash);
  }

  return [...hashes];
}

export function collectAllLootItemHashes(item: AllLootItem): string[] {
  if (item.type === "Armor") return collectArmorItemHashes(item);
  if (item.type === "Weapon") return collectWeaponItemHashes(item);
  return collectCatalogItemHashes(item);
}
