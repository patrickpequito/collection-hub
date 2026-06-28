import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type {
  AllLootCatalog,
  AllLootFacets,
  AllLootItem,
  AllLootSearchFilters,
  AllLootSearchResult,
} from "@/types/all-loot";
import { isItemOwned } from "@/lib/all-loot/ownership";

let catalogCache: AllLootCatalog | null = null;

async function readAllLootCatalogFromDisk(): Promise<AllLootCatalog> {
  if (catalogCache) return catalogCache;

  const filePath = path.join(process.cwd(), "public/data/all-loot.json");
  const raw = await readFile(filePath, "utf8");
  catalogCache = JSON.parse(raw) as AllLootCatalog;
  return catalogCache;
}

const loadAllLootCatalogCached = unstable_cache(
  readAllLootCatalogFromDisk,
  ["all-loot-catalog"],
  { revalidate: false },
);

export async function loadAllLootCatalog(): Promise<AllLootCatalog> {
  return loadAllLootCatalogCached();
}

export async function loadAllLootFacets(): Promise<AllLootFacets> {
  const catalog = await loadAllLootCatalog();
  return catalog.facets;
}

function matchesMultiFilter(values: string[], candidates: string | string[] | null) {
  if (!values.length) return true;
  if (!candidates) return false;
  const list = Array.isArray(candidates) ? candidates : [candidates];
  return list.some((candidate) => values.includes(candidate));
}

function itemSeasonLabels(item: AllLootItem) {
  const labels = new Set<string>();
  if (item.versions?.length) {
    for (const version of item.versions) {
      labels.add(version.seasonLabel);
    }
  } else {
    labels.add(item.seasonLabel);
  }
  return [...labels];
}

function matchesQuery(item: AllLootItem, query: string) {
  if (!query.trim()) return true;
  return item.searchText.includes(query.trim().toLowerCase());
}

export function searchAllLootItems(
  items: AllLootItem[],
  filters: AllLootSearchFilters,
  ownedItemHashes?: ReadonlySet<string>,
): AllLootItem[] {
  return items.filter((item) => {
    if (!matchesQuery(item, filters.query)) return false;
    if (!matchesMultiFilter(filters.types, item.type)) return false;
    if (!matchesMultiFilter(filters.seasons, itemSeasonLabels(item))) return false;
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
    rarities: readList("rarities"),
    classes: readList("classes"),
    weaponTypes: readList("weaponTypes"),
    damageTypes: readList("damageTypes"),
    weaponSlots: readList("weaponSlots"),
    gearSlots: readList("gearSlots"),
    obtainable,
    collected,
  };
}
