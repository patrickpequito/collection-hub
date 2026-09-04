import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { armorPageHref } from "@/lib/armor/paths";
import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import type { AllLootItem } from "@/types/all-loot";

let hashIndex: Map<string, AllLootItem> | null = null;

async function ensureArmorHashIndex() {
  if (hashIndex) return;

  const catalog = await loadAllLootCatalog();
  hashIndex = new Map();

  for (const item of catalog.items) {
    if (item.type !== "Armor" || !item.slug) continue;

    for (const hash of collectArmorItemHashes(item)) {
      hashIndex.set(hash, item);
    }
  }
}

export { armorPageHref } from "@/lib/armor/paths";

export async function getArmorBySlug(
  slug: string,
): Promise<AllLootItem | null> {
  const catalog = await loadAllLootCatalog();
  return (
    catalog.items.find(
      (item) => item.type === "Armor" && item.slug === slug,
    ) ?? null
  );
}

export async function getArmorByItemHash(
  itemHash: string,
): Promise<AllLootItem | null> {
  await ensureArmorHashIndex();
  return hashIndex?.get(itemHash) ?? null;
}

export async function buildArmorHrefByItemHash(
  fromPath?: string,
): Promise<Record<string, string>> {
  await ensureArmorHashIndex();
  const hrefs: Record<string, string> = {};

  for (const [hash, item] of hashIndex?.entries() ?? []) {
    if (item.slug) hrefs[hash] = armorPageHref(item.slug, fromPath);
  }

  return hrefs;
}
