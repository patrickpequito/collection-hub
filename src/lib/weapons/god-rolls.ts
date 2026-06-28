import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { AllLootItem } from "@/types/all-loot";
import type {
  ResolvedWeaponGodRoll,
  WeaponGodRollIndex,
} from "@/types/weapon-god-rolls";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";

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
  return collectWeaponItemHashes(weapon);
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

export function resolveGodRollForItemHash(
  itemHash: string,
  index: WeaponGodRollIndex,
): ResolvedWeaponGodRoll | null {
  return index.rolls[itemHash] ?? null;
}

export function resolveGodRollsForWeapon(
  weapon: AllLootItem,
  index: WeaponGodRollIndex,
): Record<string, ResolvedWeaponGodRoll> {
  const rolls: Record<string, ResolvedWeaponGodRoll> = {};

  for (const itemHash of collectItemHashes(weapon)) {
    const entry = index.rolls[itemHash];
    if (entry) rolls[itemHash] = entry;
  }

  return rolls;
}
