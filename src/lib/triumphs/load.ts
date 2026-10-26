import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type {
  TriumphCatalog,
  TriumphGroup,
  TriumphRecord,
  TriumphSection,
  TitleEntry,
} from "@/types/triumph";

export { resolveTriumphIcon } from "@/lib/triumphs/icons";

let catalogCache: { catalog: TriumphCatalog; mtimeMs: number } | null = null;

function normalizeTriumphSection(section: TriumphSection): TriumphSection {
  return {
    ...section,
    children: (section.children ?? []).map(normalizeTriumphSection),
    records: section.records ?? [],
  };
}

function normalizeTriumphGroup(group: TriumphGroup): TriumphGroup {
  const sections = (group.sections ?? []).map(normalizeTriumphSection);
  if (sections.length > 0) {
    return { ...group, sections };
  }

  if (!group.records.length) {
    return { ...group, sections: [] };
  }

  return {
    ...group,
    sections: [
      {
        presentationNodeHash: `${group.presentationNodeHash}-all`,
        name: "All",
        iconPath: group.iconPath,
        children: [],
        records: group.records,
      },
    ],
  };
}

function normalizeTriumphCatalog(catalog: TriumphCatalog): TriumphCatalog {
  return {
    ...catalog,
    groups: catalog.groups.map(normalizeTriumphGroup),
    legacyTitles: catalog.legacyTitles ?? [],
  };
}

async function readTriumphCatalogFromDisk(): Promise<TriumphCatalog> {
  const filePath = path.join(process.cwd(), "data/triumphs.json");
  const fileStat = await stat(filePath);

  if (catalogCache && catalogCache.mtimeMs === fileStat.mtimeMs) {
    return catalogCache.catalog;
  }

  const raw = await readFile(filePath, "utf8");
  const catalog = normalizeTriumphCatalog(JSON.parse(raw) as TriumphCatalog);
  catalogCache = { catalog, mtimeMs: fileStat.mtimeMs };
  return catalog;
}

/**
 * Cached in memory per server instance (re-read when the file changes).
 * Not wrapped in unstable_cache: the catalog is over its 2 MB item limit.
 */
export async function loadTriumphCatalog(): Promise<TriumphCatalog> {
  return readTriumphCatalogFromDisk();
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
  return (
    catalog.titles.find((title) => title.slug === slug) ??
    catalog.legacyTitles?.find((title) => title.slug === slug)
  );
}

export function getTriumphSectionRecords(
  catalog: TriumphCatalog,
  groupSlug: string,
  sectionPath: string[],
): TriumphRecord[] {
  const group = getTriumphGroup(catalog, groupSlug);
  if (!group?.sections?.length || sectionPath.length === 0) return [];

  let sections = group.sections;
  let section: TriumphSection | undefined;

  for (const name of sectionPath) {
    section = sections.find((entry) => entry.name === name);
    if (!section) return [];
    sections = section.children ?? [];
  }

  return section?.records ?? [];
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

function normalizeActivityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the /, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Full triumph list for a raid / dungeon (e.g. "Dreaming City > Activities >
 * Last Wish" or "Legends > Raids > Vault of Glass"), found by activity name.
 */
export function findActivityTriumphSectionRecords(
  catalog: TriumphCatalog,
  activityName: string,
): TriumphRecord[] {
  const target = normalizeActivityName(activityName);
  const search = (sections: TriumphSection[]): TriumphSection | undefined => {
    for (const section of sections) {
      if (normalizeActivityName(section.name) === target && section.records.length > 0) {
        return section;
      }
      const nested = search(section.children ?? []);
      if (nested) return nested;
    }
    return undefined;
  };

  for (const group of catalog.groups) {
    const section = search(group.sections ?? []);
    if (section) return section.records;
  }
  return [];
}
