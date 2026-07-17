import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { CatalystCatalog } from "@/types/catalyst-item";

let catalogCache: CatalystCatalog | null = null;

async function readCatalystCatalogFromDisk(): Promise<CatalystCatalog> {
  if (catalogCache) return catalogCache;

  const filePath = path.join(process.cwd(), "data/catalysts.json");
  const raw = await readFile(filePath, "utf8");
  catalogCache = JSON.parse(raw) as CatalystCatalog;
  return catalogCache;
}

const loadCatalystCatalogCached = unstable_cache(
  readCatalystCatalogFromDisk,
  ["catalyst-catalog"],
  { revalidate: false },
);

export async function loadCatalystCatalog(): Promise<CatalystCatalog> {
  return loadCatalystCatalogCached();
}
