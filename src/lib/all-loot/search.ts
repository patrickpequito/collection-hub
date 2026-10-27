import { readFile, stat } from "node:fs/promises";
import { EVENTS } from "@/lib/all-loot/events";
import { expansionFromSource } from "@/lib/all-loot/expansion-from-source";
import path from "node:path";
import type {
  AllLootCatalog,
  AllLootFacets,
  AllLootItem,
  AllLootSearchFilters,
  AllLootSearchResult,
} from "@/types/all-loot";
import { isItemOwned } from "@/lib/all-loot/ownership";
import { applySeasonCatalogOverrides } from "@/lib/all-loot/season-overrides";

let catalogCache: AllLootCatalog | null = null;
/** File mtime of the cached catalog, so a regenerated data/all-loot.json is picked up without a restart. */
let catalogMtimeMs = 0;

async function readAllLootCatalogFromDisk(): Promise<AllLootCatalog> {
  const filePath = path.join(process.cwd(), "data/all-loot.json");
  const { mtimeMs } = await stat(filePath);
  if (catalogCache && mtimeMs === catalogMtimeMs) return catalogCache;

  catalogMtimeMs = mtimeMs;
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as AllLootCatalog;
  catalogCache = {
    ...parsed,
    items: applySeasonCatalogOverrides(parsed.items),
  };
  return catalogCache;
}

export async function loadAllLootCatalog(): Promise<AllLootCatalog> {
  return readAllLootCatalogFromDisk();
}

export async function loadAllLootFacets(): Promise<AllLootFacets> {
  const catalog = await loadAllLootCatalog();
  const present = new Set(catalog.items.flatMap(itemEventLabels));
  return { ...catalog.facets, events: EVENTS.map((event) => event.label).filter((label) => present.has(label)) };
}

function matchesMultiFilter(values: string[], candidates: string | string[] | null) {
  if (!values.length) return true;
  if (!candidates) return false;
  const list = Array.isArray(candidates) ? candidates : [candidates];
  return list.some((candidate) => values.includes(candidate));
}

/** Season / expansion labels of an item's non-event versions (event editions filter by event). */
function itemSeasonLabels(item: AllLootItem) {
  const labels = new Set<string>();
  if (item.versions?.length) {
    for (const version of item.versions) {
      if (!version.eventLabel) labels.add(version.seasonLabel);
    }
  } else if (!item.eventLabel) {
    labels.add(item.seasonLabel);
  }
  // Expansion loot often carries a reissue or launch-episode label: also match its expansion.
  const expansion = expansionFromSource(item.source);
  if (expansion && labels.size) labels.add(expansion);
  return [...labels];
}

function itemEventLabels(item: AllLootItem): string[] {
  const labels = new Set<string>();
  if (item.eventLabel) labels.add(item.eventLabel);
  for (const version of item.versions ?? []) {
    if (version.eventLabel) labels.add(version.eventLabel);
  }
  return [...labels];
}

function matchesQuery(item: AllLootItem, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  if (item.searchText.includes(needle)) return true;
  return expansionFromSource(item.source)?.toLowerCase().includes(needle) ?? false;
}

export function searchAllLootItems(
  items: AllLootItem[],
  filters: AllLootSearchFilters,
  ownedItemHashes?: ReadonlySet<string>,
): AllLootItem[] {
  return items.filter((item) => {
    if (!matchesQuery(item, filters.query)) return false;
    if (filters.sources?.length) {
      const source = item.source.toLowerCase();
      if (!filters.sources.some((keyword) => source.includes(keyword.toLowerCase()))) {
        return false;
      }
    }
    if (!matchesMultiFilter(filters.types, item.type)) return false;
    if (!matchesMultiFilter(filters.seasons, itemSeasonLabels(item))) return false;
    if (!matchesMultiFilter(filters.events, itemEventLabels(item))) return false;
    if (!matchesMultiFilter(filters.rarities, item.rarity)) return false;
    if (!matchesMultiFilter(filters.damageTypes, item.damageType)) return false;

    if (filters.classes.length) {
      if (
        item.type !== "Armor" &&
        item.type !== "Ornament" &&
        item.type !== "Emote"
      ) {
        return false;
      }
      if (!filters.classes.includes(item.classOrWeaponType ?? "")) return false;
    }

    if (filters.weaponTypes.length) {
      const weaponType = item.classOrWeaponType ?? "";
      if (!filters.weaponTypes.includes(weaponType)) return false;
      if (item.type === "Ornament" && !filters.types.includes("Ornament")) {
        return false;
      }
      if (item.type !== "Weapon" && item.type !== "Ornament") return false;
    }

    if (filters.weaponSlots.length) {
      if (item.type !== "Weapon") return false;
      if (!filters.weaponSlots.includes(item.slot ?? "")) return false;
    }

    if (filters.gearSlots.length) {
      if (item.type !== "Armor" && item.type !== "Ornament") return false;
      if (!filters.gearSlots.includes(item.slot ?? "")) return false;
    }

    if (filters.obtainable === "yes" && !item.obtainable) return false;
    if (filters.obtainable === "no" && item.obtainable) return false;

    if (filters.collected !== "all") {
      if (!ownedItemHashes) return false;
      const owned = isItemOwned(item, ownedItemHashes);
      if (filters.collected === "yes" && !owned) return false;
      if (filters.collected === "no" && owned) return false;
    }

    return true;
  });
}

export async function searchAllLootPage(
  filters: AllLootSearchFilters,
  page: number,
  pageSize: number,
  ownedItemHashes?: ReadonlySet<string>,
): Promise<AllLootSearchResult> {
  const catalog = await loadAllLootCatalog();
  const matched = searchAllLootItems(
    catalog.items,
    filters,
    ownedItemHashes,
  );
  const offset = (page - 1) * pageSize;
  const items = matched.slice(offset, offset + pageSize);

  return {
    items,
    total: matched.length,
    page,
    pageSize,
    hasMore: offset + items.length < matched.length,
  };
}

export function parseAllLootSearchFilters(
  params: URLSearchParams,
): AllLootSearchFilters {
  const readList = (key: string) =>
    params
      .getAll(key)
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

  const obtainableParam = params.get("obtainable");
  const obtainable =
    obtainableParam === "yes" || obtainableParam === "no"
      ? obtainableParam
      : "all";

  const collectedParam = params.get("collected");
  const collected =
    collectedParam === "yes" || collectedParam === "no"
      ? collectedParam
      : "all";

  return {
    query: params.get("q")?.trim() ?? "",
    types: readList("types"),
    seasons: readList("seasons"),
    events: readList("events"),
    rarities: readList("rarities"),
    classes: readList("classes"),
    weaponTypes: readList("weaponTypes"),
    damageTypes: readList("damageTypes"),
    weaponSlots: readList("weaponSlots"),
    gearSlots: readList("gearSlots"),
    sources: readList("sources"),
    obtainable,
    collected,
  };
}
