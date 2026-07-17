import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { ArmorSetCatalog } from "@/types/armor-set";

let catalogCache: ArmorSetCatalog | null = null;

async function readArmorSetCatalogFromDisk(): Promise<ArmorSetCatalog> {
  if (catalogCache) return catalogCache;

  const filePath = path.join(process.cwd(), "data/armor-sets.json");
  const raw = await readFile(filePath, "utf8");
  catalogCache = JSON.parse(raw) as ArmorSetCatalog;
  return catalogCache;
}

const loadArmorSetCatalogCached = unstable_cache(
  readArmorSetCatalogFromDisk,
  ["armor-set-catalog-v2"],
  { revalidate: false },
);

export async function loadArmorSetCatalog(): Promise<ArmorSetCatalog> {
  return loadArmorSetCatalogCached();
}
