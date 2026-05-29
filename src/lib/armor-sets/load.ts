import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ArmorSetCatalog } from "@/types/armor-set";

let catalogCache: ArmorSetCatalog | null = null;

export async function loadArmorSetCatalog(): Promise<ArmorSetCatalog> {
  if (catalogCache) return catalogCache;

  const filePath = path.join(process.cwd(), "public/data/armor-sets.json");
  const raw = await readFile(filePath, "utf8");
  catalogCache = JSON.parse(raw) as ArmorSetCatalog;
  return catalogCache;
}
