import { displayNumberFromLabel } from "@/lib/all-loot/season-icon-label";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { resolveShaderSectionLabel } from "@/lib/shaders/shader-icon-label";
import {
  compareNestedAcquisitionDetails,
  compareShaderAcquisitionLabels,
  isNestedAcquisitionCategory,
  resolveShaderAcquisition,
} from "@/lib/shaders/shader-sources";
import type { AllLootItem } from "@/types/all-loot";
import type { LootItem } from "@/types/activity-loot";

export type ShaderViewMode = "season" | "activity";

export type ShaderCatalogItem = LootItem & {
  /** Icon-first season / expansion / event label. */
  seasonLabel: string;
  /** Acquisition bucket (Raids, Vanguard, Eververse, …). */
  acquisitionLabel: string;
  /** Specific raid / dungeon when acquisitionLabel is Raids or Dungeons. */
  acquisitionDetail?: string;
};

export type ShaderSubgroup = {
  id: string;
  label: string;
  seasonIconPath?: string;
  items: LootItem[];
  /** Nested raid/dungeon names under Raids / Dungeons. */
  subgroups?: ShaderSubgroup[];
};

export type ShaderSection = {
  id: string;
  label: string;
  seasonIconPath?: string;
  itemCount: number;
  /** Flat list for when subgroups are toggled off. */
  items: LootItem[];
  subgroups: ShaderSubgroup[];
};

/** @deprecated Use ShaderSection */
export type ShaderSeasonSection = ShaderSection;
/** @deprecated Use ShaderSubgroup */
export type ShaderSourceGroup = ShaderSubgroup;

function sortSeasonLabels(
  labels: string[],
  facetSeasons: readonly string[],
): string[] {
  const facetIndex = new Map(
    facetSeasons.map((label, index) => [label, index]),
  );

  return [...labels].sort((a, b) => {
    const ai = facetIndex.get(a);
    const bi = facetIndex.get(b);
    if (ai !== undefined && bi !== undefined) return ai - bi;
    if (ai !== undefined) return -1;
    if (bi !== undefined) return 1;

    const an = displayNumberFromLabel(a);
    const bn = displayNumberFromLabel(b);
    if (an !== bn) return bn - an;
    return a.localeCompare(b);
  });
}

function sectionId(label: string): string {
  return label
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function loadShaderItems(items: readonly AllLootItem[]): AllLootItem[] {
  return items
    .filter((item) => item.type === "Shader")
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildShaderCatalogItems(
  shaders: readonly AllLootItem[],
): ShaderCatalogItem[] {
  return shaders.map((shader) => {
    const loot = toLootItemFromCatalog(shader);
    const acquisition = resolveShaderAcquisition(shader.source);
    return {
      ...loot,
      seasonLabel: resolveShaderSectionLabel(shader),
      acquisitionLabel: acquisition.category,
      acquisitionDetail: acquisition.detail,
    };
  });
}

function toLootItem(item: ShaderCatalogItem): LootItem {
  const {
    seasonLabel: _seasonLabel,
    acquisitionLabel: _acquisitionLabel,
    acquisitionDetail: _acquisitionDetail,
    ...loot
  } = item;
  return loot;
}

function flattenItems(items: readonly ShaderCatalogItem[]): LootItem[] {
  return items.map(toLootItem);
}

function nestAcquisitionDetails(
  parentLabel: string,
  category: string,
  items: readonly ShaderCatalogItem[],
): ShaderSubgroup[] {
  const byDetail = new Map<string, ShaderCatalogItem[]>();
  for (const item of items) {
    const detail = item.acquisitionDetail ?? "Unknown";
    const bucket = byDetail.get(detail);
    if (bucket) bucket.push(item);
    else byDetail.set(detail, [item]);
  }

  return [...byDetail.keys()]
    .sort((a, b) => compareNestedAcquisitionDetails(category, a, b))
    .map((detail) => {
      const detailItems = byDetail.get(detail) ?? [];
      return {
        id: sectionId(`${parentLabel}__${category}__${detail}`),
        label: detail,
        items: flattenItems(detailItems),
      };
    });
}

/**
 * Build top-level sections for the active view mode.
 * - season: season/event → acquisition category (Raids/Dungeons/Destinations nest names)
 * - activity: acquisition category → season (nested buckets → detail names)
 */
export function groupShaderCatalog(
  items: readonly ShaderCatalogItem[],
  mode: ShaderViewMode,
  facetSeasons: readonly string[] = [],
): ShaderSection[] {
  const primaryKey =
    mode === "season"
      ? (item: ShaderCatalogItem) => item.seasonLabel
      : (item: ShaderCatalogItem) => item.acquisitionLabel;

  const byPrimary = new Map<string, ShaderCatalogItem[]>();
  for (const item of items) {
    const key = primaryKey(item);
    const bucket = byPrimary.get(key);
    if (bucket) bucket.push(item);
    else byPrimary.set(key, [item]);
  }

  const primaryLabels =
    mode === "season"
      ? sortSeasonLabels([...byPrimary.keys()], facetSeasons)
      : [...byPrimary.keys()].sort(compareShaderAcquisitionLabels);

  return primaryLabels.map((label) => {
    const groupItems = byPrimary.get(label) ?? [];
    const withIcon = groupItems.find((item) => item.seasonIconPath);

    let subgroups: ShaderSubgroup[];

    if (mode === "activity" && isNestedAcquisitionCategory(label)) {
      subgroups = nestAcquisitionDetails(label, label, groupItems);
    } else if (mode === "season") {
      const byCategory = new Map<string, ShaderCatalogItem[]>();
      for (const item of groupItems) {
        const bucket = byCategory.get(item.acquisitionLabel);
        if (bucket) bucket.push(item);
        else byCategory.set(item.acquisitionLabel, [item]);
      }

      subgroups = [...byCategory.keys()]
        .sort(compareShaderAcquisitionLabels)
        .map((category) => {
          const categoryItems = byCategory.get(category) ?? [];
          const nested = isNestedAcquisitionCategory(category)
            ? nestAcquisitionDetails(label, category, categoryItems)
            : undefined;
          return {
            id: sectionId(`${label}__${category}`),
            label: category,
            items: flattenItems(categoryItems),
            subgroups: nested,
          };
        });
    } else {
      const bySeason = new Map<string, ShaderCatalogItem[]>();
      for (const item of groupItems) {
        const bucket = bySeason.get(item.seasonLabel);
        if (bucket) bucket.push(item);
        else bySeason.set(item.seasonLabel, [item]);
      }

      subgroups = sortSeasonLabels([...bySeason.keys()], facetSeasons).map(
        (season) => {
          const seasonItems = bySeason.get(season) ?? [];
          const subIcon = seasonItems.find((item) => item.seasonIconPath);
          return {
            id: sectionId(`${label}__${season}`),
            label: season,
            seasonIconPath: subIcon?.seasonIconPath,
            items: flattenItems(seasonItems),
          };
        },
      );
    }

    return {
      id: sectionId(`${mode}-${label}`),
      label,
      seasonIconPath:
        mode === "season" ? withIcon?.seasonIconPath : undefined,
      itemCount: groupItems.length,
      items: flattenItems(groupItems),
      subgroups,
    };
  });
}

/** @deprecated Prefer `buildShaderCatalogItems` + `groupShaderCatalog`. */
export function groupShadersBySeasonIcon(
  shaders: readonly AllLootItem[],
  facetSeasons: readonly string[] = [],
): ShaderSection[] {
  return groupShaderCatalog(
    buildShaderCatalogItems(shaders),
    "season",
    facetSeasons,
  );
}
