/**
 * Applies season-label migrations to data/all-loot.json without a full manifest regen.
 *
 * Usage: node scripts/relabel-all-loot-seasons.mjs [catalog-path]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_SEASON_ORDER,
  CALL_TO_ARMS_LABEL,
  CALL_TO_ARMS_WATERMARK,
  INTO_THE_LIGHT_LABEL,
  INTO_THE_LIGHT_WATERMARK,
  MONUMENT_OF_TRIUMPH_LABEL,
  applyFeaturedWatermarkLabelCorrection,
  catalogVersionsEquivalent,
  displayNumberFromLabel,
  MONUMENT_FEATURED_WATERMARK,
  preferCatalogVersion,
  resolveEventLabel,
  resolveIntoTheLightSeasonLabel,
  resolveArmor30SeasonLabel,
  REVENANT_EPISODE_WATERMARK,
  resolveActivitySourceSeasonLabel,
  resolveCollectibleSourceString,
  resolveWatermarkSeasonNumber,
  seasonLabelFromManifestNumber,
  stripIncorrectMonumentLabel,
  resolveSeasonLabelFromSource,
  isSourceObtainable,
  isRecurringVersionSource,
} from "./all-loot-mappings.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogPath =
  process.argv[2] ?? resolve(__dirname, "../data/all-loot.json");

const DIM_WATERMARK_TO_SEASON = {
  "/common/destiny2_content/icons/249813e647271a8227bae0d8a39ed505.png": 27,
  "/common/destiny2_content/icons/6129365b4fad6754f2b8c4478fc3c4ac.png": 27,
  "/common/destiny2_content/icons/4376a7d734583ae347acf9732aa3bb43.png": 27,
  "/common/destiny2_content/icons/95f7754d52d6016fdc445fb62aa7a31e.png": 28,
  "/common/destiny2_content/icons/e78fd9419f99464816ac8f628bc3c4af.png": 28,
  "/common/destiny2_content/icons/5232219633cc4d90570bffda36caccf4.png": 25,
  "/common/destiny2_content/icons/0ac354c1c326441716ddb15d2c158c59.png": 26,
  "/common/destiny2_content/icons/6eeb62a30439cecc7699c22f3e1fb3cf.png": 28,
};

function mockItem(seasonIconPath) {
  return { iconWatermark: seasonIconPath, index: 0 };
}

function isIntoTheLight(seasonIconPath, seasonLabel) {
  return (
    seasonLabel === INTO_THE_LIGHT_LABEL ||
    ((seasonIconPath?.split("/").pop() ?? "") === INTO_THE_LIGHT_WATERMARK &&
      seasonLabel === "S23 Season of the Wish")
  );
}

function applyIntoTheLightLabel(entry) {
  if (isIntoTheLight(entry.seasonIconPath, entry.seasonLabel)) {
    entry.seasonLabel = INTO_THE_LIGHT_LABEL;
    entry.seasonNumber = displayNumberFromLabel(INTO_THE_LIGHT_LABEL);
    entry.seasonDisplayIconPath = `/common/destiny2_content/icons/${INTO_THE_LIGHT_WATERMARK}`;
    entry.seasonDisplayIconWatermark = false;
    delete entry.eventLabel;
  }
  for (const version of entry.versions ?? []) {
    if (isIntoTheLight(version.seasonIconPath, version.seasonLabel)) {
      version.seasonLabel = INTO_THE_LIGHT_LABEL;
      version.seasonNumber = displayNumberFromLabel(INTO_THE_LIGHT_LABEL);
      version.seasonDisplayIconPath = `/common/destiny2_content/icons/${INTO_THE_LIGHT_WATERMARK}`;
      version.seasonDisplayIconWatermark = false;
      delete version.eventLabel;
    }
  }
}

function unwrapCallToArmsSeasonLabel(entry, version, currentLabel) {
  if (currentLabel !== CALL_TO_ARMS_LABEL) return currentLabel;

  const sibling = entry.versions?.find(
    (candidate) =>
      candidate !== version &&
      candidate.seasonLabel &&
      candidate.seasonLabel !== CALL_TO_ARMS_LABEL,
  );
  if (sibling) return sibling.seasonLabel;

  const source = entry.source ?? "";
  const fromSource = resolveSeasonLabelFromSource(source, {});
  if (fromSource) return fromSource;

  return "The Edge of Fate";
}

function resolvePrimaryLabel(entry, dimSeasonData) {
  const source = entry.source ?? "";
  let label =
    resolveSeasonLabelFromSource(source, {}) ??
    entry.seasonLabel ??
    "Red War";

  label = applyFeaturedWatermarkLabelCorrection(
    mockItem(entry.seasonIconPath),
    label,
    source,
    dimSeasonData,
  );

  return resolveIntoTheLightSeasonLabel(
    mockItem(entry.seasonIconPath),
    label,
    source,
  );
}

const DIM_WATERMARK_TO_SEASON_URL =
  "https://raw.githubusercontent.com/DestinyItemManager/d2-additional-info/master/output/watermark-to-season.json";

function resolveVersionLabel(version, entry, dimSeasonData) {
  const source = entry.source ?? "";
  let label = version.seasonLabel;
  const fromSource = resolveSeasonLabelFromSource(source, {});
  const ownSeason = resolveWatermarkSeasonNumber(
    mockItem(version.seasonIconPath),
    dimSeasonData,
  );

  if (fromSource && !isRecurringVersionSource(source)) {
    label =
      resolveActivitySourceSeasonLabel(fromSource, ownSeason) ?? fromSource;
  } else if (ownSeason > 0) {
    label = seasonLabelFromManifestNumber(ownSeason);
  }

  if (label === "S28 Season: Reclamation") {
    label = "The Edge of Fate";
  }

  const wm = version.seasonIconPath?.split("/").pop() ?? "";
  if (wm === MONUMENT_FEATURED_WATERMARK) {
    return MONUMENT_OF_TRIUMPH_LABEL;
  }
  if (wm === REVENANT_EPISODE_WATERMARK) {
    return "S25 Episode: Revenant";
  }
  if (wm === "95f7754d52d6016fdc445fb62aa7a31e.png") {
    return "Renegades";
  }
  if (wm === "0ac354c1c326441716ddb15d2c158c59.png") {
    return "S26 Episode: Heresy";
  }

  return stripIncorrectMonumentLabel(
    mockItem(version.seasonIconPath),
    applyFeaturedWatermarkLabelCorrection(
      mockItem(version.seasonIconPath),
      label,
      entry.source ?? "",
      dimSeasonData,
    ),
    entry.source ?? "",
  );
}

function applyVersionLabels(entry, version, dimSeasonData, source = "") {
  if (version.seasonLabel === INTO_THE_LIGHT_LABEL) return;

  if (entry.type === "Armor") {
    const armorLabel = resolveArmor30SeasonLabel(
      mockItem(version.seasonIconPath),
      source || entry.source || "",
      {},
      dimSeasonData,
    );
    if (armorLabel) {
      version.seasonLabel = normalizeMonumentLabel(armorLabel);
      version.seasonNumber = displayNumberFromLabel(version.seasonLabel);

      const versionEvent = resolveEventLabel(
        source,
        version.seasonIconPath ?? entry.seasonIconPath ?? "",
        version.seasonLabel ?? "",
      );
      if (versionEvent) version.eventLabel = versionEvent;
      else delete version.eventLabel;
      return;
    }
  }

  if (version.seasonLabel === CALL_TO_ARMS_LABEL) {
    version.seasonLabel = unwrapCallToArmsSeasonLabel(
      entry,
      version,
      version.seasonLabel,
    );
  }

  version.seasonLabel = normalizeMonumentLabel(
    resolveVersionLabel(version, entry, dimSeasonData),
  );
  version.seasonNumber = displayNumberFromLabel(version.seasonLabel);

  const versionEvent = resolveEventLabel(
    source,
    version.seasonIconPath ?? entry.seasonIconPath ?? "",
    version.seasonLabel ?? "",
  );
  if (versionEvent) version.eventLabel = versionEvent;
  else delete version.eventLabel;
}

function syncEntryFromVersion(entry, version) {
  entry.itemHash = version.itemHash;
  entry.name = version.name;
  entry.iconPath = version.iconPath;
  entry.seasonIconPath = version.seasonIconPath;
  if (version.seasonDisplayIconPath) {
    entry.seasonDisplayIconPath = version.seasonDisplayIconPath;
  }
  if (version.seasonDisplayIconWatermark !== undefined) {
    entry.seasonDisplayIconWatermark = version.seasonDisplayIconWatermark;
  }
  entry.seasonLabel = version.seasonLabel;
  entry.seasonNumber = version.seasonNumber;
  if (version.eventLabel) entry.eventLabel = version.eventLabel;
  else delete entry.eventLabel;
}

function collapseItemVersions(entry) {
  if (!entry.versions?.length) return;

  const compareContext = {
    fallbackPerkColumns: entry.perkColumns,
    fallbackStats: entry.stats,
  };

  const merged = [];
  const droppedHashes = [];

  for (const version of entry.versions) {
    const matchIndex = merged.findIndex((existing) =>
      catalogVersionsEquivalent(existing, version, compareContext),
    );

    if (matchIndex < 0) {
      merged.push(version);
      continue;
    }

    const kept = preferCatalogVersion(merged[matchIndex], version);
    const dropped =
      kept.itemHash === merged[matchIndex].itemHash ? version : merged[matchIndex];
    droppedHashes.push(dropped.itemHash);
    merged[matchIndex] = kept;
  }

  const collapsed = merged.sort(
    (a, b) =>
      b.seasonNumber - a.seasonNumber ||
      Number(b.itemHash) - Number(a.itemHash),
  );

  if (droppedHashes.length) {
    const alternates = new Set(entry.alternateItemHashes ?? []);
    const merged = new Set(entry.mergedVersionHashes ?? []);
    alternates.add(entry.itemHash);
    for (const hash of droppedHashes) {
      alternates.add(hash);
      merged.add(hash);
    }
    for (const version of collapsed) alternates.delete(version.itemHash);
    entry.alternateItemHashes = [...alternates];
    entry.mergedVersionHashes = [...merged];
  }

  if (collapsed.length <= 1) {
    if (collapsed.length === 1) syncEntryFromVersion(entry, collapsed[0]);
    delete entry.versions;
    return;
  }

  entry.versions = collapsed;
  syncEntryFromVersion(entry, collapsed[0]);
}

function normalizeMonumentLabel(label) {
  return label === "S29 Monument of Triumph" ? MONUMENT_OF_TRIUMPH_LABEL : label;
}

function correctEntrySource(entry) {
  if (
    entry.name === "Tyranny of Heaven" &&
    /garden of salvation/i.test(entry.source ?? "")
  ) {
    return "Source: Last Wish raid.";
  }
  return entry.source ?? "";
}

function applyEntryLabels(entry, dimSeasonData) {
  entry.source = correctEntrySource(entry);
  entry.seasonLabel = normalizeMonumentLabel(entry.seasonLabel);
  applyIntoTheLightLabel(entry);

  for (const version of entry.versions ?? []) {
    applyVersionLabels(entry, version, dimSeasonData);
  }

  collapseItemVersions(entry);

  if (entry.seasonLabel === CALL_TO_ARMS_LABEL) {
    entry.seasonLabel = unwrapCallToArmsSeasonLabel(
      entry,
      null,
      entry.seasonLabel,
    );
  }

  if (entry.seasonLabel !== INTO_THE_LIGHT_LABEL) {
    if (entry.versions?.length) {
      const latest = entry.versions[0];
      entry.seasonLabel = latest.seasonLabel;
      entry.seasonNumber = latest.seasonNumber;
      if (latest.eventLabel) entry.eventLabel = latest.eventLabel;
      else delete entry.eventLabel;
    } else if (entry.type === "Armor") {
      const armorLabel = resolveArmor30SeasonLabel(
        mockItem(entry.seasonIconPath),
        entry.source ?? "",
        {},
        dimSeasonData,
      );
      entry.seasonLabel = normalizeMonumentLabel(
        armorLabel ?? resolvePrimaryLabel(entry, dimSeasonData),
      );
      entry.seasonNumber = displayNumberFromLabel(entry.seasonLabel);

      const eventLabel = resolveEventLabel(
        entry.source ?? "",
        entry.seasonIconPath ?? "",
        entry.seasonLabel ?? "",
      );
      if (eventLabel) entry.eventLabel = eventLabel;
      else delete entry.eventLabel;
    } else {
      entry.seasonLabel = resolvePrimaryLabel(entry, dimSeasonData);
      entry.seasonNumber = displayNumberFromLabel(entry.seasonLabel);

      const eventLabel = resolveEventLabel(
        entry.source ?? "",
        entry.seasonIconPath ?? "",
        entry.seasonLabel ?? "",
      );
      if (eventLabel) entry.eventLabel = eventLabel;
      else delete entry.eventLabel;
    }
  }

  entry.obtainable = isSourceObtainable(
    (entry.source ?? "").replace(/^Source:\s*/i, ""),
    null,
    entry.seasonNumber ?? 0,
  );
}

function buildSearchText(entry) {
  const versionText = (entry.versions ?? []).flatMap((version) => [
    version.name,
    version.seasonLabel,
    version.eventLabel,
  ]);

  return [
    entry.name,
    entry.seasonLabel,
    entry.eventLabel,
    ...versionText,
    entry.type,
    entry.rarity,
    entry.classOrWeaponType,
    entry.damageType,
    entry.slot,
    entry.ammoType,
    entry.source,
    entry.obtainable ? "obtainable yes" : "obtainable no",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function rebuildFacets(items) {
  const seasonSet = new Set();
  for (const item of items) {
    if (item.versions?.length) {
      for (const version of item.versions) {
        seasonSet.add(version.seasonLabel);
      }
    } else {
      seasonSet.add(item.seasonLabel);
    }
  }

  return CANONICAL_SEASON_ORDER.concat(
    [...seasonSet]
      .filter((label) => !CANONICAL_SEASON_ORDER.includes(label))
      .sort((a, b) => a.localeCompare(b)),
  );
}

function countCallToArmsEvent(items) {
  return items.filter(
    (item) =>
      item.eventLabel === CALL_TO_ARMS_LABEL ||
      item.versions?.some((version) => version.eventLabel === CALL_TO_ARMS_LABEL),
  ).length;
}

const loot = JSON.parse(readFileSync(catalogPath, "utf8"));

let watermarkToSeason = { ...DIM_WATERMARK_TO_SEASON };
try {
  const response = await fetch(DIM_WATERMARK_TO_SEASON_URL);
  if (response.ok) {
    watermarkToSeason = { ...await response.json(), ...DIM_WATERMARK_TO_SEASON };
  }
} catch {
  // Fall back to the partial local map.
}

const relabelDimSeasonData = { watermarkToSeason };

for (const item of loot.items) {
  applyEntryLabels(item, relabelDimSeasonData);
  item.searchText = buildSearchText(item);
}

loot.facets.seasons = rebuildFacets(loot.items);
writeFileSync(catalogPath, JSON.stringify(loot));

console.log("Wrote", catalogPath);
console.log(
  "Edge of Fate:",
  loot.items.filter((i) => i.seasonLabel === "The Edge of Fate").length,
);
console.log(
  "Into the Light:",
  loot.items.filter(
    (i) =>
      i.seasonLabel === INTO_THE_LIGHT_LABEL ||
      i.versions?.some((v) => v.seasonLabel === INTO_THE_LIGHT_LABEL),
  ).length,
);
console.log("Call to Arms (event):", countCallToArmsEvent(loot.items));
console.log(
  "Call to Arms as season (should be 0):",
  loot.items.filter(
    (i) =>
      i.seasonLabel === CALL_TO_ARMS_LABEL ||
      i.versions?.some((v) => v.seasonLabel === CALL_TO_ARMS_LABEL),
  ).length,
);
console.log(
  "S28 Reclamation left:",
  loot.items.filter((i) => i.seasonLabel === "S28 Season: Reclamation").length,
);
