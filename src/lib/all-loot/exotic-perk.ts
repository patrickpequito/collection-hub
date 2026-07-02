import type { AllLootItem, ExoticArmorPerk } from "@/types/all-loot";

export function resolveExoticPerkForHash(
  item: AllLootItem,
  itemHash: string,
): ExoticArmorPerk | null {
  const version = item.versions?.find((entry) => entry.itemHash === itemHash);
  if (version?.exoticPerk) return version.exoticPerk;

  const byHash = item.exoticPerkByItemHash?.[itemHash];
  if (byHash) return byHash;

  if (itemHash === item.itemHash && item.exoticPerk) {
    return item.exoticPerk;
  }

  return item.exoticPerk ?? null;
}
