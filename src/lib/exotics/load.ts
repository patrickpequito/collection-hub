import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ExoticCatalog } from "@/types/exotic-item";

let catalogCache: ExoticCatalog | null = null;

export async function loadExoticCatalog(): Promise<ExoticCatalog> {
  if (catalogCache) return catalogCache;

  const filePath = path.join(process.cwd(), "public/data/exotics.json");
  const raw = await readFile(filePath, "utf8");
  catalogCache = JSON.parse(raw) as ExoticCatalog;
  return catalogCache;
}
