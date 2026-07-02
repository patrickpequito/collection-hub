import type { AllLootItem } from "@/types/all-loot";
import { collectArmorItemHashes } from "@/lib/armor/item-hashes";

export function collectArmorPageItemHashes(armor: AllLootItem): Set<string> {
  return new Set(collectArmorItemHashes(armor));
}
