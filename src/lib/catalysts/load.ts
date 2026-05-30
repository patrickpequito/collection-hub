import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CatalystCatalog } from "@/types/catalyst-item";

let catalogCache: CatalystCatalog | null = null;

export async function loadCatalystCatalog(): Promise<CatalystCatalog> {
  if (catalogCache) return catalogCache;

  const filePath = path.join(process.cwd(), "public/data/catalysts.json");
  const raw = await readFile(filePath, "utf8");
  catalogCache = JSON.parse(raw) as CatalystCatalog;
  return catalogCache;
}
