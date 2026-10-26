import { readFile } from "node:fs/promises";
import path from "node:path";
import type { WeaponAegisRollIndex } from "@/types/weapon-aegis-rolls";

let indexCache: WeaponAegisRollIndex | null = null;

async function readWeaponAegisRollIndexFromDisk(): Promise<WeaponAegisRollIndex> {
  if (indexCache) return indexCache;

  const filePath = path.join(process.cwd(), "data/weapon-aegis-rolls.json");
  const raw = await readFile(filePath, "utf8");
  indexCache = JSON.parse(raw) as WeaponAegisRollIndex;
  return indexCache;
}

export async function loadWeaponAegisRollIndex(): Promise<WeaponAegisRollIndex> {
  return readWeaponAegisRollIndexFromDisk();
}

export function resolveAegisEntryForItemHash(
  itemHash: string,
  index: WeaponAegisRollIndex,
) {
  return index.weapons[itemHash] ?? null;
}

/**
 * Perks Aegis favours for one weapon version: any perk that shows up in at
 * least a fifth of its recommended roll lines.
 */
export function aegisRecommendedPerks(itemHash: string, index: WeaponAegisRollIndex): string[] {
  const lines = index.weapons[itemHash]?.lines ?? [];
  if (lines.length === 0) return [];
  const counts = new Map<string, number>();
  for (const line of lines) {
    for (const hash of new Set(line)) counts.set(hash, (counts.get(hash) ?? 0) + 1);
  }
  const threshold = Math.max(1, Math.ceil(lines.length / 5));
  return [...counts.entries()].filter(([, count]) => count >= threshold).map(([hash]) => hash);
}
