import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  TriumphCatalog,
  TriumphGroup,
  TriumphRecord,
  TitleEntry,
} from "@/types/triumph";

export { resolveTriumphIcon } from "@/lib/triumphs/icons";

let catalogCache: TriumphCatalog | null = null;

export async function loadTriumphCatalog(): Promise<TriumphCatalog> {
  if (catalogCache) return catalogCache;

  const filePath = path.join(process.cwd(), "public/data/triumphs.json");
  const raw = await readFile(filePath, "utf8");
  catalogCache = JSON.parse(raw) as TriumphCatalog;
  return catalogCache;
}

export function getTriumphGroup(
  catalog: TriumphCatalog,
  slug: string,
): TriumphGroup | undefined {
  return catalog.groups.find((group) => group.slug === slug);
}

export function getTitleEntry(
  catalog: TriumphCatalog,
  slug: string,
): TitleEntry | undefined {
  return catalog.titles.find((title) => title.slug === slug);
}

export function findTriumphRecordByHash(
  catalog: TriumphCatalog,
  recordHash: string,
): TriumphRecord | undefined {
  for (const group of catalog.groups) {
    const record = group.records.find((entry) => entry.recordHash === recordHash);
    if (record) return record;
  }

  for (const title of catalog.titles) {
    const record = title.records.find((entry) => entry.recordHash === recordHash);
    if (record) return record;
  }

  return undefined;
}

export function resolveActivityTriumphRecords(
  catalog: TriumphCatalog,
  recordHashes: string[],
): TriumphRecord[] {
  return recordHashes
    .map((hash) => findTriumphRecordByHash(catalog, hash))
    .filter((record): record is TriumphRecord => record !== undefined);
}
