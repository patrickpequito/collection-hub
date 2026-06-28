import type { AllLootItem } from "@/types/all-loot";

/** Every manifest item hash that maps to this catalog weapon row. */
export function collectWeaponItemHashes(weapon: AllLootItem): string[] {
  const hashes = new Set<string>([weapon.itemHash]);

  for (const hash of weapon.alternateItemHashes ?? []) {
    hashes.add(hash);
  }
  for (const hash of weapon.mergedVersionHashes ?? []) {
    hashes.add(hash);
  }
  for (const version of weapon.versions ?? []) {
    hashes.add(version.itemHash);
  }

  return [...hashes];
}
