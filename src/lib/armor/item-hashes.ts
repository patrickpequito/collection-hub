import type { AllLootItem } from "@/types/all-loot";

export function collectArmorItemHashes(armor: AllLootItem): string[] {
  const hashes = new Set<string>([armor.itemHash]);

  for (const hash of armor.alternateItemHashes ?? []) {
    hashes.add(hash);
  }
  for (const hash of armor.mergedVersionHashes ?? []) {
    hashes.add(hash);
  }
  for (const version of armor.versions ?? []) {
    hashes.add(version.itemHash);
  }

  return [...hashes];
}
