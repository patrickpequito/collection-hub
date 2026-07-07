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
