import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { weaponPageHref } from "@/lib/weapons/paths";
import type { AllLootItem } from "@/types/all-loot";

let slugIndex: Map<string, AllLootItem> | null = null;
let hashIndex: Map<string, AllLootItem> | null = null;

async function ensureWeaponIndexes() {
  if (slugIndex && hashIndex) return;

  const catalog = await loadAllLootCatalog();
  slugIndex = new Map();
  hashIndex = new Map();

  for (const item of catalog.items) {
    if (item.type !== "Weapon" || !item.slug) continue;

    slugIndex.set(item.slug, item);
    hashIndex.set(item.itemHash, item);

    for (const hash of item.alternateItemHashes ?? []) {
      hashIndex.set(hash, item);
    }
    for (const version of item.versions ?? []) {
      hashIndex.set(version.itemHash, item);
    }
  }
}

export { weaponPageHref } from "@/lib/weapons/paths";

export async function getWeaponBySlug(
  slug: string,
): Promise<AllLootItem | null> {
  await ensureWeaponIndexes();
  return slugIndex?.get(slug) ?? null;
}

export async function getWeaponByItemHash(
  itemHash: string,
): Promise<AllLootItem | null> {
  await ensureWeaponIndexes();
  return hashIndex?.get(itemHash) ?? null;
}

export async function buildWeaponHrefByItemHash(
  fromPath?: string,
): Promise<Record<string, string>> {
  await ensureWeaponIndexes();
  const hrefs: Record<string, string> = {};

  for (const [hash, item] of hashIndex?.entries() ?? []) {
    if (item.slug) hrefs[hash] = weaponPageHref(item.slug, fromPath);
  }

  return hrefs;
}
