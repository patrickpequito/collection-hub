import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { WeaponAegisRollIndex } from "@/types/weapon-aegis-rolls";

let indexCache: WeaponAegisRollIndex | null = null;

async function readWeaponAegisRollIndexFromDisk(): Promise<WeaponAegisRollIndex> {
  if (indexCache) return indexCache;

  const filePath = path.join(
    process.cwd(),
    "public/data/weapon-aegis-rolls.json",
  );
  const raw = await readFile(filePath, "utf8");
  indexCache = JSON.parse(raw) as WeaponAegisRollIndex;
  return indexCache;
}

const loadWeaponAegisRollIndexCached = unstable_cache(
  readWeaponAegisRollIndexFromDisk,
  ["weapon-aegis-roll-index"],
  { revalidate: false },
);

export async function loadWeaponAegisRollIndex(): Promise<WeaponAegisRollIndex> {
  return loadWeaponAegisRollIndexCached();
}

export function resolveAegisEntryForItemHash(
  itemHash: string,
  index: WeaponAegisRollIndex,
) {
  return index.weapons[itemHash] ?? null;
}
