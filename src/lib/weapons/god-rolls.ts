import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { AllLootItem } from "@/types/all-loot";
import type {
  ResolvedWeaponGodRoll,
  WeaponGodRollIndex,
} from "@/types/weapon-god-rolls";

let indexCache: WeaponGodRollIndex | null = null;

async function readWeaponGodRollIndexFromDisk(): Promise<WeaponGodRollIndex> {
  if (indexCache) return indexCache;

  const filePath = path.join(process.cwd(), "public/data/weapon-god-rolls.json");
  const raw = await readFile(filePath, "utf8");
  indexCache = JSON.parse(raw) as WeaponGodRollIndex;
  return indexCache;
}

const loadWeaponGodRollIndexCached = unstable_cache(
  readWeaponGodRollIndexFromDisk,
  ["weapon-god-roll-index"],
  { revalidate: false },
);

export async function loadWeaponGodRollIndex(): Promise<WeaponGodRollIndex> {
  return loadWeaponGodRollIndexCached();
}

function collectItemHashes(weapon: AllLootItem): string[] {
  const hashes = new Set<string>([weapon.itemHash]);

  for (const hash of weapon.alternateItemHashes ?? []) {
    hashes.add(hash);
  }
  for (const version of weapon.versions ?? []) {
    hashes.add(version.itemHash);
  }

  return [...hashes];
}

export function resolveWeaponGodRoll(
  weapon: AllLootItem,
  index: WeaponGodRollIndex,
): ResolvedWeaponGodRoll | null {
  for (const itemHash of collectItemHashes(weapon)) {
    const entry = index.rolls[itemHash];
    if (entry) return entry;
  }

  return null;
}
