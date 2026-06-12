import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { ExoticCatalog } from "@/types/exotic-item";

let catalogCache: ExoticCatalog | null = null;

async function readExoticCatalogFromDisk(): Promise<ExoticCatalog> {
  if (catalogCache) return catalogCache;

  const filePath = path.join(process.cwd(), "public/data/exotics.json");
  const raw = await readFile(filePath, "utf8");
  catalogCache = JSON.parse(raw) as ExoticCatalog;
  return catalogCache;
}

const loadExoticCatalogCached = unstable_cache(
  readExoticCatalogFromDisk,
  ["exotic-catalog"],
  { revalidate: false },
);

export async function loadExoticCatalog(): Promise<ExoticCatalog> {
  return loadExoticCatalogCached();
}
