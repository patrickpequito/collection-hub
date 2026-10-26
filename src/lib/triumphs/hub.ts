import {
  SEAL_CATEGORY_BY_SLUG,
  triumphGroupBand,
  type SealCategory,
  type TriumphGroupBand,
} from "@/data/triumphs/seal-categories";
import { splitTitleRecords } from "@/lib/triumphs/record-progress";
import type { TitleEntry, TriumphCatalog, TriumphGroup } from "@/types/triumph";

/** Light seal data for the hub grid and left column (no record text). */
export type SealSummary = {
  slug: string;
  name: string;
  guardianTitle: string;
  iconPath: string;
  category: SealCategory | "Legacy";
  completionRecordHash: string | null;
  gildingTrackingRecordHash: string | null;
  baseHashes: string[];
  gildingHashes: string[];
};

export type TriumphGroupSummary = {
  slug: string;
  name: string;
  iconPath: string;
  band: TriumphGroupBand;
  recordHashes: string[];
};

export function summarizeSeal(title: TitleEntry): SealSummary {
  const { baseRecords, gildingRecords } = splitTitleRecords(title.records);
  return {
    slug: title.slug,
    name: title.name,
    guardianTitle: title.guardianTitle ?? title.name,
    iconPath: title.iconPath,
    category: title.isLegacy
      ? "Legacy"
      : title.isSeasonal
        ? "Events"
        : (SEAL_CATEGORY_BY_SLUG[title.slug] ?? "Activities"),
    completionRecordHash: title.completionRecordHash,
    gildingTrackingRecordHash: title.gildingTrackingRecordHash,
    baseHashes: baseRecords.map((record) => record.recordHash),
    gildingHashes: gildingRecords.map((record) => record.recordHash),
  };
}

export function summarizeTriumphGroup(group: TriumphGroup): TriumphGroupSummary {
  return {
    slug: group.slug,
    name: group.name,
    iconPath: group.iconPath,
    band: triumphGroupBand(group.slug),
    recordHashes: group.records.map((record) => record.recordHash),
  };
}

export function loadTriumphHubData(catalog: TriumphCatalog) {
  return {
    seals: catalog.titles.map(summarizeSeal),
    legacySeals: (catalog.legacyTitles ?? []).map(summarizeSeal),
    groups: catalog.groups.map(summarizeTriumphGroup),
  };
}

/** Current seals in hub order (block, then newest first) — drives Z / C on seal pages. */
export function orderedSeals(catalog: TriumphCatalog): SealSummary[] {
  const order = ["Expansions", "Raids", "Dungeons", "Activities", "Events"];
  return catalog.titles
    .map(summarizeSeal)
    .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
}
