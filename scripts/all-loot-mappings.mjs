/**
 * Player-facing chapters S1–S29. Bungie manifest seasons are 1–28; manifest 27–28
 * map to display chapters (27 → The Edge of Fate half-year, 28 → Monument of Triumph).
 */
export const MONUMENT_OF_TRIUMPH_LABEL = "Monument of Triumph";

export const MANIFEST_CHAPTER_LABEL = {
  1: "Red War",
  2: "Curse of Osiris",
  3: "Warmind",
  4: "Forsaken",
  5: "S5 Season of the Forge",
  6: "S6 Season of the Drifter",
  7: "S7 Season of Opulence",
  8: "S8 Season of the Undying",
  9: "S9 Season of Dawn",
  10: "S10 Season of the Worthy",
  11: "S11 Season of Arrivals",
  12: "S12 Season of the Hunt",
  13: "S13 Season of the Chosen",
  14: "S14 Season of the Splicer",
  15: "S15 Season of the Lost",
  16: "S16 Season of the Risen",
  17: "S17 Season of the Haunted",
  18: "S18 Season of Plunder",
  19: "S19 Season of the Seraph",
  20: "S20 Season of Defiance",
  21: "S21 Season of the Deep",
  22: "S22 Season of the Witch",
  23: "S23 Season of the Wish",
  24: "S24 Episode: Echoes",
  25: "S25 Episode: Revenant",
  26: "S26 Episode: Heresy",
  27: "The Edge of Fate",
  28: MONUMENT_OF_TRIUMPH_LABEL,
};

/** Facet order (newest first). Expansion before season when S numbers match. */
export const CANONICAL_SEASON_ORDER = [
  MONUMENT_OF_TRIUMPH_LABEL,
  "Renegades",
  "The Edge of Fate",
  "S26 Episode: Heresy",
  "S25 Episode: Revenant",
  "S24 Episode: Echoes",
  "The Final Shape",
  "Into the Light",
  "S23 Season of the Wish",
  "S22 Season of the Witch",
  "S21 Season of the Deep",
  "S20 Season of Defiance",
  "Lightfall",
  "S19 Season of the Seraph",
  "S18 Season of Plunder",
  "S17 Season of the Haunted",
  "S16 Season of the Risen",
  "The Witch Queen",
  "S15 Season of the Lost",
  "S14 Season of the Splicer",
  "S13 Season of the Chosen",
  "S12 Season of the Hunt",
  "Beyond Light",
  "S11 Season of Arrivals",
  "S10 Season of the Worthy",
  "S9 Season of Dawn",
  "S8 Season of the Undying",
  "Shadowkeep",
  "S7 Season of Opulence",
  "S6 Season of the Drifter",
  "S5 Season of the Forge",
  "Forsaken",
  "Warmind",
  "Curse of Osiris",
  "Red War",
];

export const INTO_THE_LIGHT_LABEL = "Into the Light";
export const INTO_THE_LIGHT_WATERMARK =
  "60d34bc853c51063b79592233c3661d4.png";

export const CALL_TO_ARMS_LABEL = "Call to Arms";
export const CALL_TO_ARMS_WATERMARK =
  "6eeb62a30439cecc7699c22f3e1fb3cf.png";

/** Expansion labels keyed by display season number (no S prefix in UI). */
export const EXPANSION_DISPLAY_NUMBER = {
  [MONUMENT_OF_TRIUMPH_LABEL]: 29,
  Renegades: 29,
  "The Edge of Fate": 28,
  "The Final Shape": 23,
  "Into the Light": 23,
  Lightfall: 20,
  "The Witch Queen": 16,
  "Beyond Light": 12,
  Shadowkeep: 8,
  Forsaken: 4,
  Warmind: 3,
  "Curse of Osiris": 2,
  "Red War": 1,
};

const EXPANSION_LABELS = new Set(Object.keys(EXPANSION_DISPLAY_NUMBER));

export function isExpansionLabel(label) {
  return Boolean(label && EXPANSION_LABELS.has(label));
}

/** Watermarks whose majority vote is misleading (shared across legacy eras). */
export const WATERMARK_LABEL_OVERRIDES = {
  "7ba9d804508dd083ec20fcdb8ba0869d.png": "Curse of Osiris",
  "4376a7d734583ae347acf9732aa3bb43.png": "The Edge of Fate",
  "95f7754d52d6016fdc445fb62aa7a31e.png": "Renegades",
  "0ac354c1c326441716ddb15d2c158c59.png": "S26 Episode: Heresy",
};

/** Year-8 featured gear watermark reused across chapters; DIM maps to manifest 28. */
const MONUMENT_FEATURED_WATERMARK = "e78fd9419f99464816ac8f628bc3c4af.png";

/** DIM watermark-to-season mistakes or cross-era reuse. Values are manifest season numbers. */
export const WATERMARK_MANIFEST_SEASON_OVERRIDES = {
  "4376a7d734583ae347acf9732aa3bb43.png": 27,
};

function resolveWatermarkManifestSeason(watermark, watermarkToSeason = {}) {
  const basename = watermarkBasename(watermark);
  if (WATERMARK_MANIFEST_SEASON_OVERRIDES[basename]) {
    return WATERMARK_MANIFEST_SEASON_OVERRIDES[basename];
  }
  return watermarkToSeason[watermark] ?? 0;
}

const EXCLUDED_PRESENTATION_PARENTS = new Set(["Titles", "Badges"]);

function isExcludedPresentationChild(entry, presentationNodes) {
  const parentHash = entry.parentNodeHashes?.[0];
  if (!parentHash) return false;
  const parent = presentationNodes[String(parentHash)];
  return EXCLUDED_PRESENTATION_PARENTS.has(
    parent?.displayProperties?.name ?? "",
  );
}

/** Full square season/expansion icons from manifest (not item watermarks). */
function pickPresentationNodeIcon(name, presentationNodes) {
  const matches = Object.values(presentationNodes ?? {}).filter(
    (entry) =>
      entry.displayProperties?.name === name &&
      entry.displayProperties?.icon &&
      !isExcludedPresentationChild(entry, presentationNodes),
  );
  if (!matches.length) return null;
  if (matches.length === 1) return matches[0].displayProperties.icon;

  return matches
    .sort(
      (a, b) =>
        (b.children?.presentationNodes?.length ?? 0) -
          (a.children?.presentationNodes?.length ?? 0) ||
        (b.hash ?? 0) - (a.hash ?? 0),
    )[0].displayProperties.icon;
}

function isTitlesPresentationChild(entry, presentationNodes) {
  const parentHash = entry.parentNodeHashes?.[0];
  if (!parentHash) return false;
  const parent = presentationNodes[String(parentHash)];
  return parent?.displayProperties?.name === "Titles";
}

function isBadgesPresentationChild(entry, presentationNodes) {
  const parentHash = entry.parentNodeHashes?.[0];
  if (!parentHash) return false;
  const parent = presentationNodes[String(parentHash)];
  return parent?.displayProperties?.name === "Badges";
}

/** Full destination badge art for legacy expansions (not item watermarks). */
const EXPANSION_DESTINATION_BADGE_NAMES = {
  "Red War": ["Destinations: Red War"],
  "Curse of Osiris": ["Destinations: Curse of Osiris and Warmind"],
  Warmind: ["Destinations: Curse of Osiris and Warmind"],
  Forsaken: ["Destinations: Forsaken"],
};

/** Triumph destination hubs for modern expansions (not title seals or item watermarks). */
const EXPANSION_TRIUMPH_DESTINATION_NAMES = {
  "The Final Shape": "The Pale Heart",
  Lightfall: "Neomuna",
  "The Witch Queen": "Throne World",
  "Beyond Light": "Europa",
  Shadowkeep: "The Moon",
};

function pickExpansionDestinationBadgeIcon(expansionLabel, presentationNodes) {
  const preferredNames = EXPANSION_DESTINATION_BADGE_NAMES[expansionLabel];
  if (!preferredNames) return null;

  for (const name of preferredNames) {
    const node = Object.values(presentationNodes ?? {}).find(
      (entry) =>
        entry.displayProperties?.name === name && entry.displayProperties?.icon,
    );
    if (node?.displayProperties?.icon) return node.displayProperties.icon;
  }

  return null;
}

/** Expansion hubs (not title seals under the Titles tree). */
function pickExpansionPresentationNodeIcon(expansionLabel, presentationNodes) {
  const badgeIcon = pickExpansionDestinationBadgeIcon(
    expansionLabel,
    presentationNodes,
  );
  if (badgeIcon) return badgeIcon;

  const triumphDestination = EXPANSION_TRIUMPH_DESTINATION_NAMES[expansionLabel];
  if (triumphDestination) {
    const triumphIcon = pickPresentationNodeIcon(
      triumphDestination,
      presentationNodes,
    );
    if (triumphIcon) return triumphIcon;
  }

  const matches = Object.values(presentationNodes ?? {}).filter(
    (entry) =>
      entry.displayProperties?.name === expansionLabel &&
      entry.displayProperties?.icon &&
      !isTitlesPresentationChild(entry, presentationNodes) &&
      !isBadgesPresentationChild(entry, presentationNodes),
  );
  if (!matches.length) return null;
  if (matches.length === 1) return matches[0].displayProperties.icon;

  return matches
    .sort(
      (a, b) =>
        (b.children?.presentationNodes?.length ?? 0) -
          (a.children?.presentationNodes?.length ?? 0) ||
        (b.hash ?? 0) - (a.hash ?? 0),
    )[0].displayProperties.icon;
}

function buildExpansionWatermarkIconLookup(items, collectibles, seasons) {
  const labelMap = buildWatermarkLabelMap(items, collectibles, seasons);
  const pathsByExpansion = new Map();

  for (const [wmBasename, label] of labelMap) {
    if (!isExpansionLabel(label)) continue;
    const path = `/common/destiny2_content/icons/${wmBasename}`;
    const list = pathsByExpansion.get(label) ?? [];
    list.push(path);
    pathsByExpansion.set(label, list);
  }

  const votes = new Map();
  for (const item of Object.values(items)) {
    if (!item.iconWatermark || !item.collectibleHash) continue;
    const collectible = collectibles[String(item.collectibleHash)];
    const source = collectible?.sourceString ?? "";
    if (!source || isRecurringVersionSource(source)) continue;
    const label = resolveSeasonLabelFromSource(source, seasons);
    if (!label || !isExpansionLabel(label)) continue;
    const perExpansion = votes.get(label) ?? new Map();
    perExpansion.set(
      item.iconWatermark,
      (perExpansion.get(item.iconWatermark) ?? 0) + 1,
    );
    votes.set(label, perExpansion);
  }

  const result = new Map();
  const allExpansionLabels = new Set([
    ...pathsByExpansion.keys(),
    ...votes.keys(),
  ]);

  for (const label of allExpansionLabels) {
    const paths = pathsByExpansion.get(label) ?? [];
    if (paths.length === 1) {
      result.set(label, paths[0]);
      continue;
    }

    const wmCounts = votes.get(label) ?? new Map();
    for (const path of paths) {
      wmCounts.set(path, (wmCounts.get(path) ?? 0) + 1);
    }

    const ranked = [...wmCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked[0]?.[0]) {
      result.set(label, ranked[0][0]);
    }
  }

  return result;
}

export function buildSeasonDisplayIconLookup(
  seasons,
  presentationNodes,
  items,
  collectibles,
) {
  const byLabel = new Map();
  const seasonDefs = Object.values(seasons ?? {});
  const expansionWatermarkIcons = buildExpansionWatermarkIconLookup(
    items,
    collectibles,
    seasons,
  );

  for (const [manifestStr, chapterLabel] of Object.entries(
    MANIFEST_CHAPTER_LABEL,
  )) {
    const manifestNum = Number(manifestStr);
    const def = seasonDefs.find((entry) => entry.seasonNumber === manifestNum);
    const icon = def?.displayProperties?.icon;
    if (icon) byLabel.set(chapterLabel, { path: icon, watermark: false });
  }

  for (const expansionLabel of Object.keys(EXPANSION_DISPLAY_NUMBER)) {
    const nodeIcon = pickExpansionPresentationNodeIcon(
      expansionLabel,
      presentationNodes,
    );
    if (nodeIcon) {
      byLabel.set(expansionLabel, { path: nodeIcon, watermark: false });
      continue;
    }

    const watermarkIcon = expansionWatermarkIcons.get(expansionLabel);
    if (watermarkIcon) {
      byLabel.set(expansionLabel, { path: watermarkIcon, watermark: true });
    }
  }

  // Triumph / episode presentation nodes are more accurate than season-definition
  // icons for some chapters (e.g. Monument of Triumph).
  for (const chapterLabel of Object.values(MANIFEST_CHAPTER_LABEL)) {
    const suffix = chapterLabel.replace(/^S\d+\s+/, "");
    const icon = pickPresentationNodeIcon(suffix, presentationNodes);
    if (icon) {
      byLabel.set(chapterLabel, { path: icon, watermark: false });
    }
  }

  byLabel.set(INTO_THE_LIGHT_LABEL, {
    path:
      pickPresentationNodeIcon(INTO_THE_LIGHT_LABEL, presentationNodes) ??
      `/common/destiny2_content/icons/${INTO_THE_LIGHT_WATERMARK}`,
    watermark: false,
  });

  return byLabel;
}

export function resolveSeasonDisplayIconPath(
  seasonLabel,
  watermarkPath,
  lookup,
) {
  if (!seasonLabel) return watermarkPath || undefined;
  const entry = lookup.get(seasonLabel);
  if (entry) return entry.path;
  return watermarkPath || undefined;
}

export function resolveSeasonDisplayIconWatermark(seasonLabel, lookup) {
  if (!seasonLabel) return true;
  const entry = lookup.get(seasonLabel);
  if (entry) return entry.watermark;
  return true;
}

export function displayNumberFromLabel(label) {
  const match = label.match(/^S(\d+)/);
  if (match) return Number(match[1]);
  return EXPANSION_DISPLAY_NUMBER[label] ?? 0;
}

export function manifestSeasonToDisplayNumber(manifestSeason) {
  if (manifestSeason <= 0) return 0;
  const label = MANIFEST_CHAPTER_LABEL[manifestSeason];
  if (!label) return manifestSeason;
  const match = label.match(/^S(\d+)/);
  return match ? Number(match[1]) : manifestSeason;
}

export function seasonLabelFromManifestNumber(manifestSeason) {
  return (
    MANIFEST_CHAPTER_LABEL[manifestSeason] ?? `S${manifestSeason}`
  );
}

export function seasonLabelFromDisplayNumber(displayNumber) {
  for (const label of CANONICAL_SEASON_ORDER) {
    if (displayNumberFromLabel(label) === displayNumber) return label;
  }
  return `S${displayNumber}`;
}

export const WEAPON_SLOT_ORDER = ["Primary", "Energy", "Heavy"];

export const GEAR_SLOT_ORDER = [
  "Helmet",
  "Gauntlets",
  "Chest Armor",
  "Leg Armor",
  "Class Item",
];

export const ALL_LOOT_TYPE_GROUPS = [
  { types: ["Armor", "Weapon"] },
  {
    label: "Cosmetics",
    types: ["Ship", "Sparrow", "Ghost Shell", "Emblem", "Shader", "Emote"],
  },
  {
    label: "Other",
    types: [
      "Ornament",
      "Ghost Projection",
      "Transmat Effect",
      "Mod",
      "Artifact",
    ],
  },
];

export const TYPE_ORDER = ALL_LOOT_TYPE_GROUPS.flatMap((group) => group.types);

/** Seasonal artifacts from the N most recent manifest seasons count as active. */
export const ACTIVE_ARTIFACT_SEASON_COUNT = 7;

export function buildActiveArtifactSeasonNumbers(
  seasons,
  count = ACTIVE_ARTIFACT_SEASON_COUNT,
) {
  return new Set(
    Object.values(seasons)
      .filter(
        (season) => (season.seasonNumber ?? 0) > 0 && season.artifactItemHash,
      )
      .sort((a, b) => b.seasonNumber - a.seasonNumber)
      .slice(0, count)
      .map((season) => season.seasonNumber),
  );
}

export function artifactManifestSeasonNumber(item, seasons) {
  if (!item?.seasonHash) return 0;
  return seasons[String(item.seasonHash)]?.seasonNumber ?? 0;
}

export function isActiveSeasonalArtifact(item, seasons, activeArtifactSeasons) {
  if (item?.itemType !== 28) return false;
  const seasonNumber = artifactManifestSeasonNumber(item, seasons);
  return seasonNumber > 0 && activeArtifactSeasons.has(seasonNumber);
}

/**
 * Maps quoted activity / source text to the season or expansion when it debuted.
 * Order matters — more specific patterns first.
 */
export const SEASON_SOURCE_PATTERNS = [
  [/monument of triumph/i, MONUMENT_OF_TRIUMPH_LABEL],
  [/renegades|fireteam ops/i, "Renegades"],
  [/equilibrium/i, "Renegades"],
  [/pantheon/i, MONUMENT_OF_TRIUMPH_LABEL],
  [/sundered doctrine/i, "S26 Episode: Heresy"],
  [/vesper'?s host/i, "S26 Episode: Heresy"],
  [/kepler|exploring kepler/i, "The Edge of Fate"],
  [/season:\s*reclamation|\breclamation\b/i, "The Edge of Fate"],
  [/the edge of fate activities|edge of fate campaign/i, "The Edge of Fate"],
  [/desert perpetual|\bthe edge of fate\b/i, "The Edge of Fate"],
  [/episode:\s*heresy|\bheresy\b/i, "S26 Episode: Heresy"],
  [/episode:\s*revenant|\brevenant\b/i, "S25 Episode: Revenant"],
  [/episode:\s*echoes|\bechoes\b/i, "S24 Episode: Echoes"],
  [/salvation'?s edge/i, "The Final Shape"],
  [/pale heart|exploring the pale heart/i, "The Final Shape"],
  [/wild card exotic/i, "The Final Shape"],
  [/dual destiny/i, "The Final Shape"],
  [/the final shape/i, "The Final Shape"],
  [/"warlord'?s ruin"/i, "S23 Season of the Wish"],
  [/warlord'?s ruin/i, "S23 Season of the Wish"],
  [/"vow of the disciple"/i, "The Witch Queen"],
  [/"root of nightmares"/i, "Lightfall"],
  [/"deep stone crypt"/i, "Beyond Light"],
  [/"garden of salvation"/i, "Shadowkeep"],
  [/"pit of heresy"/i, "Shadowkeep"],
  [/"last wish"/i, "Forsaken"],
  [/"scourge of the past"/i, "Forsaken"],
  [/"crown of sorrow"/i, "S7 Season of Opulence"],
  [/"leviathan"/i, "Red War"],
  [/season of the wish/i, "S23 Season of the Wish"],
  [/season of the witch|\bwitch\b.*(?:season|raid)/i, "S22 Season of the Witch"],
  [/crotas? end/i, "S22 Season of the Witch"],
  [/season of the deep|\bdeep\b.*(?:dungeon|season)/i, "S21 Season of the Deep"],
  [/ghosts of the deep/i, "S21 Season of the Deep"],
  [/season of defiance|\bdefiance\b/i, "S20 Season of Defiance"],
  [/lightfall|root of nightmares|heist battlegrounds/i, "Lightfall"],
  [/season of the seraph|\bseraph\b/i, "S19 Season of the Seraph"],
  [/spire of the watcher/i, "S19 Season of the Seraph"],
  [/season of plunder|\bplunder\b/i, "S18 Season of Plunder"],
  [/king'?s fall/i, "S18 Season of Plunder"],
  [/ketchcrash|dredgen/i, "S18 Season of Plunder"],
  [/season of the haunted|\bhaunted\b/i, "S17 Season of the Haunted"],
  [/duality/i, "S17 Season of the Haunted"],
  [/season of the risen|\brisen\b/i, "S16 Season of the Risen"],
  [
    /witch queen|throne world|vow of the disciple|wellspring/i,
    "The Witch Queen",
  ],
  [/season of the lost|\blost\b.*(?:season|sector)/i, "S15 Season of the Lost"],
  [/grasp of avarice/i, "S15 Season of the Lost"],
  [/season of the splicer|\bsplicer\b/i, "S14 Season of the Splicer"],
  [/vault of glass/i, "S14 Season of the Splicer"],
  [/override/i, "S14 Season of the Splicer"],
  [/season of the chosen|\bchosen\b/i, "S13 Season of the Chosen"],
  [/battlegrounds/i, "S13 Season of the Chosen"],
  [/season of the hunt|\bhunt\b.*(?:season|wrathborn)/i, "S12 Season of the Hunt"],
  [/deep stone crypt|\beuropa\b|\bbeyond light\b/i, "Beyond Light"],
  [/season of arrivals|\barrivals\b/i, "S11 Season of Arrivals"],
  [/prophecy/i, "S11 Season of Arrivals"],
  [/season of the worthy|\bworthy\b/i, "S10 Season of the Worthy"],
  [/season of dawn|\bdawn\b/i, "S9 Season of Dawn"],
  [/sundial/i, "S9 Season of Dawn"],
  [/season of the undying|\bundying\b/i, "S8 Season of the Undying"],
  [
    /exploring the moon|shadowkeep|\bmoon\b.*(?:dungeon|raid|pit|activity)|garden of salvation|pit of heresy|nightmare hunt|nightmare\b/i,
    "Shadowkeep",
  ],
  [/eater of worlds/i, "Curse of Osiris"],
  [/leviathan raid/i, "Red War"],
  [/zero hour|outbreak perfected/i, "S9 Season of Dawn"],
  [/presage|dead man's tale/i, "S13 Season of the Chosen"],
  [/harbinger|hawkmoon/i, "S12 Season of the Hunt"],
  [/exotic mission rotation|exotic missions/i, "S16 Season of the Risen"],
  [/xûr's treasure hoard|star horse/i, "S15 Season of the Lost"],
  [/season of opulence|\bopulence\b|\bmenagerie\b|\bcrown of sorrow/i, "S7 Season of Opulence"],
  [/season of the drifter|\bdrifter\b|\bgambit prime|\breckoning\b/i, "S6 Season of the Drifter"],
  [/season of the forge|\bforge\b|\bblack armory|\bscourge of the past/i, "S5 Season of the Forge"],
  [
    /forsaken|\blast wish|\bshattered throne|\bdreaming city|\btangled shore|\breef\b/i,
    "Forsaken",
  ],
  [/warmind|\bescalation protocol|\bspire of stars|\bmars\b/i, "Warmind"],
  [
    /curse of osiris|\beater of worlds|lost prophecies|\bbrother vance|rank-up packages on mercury|activities.*\bon mercury\b/i,
    "Curse of Osiris",
  ],
  [/red war|\bedz\b|\bhomecoming|\bcalistoga|\btitan\b|\bio\b|\bn Nessus|\beuropean/i, "Red War"],
  [/destiny 2\b|\bnew light\b|\bintroductory\b/i, "Red War"],
  [/solstice 2024|solstice 2025/i, MONUMENT_OF_TRIUMPH_LABEL],
  [/solstice 2023/i, "S23 Season of the Wish"],
  [/solstice 2022/i, "S17 Season of the Haunted"],
  [/solstice 2021/i, "S15 Season of the Lost"],
  [/solstice 2020/i, "Beyond Light"],
  [/solstice 2019/i, "Shadowkeep"],
  [/solstice 2018/i, "Forsaken"],
  [/festival of the lost 2024|festival of the lost 2025/i, MONUMENT_OF_TRIUMPH_LABEL],
  [/festival of the lost 2023/i, "S23 Season of the Wish"],
  [/festival of the lost 2022/i, "S18 Season of Plunder"],
  [/festival of the lost 2021/i, "S15 Season of the Lost"],
  [/festival of the lost 2020/i, "S12 Season of the Hunt"],
  [/festival of the lost 2018/i, "Forsaken"],
  [/the dawning 2024|the dawning 2025/i, MONUMENT_OF_TRIUMPH_LABEL],
  [/guardian games 2024|guardian games 2025/i, MONUMENT_OF_TRIUMPH_LABEL],
];

/** Expansion-only sources for the expansion filter (stricter than season patterns). */
export const EXPANSION_SOURCE_PATTERNS = [
  [/salvation'?s edge/i, "The Final Shape"],
  [/pale heart|exploring the pale heart/i, "The Final Shape"],
  [/wild card exotic/i, "The Final Shape"],
  [/dual destiny/i, "The Final Shape"],
  [/the final shape/i, "The Final Shape"],
  [/"vow of the disciple"/i, "The Witch Queen"],
  [/witch queen|throne world|wellspring/i, "The Witch Queen"],
  [/"root of nightmares"/i, "Lightfall"],
  [/lightfall|heist battlegrounds/i, "Lightfall"],
  [/"deep stone crypt"/i, "Beyond Light"],
  [/"garden of salvation"/i, "Shadowkeep"],
  [/"pit of heresy"/i, "Shadowkeep"],
  [/"last wish"/i, "Forsaken"],
  [
    /exploring the moon|shadowkeep|\bmoon\b.*(?:dungeon|raid|pit|activity)|garden of salvation|pit of heresy|nightmare hunt|nightmare\b/i,
    "Shadowkeep",
  ],
  [/deep stone crypt|\beuropa\b|\bbeyond light\b/i, "Beyond Light"],
  [
    /forsaken|\blast wish|\bshattered throne|\bdreaming city|\btangled shore|\breef\b/i,
    "Forsaken",
  ],
  [/the edge of fate activities|edge of fate campaign/i, "The Edge of Fate"],
  [
    /edge of fate|desert perpetual|equilibrium|vesper'?s host|sundered doctrine|pantheon/i,
    "The Edge of Fate",
  ],
  [/renegades|fireteam ops/i, "Renegades"],
  [/kepler|exploring kepler/i, "Renegades"],
  [/warmind|\bescalation protocol|\bspire of stars|\bmars\b/i, "Warmind"],
  [
    /curse of osiris|\beater of worlds|lost prophecies|\bbrother vance|rank-up packages on mercury|activities.*\bon mercury\b/i,
    "Curse of Osiris",
  ],
  [
    /red war|\bedz\b|\bhomecoming|\bleviathan raid|\bcalistoga|\btitan\b|\bio\b|\bn Nessus|\beuropean/i,
    "Red War",
  ],
  [/destiny 2\b|\bnew light\b|\bintroductory\b/i, "Red War"],
];

export function resolveExpansionLabelFromSource(source = "") {
  for (const [pattern, label] of EXPANSION_SOURCE_PATTERNS) {
    if (pattern.test(source)) return label;
  }
  return null;
}

/** Salvation's Edge raid armor sets share a reissue wave even when some hashes keep a stale watermark. */
export const SALVATIONS_EDGE_ARMOR_NAME_PATTERN =
  /^Promised (Reign|Reunion|Victory) /;

export function buildSalvationsEdgeS29ReissueMinIndex(
  items,
  dimSeasonData = {},
) {
  let minIndex = Infinity;

  for (const item of Object.values(items)) {
    const name = item.displayProperties?.name ?? "";
    if (!SALVATIONS_EDGE_ARMOR_NAME_PATTERN.test(name)) continue;

    const season = resolveWatermarkSeasonNumber(item, dimSeasonData);
    if (season >= 28) {
      minIndex = Math.min(minIndex, item.index ?? Infinity);
    }
  }

  return Number.isFinite(minIndex) ? minIndex : null;
}

export function applySalvationsEdgeReissueLabel(
  item,
  label,
  minReissueIndex,
) {
  if (minReissueIndex === null || !label) return label;

  const name = item.displayProperties?.name ?? "";
  if (!SALVATIONS_EDGE_ARMOR_NAME_PATTERN.test(name)) return label;
  if ((item.index ?? 0) < minReissueIndex) return label;

  if (label === "The Final Shape" || label === "S24 Episode: Echoes") {
    return MONUMENT_OF_TRIUMPH_LABEL;
  }

  return label;
}

/** MoT label only applies with the MoT featured watermark — not every post-Heresy hash. */
export function stripIncorrectMonumentLabel(
  item,
  label,
  source = "",
) {
  if (label !== MONUMENT_OF_TRIUMPH_LABEL) return label;
  if (watermarkBasename(item.iconWatermark) === MONUMENT_FEATURED_WATERMARK) {
    return label;
  }

  const fromSource = resolveSeasonLabelFromSource(source, {});
  return fromSource ?? label;
}

/** Sources tied to the current live season — resolved from manifest at build time. */
export const LATEST_SEASON_SOURCE_PATTERNS = [];

/**
 * Limited-time event labels from collectible sources. Used for weapon-page version
 * badges so event loot shows the event emblem/name (matching the search icon overlay).
 */
export const EVENT_SOURCE_PATTERNS = [
  [
    /30th anniversary|treasure hoard in eternity|xûr's treasure hoard|xûr \(eternity\)/i,
    "30th Anniversary",
  ],
  [/call to arms(?:\s+event)?/i, CALL_TO_ARMS_LABEL],
  [/moments of triumph(?:\s+\d{4})?/i, "Moments of Triumph"],
  [/festival of the lost(?:\s+\d{4})?/i, "Festival of the Lost"],
  [/the dawning(?:\s+\d{4})?/i, "The Dawning"],
  [/solstice(?:\s+\d{4})?/i, "Solstice"],
  [/crimson days/i, "Crimson Days"],
  [/guardian games(?:\s+\d{4})?/i, "Guardian Games"],
  [/the revelry|seasonal revelry(?:\s+event)?/i, "The Revelry"],
];

export function resolveIntoTheLightSeasonLabel(item, label, source = "") {
  if (label !== "S23 Season of the Wish") return label;
  if (/into the light/i.test(source)) return INTO_THE_LIGHT_LABEL;
  if (watermarkBasename(item.iconWatermark) === INTO_THE_LIGHT_WATERMARK) {
    return INTO_THE_LIGHT_LABEL;
  }
  return label;
}

/** Item watermarks that always denote a specific event (not a season chapter). */
export const WATERMARK_EVENT_LABELS = {
  "bcc26708e314306fb2fc8cb98fcbf47e.png": "30th Anniversary",
  [CALL_TO_ARMS_WATERMARK]: CALL_TO_ARMS_LABEL,
};

export function resolveEventLabel(
  source = "",
  seasonIconPath = "",
  seasonLabel = "",
) {
  for (const [pattern, label] of EVENT_SOURCE_PATTERNS) {
    if (pattern.test(source)) return label;
  }

  const watermark = seasonIconPath.split("/").pop() ?? "";
  return WATERMARK_EVENT_LABELS[watermark] ?? null;
}

/** Event names used for weapon version badges — not season/expansion filters. */
export const KNOWN_EVENT_LABELS = new Set([
  ...EVENT_SOURCE_PATTERNS.map(([, label]) => label),
  ...Object.values(WATERMARK_EVENT_LABELS),
]);

export function isEventLabel(label) {
  return Boolean(label && KNOWN_EVENT_LABELS.has(label));
}

/**
 * When several manifest hashes are functionally identical, keep the base release
 * over an event reissue (same stats/perks, different watermark).
 */
export function weaponPerkFingerprint(perkColumns) {
  if (!perkColumns?.length) return null;
  return perkColumns
    .map((column) =>
      column.plugHashes
        .slice()
        .sort((a, b) => Number(a) - Number(b))
        .join(","),
    )
    .join("|");
}

export function weaponStatsFingerprint(stats) {
  if (!stats?.length) return null;
  return stats.map((stat) => `${stat.name}:${stat.value}`).join("|");
}

export function catalogVersionsEquivalent(current, candidate, context = {}) {
  if (!current || !candidate) return false;
  if (current.seasonLabel !== candidate.seasonLabel) return false;

  const perkColumnsForHash = context.perkColumnsForHash;
  const statsForHash = context.statsForHash;
  const fallbackPerks = context.fallbackPerkColumns;
  const fallbackStats = context.fallbackStats;

  const currentPerks =
    current.perkColumns ??
    perkColumnsForHash?.(current.itemHash) ??
    fallbackPerks;
  const candidatePerks =
    candidate.perkColumns ??
    perkColumnsForHash?.(candidate.itemHash) ??
    fallbackPerks;
  const currentStats =
    current.stats ?? statsForHash?.(current.itemHash) ?? fallbackStats;
  const candidateStats =
    candidate.stats ?? statsForHash?.(candidate.itemHash) ?? fallbackStats;

  const perkFpCurrent = weaponPerkFingerprint(currentPerks);
  const perkFpCandidate = weaponPerkFingerprint(candidatePerks);
  if (perkFpCurrent && perkFpCandidate && perkFpCurrent !== perkFpCandidate) {
    return false;
  }

  const statsFpCurrent = weaponStatsFingerprint(currentStats);
  const statsFpCandidate = weaponStatsFingerprint(candidateStats);
  if (statsFpCurrent && statsFpCandidate && statsFpCurrent !== statsFpCandidate) {
    return false;
  }

  if (perkFpCurrent && perkFpCandidate) {
    return true;
  }

  // Armor reissues share a season label but have no weapon perk columns.
  if (!perkFpCurrent && !perkFpCandidate) {
    return true;
  }

  return false;
}

export function preferCatalogVersion(current, candidate) {
  if (!candidate) return current;
  if (!current) return candidate;

  if (current.seasonLabel !== candidate.seasonLabel) {
    return current.seasonNumber > candidate.seasonNumber ? current : candidate;
  }

  if (current.eventLabel && !candidate.eventLabel) return candidate;
  if (!current.eventLabel && candidate.eventLabel) return current;

  const eventWatermarks = new Set(Object.keys(WATERMARK_EVENT_LABELS));
  const currentWm = current.seasonIconPath?.split("/").pop() ?? "";
  const candidateWm = candidate.seasonIconPath?.split("/").pop() ?? "";
  if (eventWatermarks.has(currentWm) && !eventWatermarks.has(candidateWm)) {
    return candidate;
  }
  if (!eventWatermarks.has(currentWm) && eventWatermarks.has(candidateWm)) {
    return current;
  }

  const currentIndex = current._manifestIndex ?? Number(current.itemHash) ?? 0;
  const candidateIndex = candidate._manifestIndex ?? Number(candidate.itemHash) ?? 0;
  return candidateIndex > currentIndex ? candidate : current;
}

/** Sources where the item can no longer be acquired in-game today. */
export const UNOBTAINABLE_SOURCE_PATTERNS = [
  /\bcannot be reacquired\b/i,
  /\bmercury\b/i,
  /\brank-up packages on io\b/i,
  /\brank-up packages on mars\b/i,
  /\brank-up packages on titan\b/i,
  /\brank-up packages on mercury\b/i,
  /\bzero hour\b/i,
  /\btrials of the nine\b/i,
  /\brite of the nine\b/i,
  /\bfaction rally\b/i,
  /\bprismatic matrix\b/i,
  /\bsundial\b/i,
  /\bscourge of the past\b/i,
  /\bmenagerie\b/i,
  /\breckoning\b/i,
  /\bgambit prime\b/i,
  /\bseason of the undying\b/i,
  /\bseason of dawn\b/i,
  /\bseason of the worthy\b/i,
  /\bseason of arrivals\b/i,
  /\bsolstice 2018\b/i,
  /\bfestival of the lost 2018\b/i,
  /\bdawning 2018\b/i,
  /\bcrimson days\b/i,
  /\bmoments of triumph 2019\b/i,
  /\bmoments of triumph 2020\b/i,
  /\bguardian games 2020\b/i,
  /\bassociated crucible quest\b/i,
  /\bassociated gambit quest\b/i,
  /\bassociated vanguard quest\b/i,
  /\bassociated iron banner quest\b/i,
  /\bopen legendary engrams and earn faction rank-up packages\b/i,
  /\bearned while leveling\b/i,
  /\bunlocked by a special offer\b/i,
  /\bdismantle an item with this shader applied\b/i,
  /\b\[redacted\]/i,
  /\bpreorder exclusive\b/i,
  /\btimed exclusive\b/i,
  /\bdeprecated\b/i,
  /\bvaulted destination\b/i,
  /\bcannot be obtained\b/i,
  /\bno longer available\b/i,
  /\bno longer obtainable\b/i,
  /\bwas only available\b/i,
];

export const FINISHER_ITEM_CATEGORY_HASH = 1112488720;
export const EMOTE_ITEM_CATEGORY_HASH = 44;

/** Debut season for exotics re-listed in the Tower Exotic Archive (source is not era-specific). */
export const EXOTIC_ARCHIVE_DEBUT_BY_NAME = {
  "witherhoard": "S11 Season of Arrivals",
  "traveler's chosen": "S11 Season of Arrivals",
  "ruinous effigy": "S11 Season of Arrivals",
  "duality": "S17 Season of the Haunted",
  "ticuu's divination": "S14 Season of the Splicer",
  "cryosthesia 77k": "S14 Season of the Splicer",
  "lorentz driver": "S14 Season of the Splicer",
  "ager's scepter": "S15 Season of the Lost",
  "delicate tomb": "S15 Season of the Lost",
  "sturm": "Red War",
  "legend of acrius": "Red War",
  "rat king": "Red War",
  "mida multi-tool": "Red War",
  "polaris lance": "Warmind",
  "worldline zero": "Warmind",
  "sleeper simulant": "Warmind",
  "whisper of the worm": "Warmind",
  "ace of spades": "Forsaken",
  "le monarque": "S5 Season of the Forge",
  "anarchy": "Forsaken",
  "jotunn": "S5 Season of the Forge",
  "izanagi's burden": "S5 Season of the Forge",
  "the last word": "S6 Season of the Drifter",
  "thorn": "S6 Season of the Drifter",
  "outbreak perfected": "S9 Season of Dawn",
  "lumina": "S6 Season of the Drifter",
  "tarrabah": "S7 Season of Opulence",
  "bad juju": "S7 Season of Opulence",
  "truth": "S8 Season of the Undying",
  "leviathan's breath": "S8 Season of the Undying",
  "eriana's vow": "S8 Season of the Undying",
  "bastion": "S9 Season of Dawn",
  "symmetry": "S12 Season of the Hunt",
  "devil's ruin": "S9 Season of Dawn",
  "tommy's matchbook": "S13 Season of the Chosen",
  "the fourth horseman": "S10 Season of the Worthy",
};

export function normalizeItemName(name = "") {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function catalogGroupKey(name, type) {
  const normalizedName = normalizeItemName(name);
  if (!normalizedName || !type) return "";
  return `${normalizedName}::${type}`;
}

export function debutCatalogGroupKey(name, type) {
  const normalizedName = debutBaseNameKey(name);
  if (!normalizedName || !type) return "";
  return `${normalizedName}::${type}`;
}

function debutCatalogGroupKeyFromGroupKey(groupKey) {
  const sep = groupKey.lastIndexOf("::");
  if (sep < 0) return debutBaseNameKey(groupKey);
  return `${debutBaseNameKey(groupKey.slice(0, sep))}::${groupKey.slice(sep + 2)}`;
}

/** Strip adept suffix so debut season is shared across normal and adept variants. */
export function debutBaseNameKey(name = "") {
  return normalizeItemName(name).replace(/\s*\(adept\)\s*$/, "");
}

export function isDebutRelevantVariant(item, group) {
  if (!item?.hash) return false;
  if (item.itemType === 0) return false;
  if (item.itemType === 20) return false;

  const hasWeapon = group.some((variant) => variant.itemType === 3);
  if (hasWeapon && item.itemType === 19) return false;

  return true;
}

/** Reissues in the same manifest batch can share a newer watermark than a stale sibling. */
export const WATERMARK_COHORT_INDEX_WINDOW = 300;

export function resolveWatermarkSeasonNumber(
  item,
  dimSeasonData = {},
) {
  const { dimSeasons = {}, watermarkToSeason = {} } = dimSeasonData;
  const hashSeason = dimSeasons[String(item.hash)] ?? 0;
  let watermarkSeason = 0;

  for (const watermark of [
    item.iconWatermark,
    item.iconWatermarkShelved,
    item.iconWatermarkFeatured,
  ]) {
    if (!watermark) continue;
    watermarkSeason = Math.max(
      watermarkSeason,
      resolveWatermarkManifestSeason(watermark, watermarkToSeason),
    );
  }

  return Math.max(hashSeason, watermarkSeason);
}

export function resolveCohortWatermarkSeasonNumber(
  item,
  peerItems = [],
  dimSeasonData = {},
  window = WATERMARK_COHORT_INDEX_WINDOW,
) {
  const index = item.index ?? 0;
  let maxSeason = resolveWatermarkSeasonNumber(item, dimSeasonData);

  for (const peer of peerItems) {
    if (peer === item) continue;
    const peerIndex = peer.index ?? 0;
    if (Math.abs(peerIndex - index) > window) continue;
    maxSeason = Math.max(
      maxSeason,
      resolveWatermarkSeasonNumber(peer, dimSeasonData),
    );
  }

  return maxSeason;
}

export function resolveIndexCohortWatermarkSeason(
  item,
  indexCohortAnchors = [],
  dimSeasonData = {},
  window = WATERMARK_COHORT_INDEX_WINDOW,
) {
  const index = item.index ?? 0;
  const ownSeason = resolveWatermarkSeasonNumber(item, dimSeasonData);
  const lo = index - window;
  const hi = index + window;
  const seasonRanges = new Map();

  for (const anchor of indexCohortAnchors) {
    if (anchor.index < lo || anchor.index > hi) continue;

    const range = seasonRanges.get(anchor.season) ?? {
      min: Infinity,
      max: -Infinity,
    };
    range.min = Math.min(range.min, anchor.index);
    range.max = Math.max(range.max, anchor.index);
    seasonRanges.set(anchor.season, range);
  }

  let cohortSeason = 0;
  for (const [season, range] of seasonRanges) {
    if (season <= ownSeason) continue;
    if (index >= range.min - 50 && index <= range.max + 50) {
      cohortSeason = Math.max(cohortSeason, season);
    }
  }

  return cohortSeason;
}

export function resolveItemManifestSeasonNumber(
  item,
  peerItems = [],
  dimSeasonData = {},
  indexCohortAnchors = [],
) {
  const ownSeason = resolveCohortWatermarkSeasonNumber(item, peerItems, dimSeasonData);
  const cohortSeason = resolveIndexCohortWatermarkSeason(
    item,
    indexCohortAnchors,
    dimSeasonData,
  );

  return Math.max(ownSeason, cohortSeason);
}

export function resolveSeasonIconWatermark(
  item,
  dimSeasonData = {},
) {
  const { watermarkToSeason = {} } = dimSeasonData;
  let bestPath;
  let bestSeason = 0;

  for (const watermark of [
    item.iconWatermark,
    item.iconWatermarkShelved,
    item.iconWatermarkFeatured,
  ]) {
    if (!watermark) continue;
    const season = watermarkToSeason[watermark] ?? 0;
    if (season >= bestSeason) {
      bestSeason = season;
      bestPath = watermark;
    }
  }

  return bestPath;
}

export function resolveBestSeasonIconPath(
  item,
  dimSeasonData = {},
  indexCohortAnchors = [],
  window = WATERMARK_COHORT_INDEX_WINDOW,
) {
  let bestPath = resolveSeasonIconWatermark(item, dimSeasonData);
  let bestSeason = 0;
  const { watermarkToSeason = {} } = dimSeasonData;

  if (bestPath) {
    bestSeason = watermarkToSeason[bestPath] ?? 0;
  }

  if (!indexCohortAnchors.length) {
    return bestPath;
  }

  const cohortSeason = resolveIndexCohortWatermarkSeason(
    item,
    indexCohortAnchors,
    dimSeasonData,
    window,
  );
  if (cohortSeason <= bestSeason) {
    return bestPath;
  }

  const index = item.index ?? 0;
  const lo = index - window;
  const hi = index + window;

  for (const anchor of indexCohortAnchors) {
    if (anchor.index < lo || anchor.index > hi) continue;
    if (anchor.season !== cohortSeason || !anchor.watermark) continue;
    return anchor.watermark;
  }

  return bestPath;
}

export function buildWatermarkIndexAnchors(items, dimSeasonData = {}) {
  const anchors = [];

  for (const item of Object.values(items)) {
    const watermark = resolveSeasonIconWatermark(item, dimSeasonData);
    const season = watermark
      ? resolveWatermarkManifestSeason(
          watermark,
          dimSeasonData.watermarkToSeason ?? {},
        )
      : 0;
    if (!season) continue;
    anchors.push({ index: item.index ?? 0, season, watermark });
  }

  anchors.sort((a, b) => a.index - b.index);
  return anchors;
}

export function resolveDimManifestSeasonNumber(
  item,
  dimSeasons = {},
  watermarkToSeason = {},
) {
  return resolveWatermarkSeasonNumber(item, { dimSeasons, watermarkToSeason });
}

export function buildManifestItemsByGroupKey(items, getGroupKey) {
  const itemsByName = new Map();
  for (const item of Object.values(items)) {
    const key = getGroupKey(item);
    if (!key) continue;
    if (!itemsByName.has(key)) itemsByName.set(key, []);
    itemsByName.get(key).push(item);
  }
  return itemsByName;
}

export function buildManifestItemsByName(items) {
  return buildManifestItemsByGroupKey(items, (item) =>
    normalizeItemName(item.displayProperties?.name),
  );
}

export function currentSeasonNumber() {
  const match = CANONICAL_SEASON_ORDER[0]?.match(/^S(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function orderFacetValues(values, preferredOrder) {
  const set = new Set(values);
  const ordered = preferredOrder.filter((value) => set.has(value));
  for (const value of [...set].sort((a, b) => a.localeCompare(b))) {
    if (!ordered.includes(value)) ordered.push(value);
  }
  return ordered;
}

export function getLatestSeasonFromManifest(seasons = {}) {
  const latest = Object.values(seasons)
    .filter((season) => (season.seasonNumber ?? 0) > 0)
    .sort((a, b) => b.seasonNumber - a.seasonNumber)[0];

  if (!latest) {
    return { label: seasonLabelFromDisplayNumber(1), number: 1 };
  }

  const number = manifestSeasonToDisplayNumber(latest.seasonNumber);
  return {
    label: seasonLabelFromManifestNumber(latest.seasonNumber),
    number,
  };
}

export function seasonLabelFromNumber(seasonNumber) {
  for (const label of CANONICAL_SEASON_ORDER) {
    if (displayNumberFromLabel(label) === seasonNumber) return label;
  }
  return `S${seasonNumber}`;
}

export function formatSeasonLabel(seasonNumber, seasons = {}) {
  const canonical = seasonLabelFromDisplayNumber(seasonNumber);
  if (canonical !== `S${seasonNumber}`) return canonical;

  const season = Object.values(seasons).find(
    (entry) => manifestSeasonToDisplayNumber(entry.seasonNumber) === seasonNumber,
  );
  if (season) {
    return seasonLabelFromManifestNumber(season.seasonNumber);
  }
  return `S${seasonNumber}`;
}

export function buildSeasonPassItemSeasonMap(seasons, seasonPasses, progressions) {
  const map = new Map();

  for (const season of Object.values(seasons)) {
    if (!season.seasonNumber) continue;

    for (const entry of season.seasonPassList ?? []) {
      const pass = seasonPasses[String(entry.seasonPassHash)];
      if (!pass?.rewardProgressionHash) continue;

      const progression = progressions[String(pass.rewardProgressionHash)];
      for (const reward of progression?.rewardItems ?? []) {
        if (reward.itemHash) {
          map.set(String(reward.itemHash), season.seasonNumber);
        }
      }
    }
  }

  return map;
}

export function resolveVariantSeasonLabel(
  item,
  collectible,
  seasons,
  seasonPassItemSeason,
) {
  const source = collectible?.sourceString ?? "";
  const fromSource = resolveSeasonLabelFromSource(source, seasons);
  if (fromSource) return fromSource;

  const normalizedName = normalizeItemName(item.displayProperties?.name);
  if (/exotic archive/i.test(source) && normalizedName) {
    const debut = EXOTIC_ARCHIVE_DEBUT_BY_NAME[normalizedName];
    if (debut) return debut;
  }

  const manifestSeason = seasonPassItemSeason?.get(String(item.hash));
  if (manifestSeason) {
    return seasonLabelFromManifestNumber(manifestSeason);
  }

  const seasonHash = item.seasonHash ?? collectible?.seasonHash ?? null;
  if (seasonHash) {
    const season = seasons[String(seasonHash)];
    if (season?.seasonNumber) {
      return seasonLabelFromManifestNumber(season.seasonNumber);
    }
  }

  return null;
}

export function resolveDebutSeasonLabelForGroup(
  group,
  collectibles,
  seasons,
  seasonPassItemSeason,
  seasonIndexAnchors,
  dimSeasonData = {},
) {
  const { dimSeasons = {}, watermarkToSeason = {} } = dimSeasonData;
  const relevant = [...group]
    .filter((item) => isDebutRelevantVariant(item, group))
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  if (!relevant.length) return null;

  for (const item of relevant) {
    if (!item.collectibleHash) continue;
    const collectible = collectibles[String(item.collectibleHash)];
    if (!collectible) continue;
    const label = resolveVariantSeasonLabel(
      item,
      collectible,
      seasons,
      seasonPassItemSeason,
    );
    if (label) return label;
  }

  let earliestDimSeason = Infinity;
  for (const item of relevant) {
    const manifestSeason = resolveDimManifestSeasonNumber(
      item,
      dimSeasons,
      watermarkToSeason,
    );
    if (manifestSeason > 0 && manifestSeason < earliestDimSeason) {
      earliestDimSeason = manifestSeason;
    }
  }
  if (Number.isFinite(earliestDimSeason) && earliestDimSeason < Infinity) {
    return seasonLabelFromManifestNumber(earliestDimSeason);
  }

  const minIndex = Math.min(...relevant.map((variant) => variant.index ?? Infinity));
  if (Number.isFinite(minIndex) && seasonIndexAnchors?.length) {
    return inferSeasonLabelFromIndex(minIndex, seasonIndexAnchors);
  }

  return null;
}

export function buildMergedDebutGroups(itemsByName) {
  const merged = new Map();

  for (const [groupKey, group] of itemsByName) {
    const baseKey = debutCatalogGroupKeyFromGroupKey(groupKey);
    if (!merged.has(baseKey)) merged.set(baseKey, new Map());
    const byHash = merged.get(baseKey);
    for (const item of group) {
      byHash.set(String(item.hash), item);
    }
  }

  return merged;
}

export function buildSeasonIndexAnchors(
  items,
  collectibles,
  seasons,
  seasonPassItemSeason,
  itemsByName = null,
  debutSeasonByName = null,
  dimSeasonData = {},
  { itemGroupKeyFn = null } = {},
) {
  const byName = itemsByName ?? buildManifestItemsByName(items);
  const anchors = [];

  for (const item of Object.values(items)) {
    if (!item?.collectibleHash) continue;
    const collectible = collectibles[String(item.collectibleHash)];
    if (!collectible) continue;

    const label = resolveVariantSeasonLabel(
      item,
      collectible,
      seasons,
      seasonPassItemSeason,
    );
    if (!label) continue;

    anchors.push({
      index: item.index ?? 0,
      seasonLabel: label,
    });
  }

  const debutMap = debutSeasonByName ?? new Map();
  if (!debutSeasonByName) {
    const mergedGroups = buildMergedDebutGroups(byName);
    for (const [baseKey, byHash] of mergedGroups) {
      const label = resolveDebutSeasonLabelForGroup(
        [...byHash.values()],
        collectibles,
        seasons,
        seasonPassItemSeason,
        anchors,
        dimSeasonData,
      );
      if (!label) continue;
      for (const nameKey of byName.keys()) {
        if (debutCatalogGroupKeyFromGroupKey(nameKey) === baseKey) {
          debutMap.set(nameKey, label);
        }
      }
    }
  }

  for (const item of Object.values(items)) {
    const nameKey = itemGroupKeyFn
      ? itemGroupKeyFn(item)
      : normalizeItemName(item.displayProperties?.name);
    if (!nameKey) continue;
    const label = debutMap.get(nameKey);
    if (!label) continue;

    anchors.push({
      index: item.index ?? 0,
      seasonLabel: label,
    });
  }

  return anchors;
}

export function buildDebutSeasonByName(
  itemsByName,
  collectibles,
  seasons,
  seasonPassItemSeason,
  seasonIndexAnchors,
  dimSeasonData = {},
) {
  const debutSeasonByName = new Map();
  const mergedGroups = buildMergedDebutGroups(itemsByName);

  for (const [baseKey, byHash] of mergedGroups) {
    const label = resolveDebutSeasonLabelForGroup(
      [...byHash.values()],
      collectibles,
      seasons,
      seasonPassItemSeason,
      seasonIndexAnchors,
      dimSeasonData,
    );
    if (!label) continue;

    for (const nameKey of itemsByName.keys()) {
      if (debutCatalogGroupKeyFromGroupKey(nameKey) === baseKey) {
        debutSeasonByName.set(nameKey, label);
      }
    }
  }

  return debutSeasonByName;
}

/**
 * Generic reissue sources where the watermark/hash reflects the version season
 * more accurately than the collectible source text.
 */
export const RECURRING_VERSION_SOURCE_PATTERNS = [
  /^the drifter$/i,
  /^source:\s*the drifter$/i,
  /^source:\s*eververse$/i,
  /^source:\s*x[uû]r$/i,
  /^source:\s*bright engrams$/i,
  /^source:\s*season pass reward$/i,
  /^source:\s*rewards pass$/i,
  /trials of osiris challenges/i,
  /trials of osiris wins/i,
  /flawless chest in trials of osiris/i,
  /open legendary engrams and earn faction rank-up packages/i,
  /random perks:\s*this item cannot be reacquired/i,
  /complete iron banner matches/i,
  /complete strikes and earn rank-up packages/i,
  /complete crucible matches and earn rank-up packages/i,
  /earn rank-up packages from/i,
  /exotic archive at the tower/i,
  /exploring the moon/i,
  /^the moon$/i,
  /^source:\s*unlocked by a special offer\.?$/i,
];

export function isRecurringVersionSource(source = "") {
  const text = source.trim();
  if (!text) return true;

  if (
    /complete the\s+["']|associated .{0,48} quest|quest from|quest line|presage|zero hour|nightmare hunt|lost sector|campaign|exotic quest|seasonal quest|dungeon|raid|strike:|nightfall/i.test(
      text,
    )
  ) {
    return false;
  }

  return RECURRING_VERSION_SOURCE_PATTERNS.some((pattern) =>
    pattern.test(text),
  );
}

export function resolveExpansionLabelForGroup(group, collectibles, seasons = {}) {
  const sorted = [...group].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  for (const item of sorted) {
    if (!item.collectibleHash) continue;
    const collectible = collectibles[String(item.collectibleHash)];
    const source = collectible?.sourceString ?? "";
    if (!source || isRecurringVersionSource(source)) continue;

    const label = resolveExpansionLabelFromSource(source);
    if (label) return label;
  }

  return null;
}

export function watermarkBasename(watermarkPath = "") {
  return watermarkPath.split("/").pop() ?? "";
}

/**
 * Majority label per iconWatermark from activity sources. Aligns text labels with
 * the season emblem shown on the icon when DIM season numbers are ambiguous.
 */
export function buildWatermarkLabelMap(items, collectibles, seasons = {}) {
  const votes = new Map();

  for (const item of Object.values(items)) {
    const watermark = item.iconWatermark;
    if (!watermark || !item.collectibleHash) continue;

    const collectible = collectibles[String(item.collectibleHash)];
    const source = collectible?.sourceString ?? "";
    if (!source || isRecurringVersionSource(source)) continue;

    const label = resolveSeasonLabelFromSource(source, seasons);
    if (!label) continue;

    const key = watermarkBasename(watermark);
    if (!votes.has(key)) votes.set(key, new Map());
    const labelVotes = votes.get(key);
    labelVotes.set(label, (labelVotes.get(label) ?? 0) + 1);
  }

  const result = new Map();
  for (const [key, labelVotes] of votes) {
    let bestLabel = null;
    let bestCount = 0;
    for (const [label, count] of labelVotes) {
      if (count > bestCount) {
        bestLabel = label;
        bestCount = count;
      }
    }
    if (bestLabel) result.set(key, bestLabel);
  }

  for (const [key, label] of Object.entries(WATERMARK_LABEL_OVERRIDES)) {
    result.set(key, label);
  }

  return result;
}

function shouldApplyCohortSeasonBoost(
  ownSeason,
  cohortSeason,
  fromSource,
  source,
) {
  if (cohortSeason <= ownSeason) return false;
  if (!fromSource || isRecurringVersionSource(source)) return true;

  const ownDisplay = manifestSeasonToDisplayNumber(ownSeason);
  const sourceDisplay = displayNumberFromLabel(fromSource);
  const ownLabel = seasonLabelFromManifestNumber(ownSeason);

  if (sourceDisplay === ownDisplay && fromSource === ownLabel) {
    return false;
  }

  if (isExpansionLabel(fromSource) && sourceDisplay === ownDisplay) {
    return false;
  }

  const cohortDisplay = manifestSeasonToDisplayNumber(cohortSeason);
  return cohortDisplay > sourceDisplay;
}

function resolveManifestSeasonForLabel(
  item,
  dimSeasonData,
  indexCohortAnchors,
  fromSource,
  source,
) {
  const ownSeason = resolveWatermarkSeasonNumber(item, dimSeasonData);
  const cohortSeason = resolveIndexCohortWatermarkSeason(
    item,
    indexCohortAnchors,
    dimSeasonData,
  );

  if (
    shouldApplyCohortSeasonBoost(ownSeason, cohortSeason, fromSource, source)
  ) {
    return Math.max(ownSeason, cohortSeason);
  }

  return ownSeason;
}

export function resolveCollectibleForVariant(item, group, collectibles) {
  if (item.collectibleHash) {
    return collectibles[String(item.collectibleHash)] ?? null;
  }

  for (const peer of [...group].sort((a, b) => (b.index ?? 0) - (a.index ?? 0))) {
    if (!peer.collectibleHash) continue;
    const collectible = collectibles[String(peer.collectibleHash)];
    if (collectible?.sourceString) return collectible;
  }

  return null;
}

function isEdgeOfFateActivitySource(source = "") {
  return /edge of fate campaign|the edge of fate activities|\breclaim\b|desert perpetual|kepler/i.test(
    source,
  );
}

const EDGE_OF_FATE_WATERMARKS = new Set([
  "249813e647271a8227bae0d8a39ed505.png",
  "6129365b4fad6754f2b8c4478fc3c4ac.png",
  "4376a7d734583ae347acf9732aa3bb43.png",
]);

/**
 * Corrects labels when activity sources or cohort watermarks disagree with the
 * chapter emblem on the item icon (Year 8 featured gear, Renegades dungeon, etc.).
 */
export function applyFeaturedWatermarkLabelCorrection(
  item,
  label,
  source = "",
  dimSeasonData = {},
) {
  const basename = watermarkBasename(item.iconWatermark);
  const manifestSeason = resolveWatermarkSeasonNumber(item, dimSeasonData);
  const forced = WATERMARK_LABEL_OVERRIDES[basename];

  if (forced === "Renegades" || forced === "S26 Episode: Heresy") {
    return forced;
  }

  if (
    basename === MONUMENT_FEATURED_WATERMARK &&
    manifestSeason === 28 &&
    (label === "The Edge of Fate" || label === "S28 Season: Reclamation") &&
    !isEdgeOfFateActivitySource(source)
  ) {
    return MONUMENT_OF_TRIUMPH_LABEL;
  }

  if (EDGE_OF_FATE_WATERMARKS.has(basename) && manifestSeason === 27) {
    return "The Edge of Fate";
  }

  if (label === "S28 Season: Reclamation") {
    return "The Edge of Fate";
  }

  return label;
}

/**
 * Season label for a specific item hash (version). The icon watermark emblem is the
 * visual source of truth; activity sources disambiguate expansion vs season.
 */
export function resolveVersionSeasonLabel(
  item,
  collectible,
  seasons,
  seasonPassItemSeason,
  seasonIndexAnchors,
  dimSeasonData = {},
  {
    peerItems = [],
    indexCohortAnchors = [],
    watermarkLabelMap = new Map(),
    salvationsEdgeS29MinIndex = null,
  } = {},
) {
  const source = collectible?.sourceString ?? "";
  const fromSource = resolveSeasonLabelFromSource(source, seasons);
  const votedLabel = watermarkLabelMap.get(watermarkBasename(item.iconWatermark));
  const watermarkOverride =
    WATERMARK_LABEL_OVERRIDES[watermarkBasename(item.iconWatermark)];
  const ownSeason = resolveWatermarkSeasonNumber(item, dimSeasonData);

  let label = null;

  if (fromSource && !isRecurringVersionSource(source)) {
    if (watermarkOverride && fromSource === "Red War") {
      label = watermarkOverride;
    } else {
      label = fromSource;
    }
  } else if (watermarkOverride) {
    label = watermarkOverride;
  } else if (votedLabel && isExpansionLabel(votedLabel)) {
    label = votedLabel;
  } else if (ownSeason > 0) {
    label = seasonLabelFromManifestNumber(ownSeason);
  } else {
    const manifestSeason = resolveManifestSeasonForLabel(
      item,
      dimSeasonData,
      indexCohortAnchors,
      fromSource,
      source,
    );
    if (manifestSeason > 0) {
      label = seasonLabelFromManifestNumber(manifestSeason);
    } else if (votedLabel) {
      label = votedLabel;
    } else {
      const seasonPassSeason = seasonPassItemSeason?.get(String(item.hash));
      if (seasonPassSeason) {
        label = seasonLabelFromManifestNumber(seasonPassSeason);
      } else {
        const seasonHash = item.seasonHash ?? collectible?.seasonHash ?? null;
        if (seasonHash) {
          const season = seasons[String(seasonHash)];
          if (season?.seasonNumber) {
            label = seasonLabelFromManifestNumber(season.seasonNumber);
          }
        }
      }
    }
  }

  if (!label) {
    label = inferSeasonLabelFromIndex(item.index ?? 0, seasonIndexAnchors);
  }

  return stripIncorrectMonumentLabel(
    item,
    applySalvationsEdgeReissueLabel(
      item,
      resolveIntoTheLightSeasonLabel(
        item,
        applyFeaturedWatermarkLabelCorrection(
          item,
          label,
          source,
          dimSeasonData,
        ),
        source,
      ),
      salvationsEdgeS29MinIndex,
    ),
    source,
  );
}

export function resolveItemSeasonLabel(
  item,
  collectible,
  seasons,
  seasonPassItemSeason,
) {
  return resolveVariantSeasonLabel(
    item,
    collectible,
    seasons,
    seasonPassItemSeason,
  );
}

export function resolveKnownSeasonNumber(
  item,
  collectible,
  seasons,
  seasonPassItemSeason,
) {
  const label = resolveItemSeasonLabel(
    item,
    collectible,
    seasons,
    seasonPassItemSeason,
  );
  if (!label) return 0;

  return displayNumberFromLabel(label);
}

export function inferSeasonLabelFromIndex(index, anchors) {
  if (!anchors.length) return "Red War";

  let best = anchors[0];
  let bestDistance = Math.abs(index - best.index);

  for (const anchor of anchors) {
    const distance = Math.abs(index - anchor.index);
    if (distance < bestDistance) {
      best = anchor;
      bestDistance = distance;
    }
  }

  return best.seasonLabel;
}

export function inferSeasonNumberFromIndex(index, anchors) {
  const label = inferSeasonLabelFromIndex(index, anchors);
  return displayNumberFromLabel(label) || 1;
}

export function resolveSeasonLabelFromSource(source = "", seasons = {}) {
  for (const [pattern, label] of SEASON_SOURCE_PATTERNS) {
    if (pattern.test(source)) return label;
  }

  if (LATEST_SEASON_SOURCE_PATTERNS.some((pattern) => pattern.test(source))) {
    return seasonLabelFromNumber(getLatestSeasonFromManifest(seasons).number);
  }

  return null;
}

export function isSourceObtainable(
  source = "",
  collectible = null,
  seasonNumber = 0,
  { recentSeasonPass = false } = {},
) {
  if (collectible?.redacted) return false;

  const entitlement =
    collectible?.stateInfo?.requirements?.entitlementUnavailableMessage ?? "";
  if (/preorder exclusive|timed exclusive|no longer/i.test(entitlement)) {
    return false;
  }

  if (/complete trials tickets/i.test(source)) {
    return true;
  }

  if (/cannot be reacquired from collections/i.test(source)) {
    return true;
  }

  for (const pattern of UNOBTAINABLE_SOURCE_PATTERNS) {
    if (pattern.test(source)) return false;
  }

  if (
    /season pass reward|rewards pass|upgraded event card reward/i.test(source)
  ) {
    return recentSeasonPass;
  }

  if (/\bbright engrams\b/i.test(source)) {
    return false;
  }

  return true;
}
