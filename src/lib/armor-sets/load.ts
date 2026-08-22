import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { ArmorSetCatalog } from "@/types/armor-set";

let catalogCache: { catalog: ArmorSetCatalog; mtimeMs: number } | null = null;

async function readArmorSetCatalogFromDisk(): Promise<ArmorSetCatalog> {
  const filePath = path.join(process.cwd(), "data/armor-sets.json");
  const fileStat = await stat(filePath);

  if (catalogCache && catalogCache.mtimeMs === fileStat.mtimeMs) {
    return catalogCache.catalog;
  }

  const raw = await readFile(filePath, "utf8");
  const catalog = JSON.parse(raw) as ArmorSetCatalog;
  catalogCache = { catalog, mtimeMs: fileStat.mtimeMs };
  return catalog;
}

const loadArmorSetCatalogCached = unstable_cache(
  readArmorSetCatalogFromDisk,
  ["armor-set-catalog-v3"],
  { revalidate: false },
);

export async function loadArmorSetCatalog(): Promise<ArmorSetCatalog> {
  return loadArmorSetCatalogCached();
}
