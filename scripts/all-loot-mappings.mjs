/**
 * Player-facing chapters S1–S29. Bungie manifest seasons are 1–28; manifest 27–28
 * map to display S28–S29. Expansion and season labels sharing an S number are
 * separate filters — see CANONICAL_SEASON_ORDER.
 */
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
  27: "S28 Season: Reclamation",
  28: "S29 Monument of Triumph",
};

/** Facet order (newest first). Season before expansion when S numbers match. */
export const CANONICAL_SEASON_ORDER = [
  "S29 Monument of Triumph",
  "Renegades",
  "S28 Season: Reclamation",
  "The Edge of Fate",
  "S26 Episode: Heresy",
  "S25 Episode: Revenant",
  "S24 Episode: Echoes",
  "S23 Season of the Wish",
  "The Final Shape",
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

/** Expansion labels keyed by display season number (no S prefix in UI). */
export const EXPANSION_DISPLAY_NUMBER = {
  Renegades: 29,
  "The Edge of Fate": 28,
  "The Final Shape": 23,
  Lightfall: 20,
  "The Witch Queen": 16,
  "Beyond Light": 12,
  Shadowkeep: 8,
  Forsaken: 4,
  Warmind: 3,
  "Curse of Osiris": 2,
  "Red War": 1,
};

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
  [/monument of triumph/i, "S29 Monument of Triumph"],
  [/renegades|fireteam ops/i, "Renegades"],
  [/kepler|exploring kepler/i, "S29 Monument of Triumph"],
  [/season:\s*reclamation|\breclamation\b/i, "S28 Season: Reclamation"],
  [/the edge of fate activities|edge of fate campaign/i, "The Edge of Fate"],
  [/edge of fate|desert perpetual|equilibrium|vesper'?s host|sundered doctrine|pantheon/i, "The Edge of Fate"],
  [/episode:\s*heresy|\bheresy\b/i, "S26 Episode: Heresy"],
  [/episode:\s*revenant|\brevenant\b/i, "S25 Episode: Revenant"],
  [/episode:\s*echoes|\bechoes\b/i, "S24 Episode: Echoes"],
  [/salvation'?s edge|warlord'?s ruin/i, "The Final Shape"],
  [/the final shape/i, "The Final Shape"],
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
    /shadowkeep|\bmoon\b.*(?:dungeon|raid|pit)|garden of salvation|pit of heresy|nightmare hunt|nightmare\b/i,
    "Shadowkeep",
  ],
  [/season of opulence|\bopulence\b|\bmenagerie\b|\bcrown of sorrow/i, "S7 Season of Opulence"],
  [/season of the drifter|\bdrifter\b|\bgambit prime|\breckoning\b/i, "S6 Season of the Drifter"],
  [/season of the forge|\bforge\b|\bblack armory|\bscourge of the past/i, "S5 Season of the Forge"],
  [
    /forsaken|\blast wish|\bshattered throne|\bdreaming city|\btangled shore|\breef\b/i,
    "Forsaken",
  ],
  [/warmind|\bescalation protocol|\bspire of stars|\bmars\b/i, "Warmind"],
  [/curse of osiris|\beater of worlds|\bmercury\b/i, "Curse of Osiris"],
  [/red war|\bedz\b|\bhomecoming|\bleviathan raid|\bcalistoga|\btitan\b|\bio\b|\bn Nessus|\beuropean/i, "Red War"],
  [/destiny 2\b|\bnew light\b|\bintroductory\b/i, "Red War"],
  [/solstice 2024|solstice 2025/i, "S29 Monument of Triumph"],
  [/solstice 2023/i, "S23 Season of the Wish"],
  [/solstice 2022/i, "S17 Season of the Haunted"],
  [/solstice 2021/i, "S15 Season of the Lost"],
  [/solstice 2020/i, "Beyond Light"],
  [/solstice 2019/i, "Shadowkeep"],
  [/solstice 2018/i, "Forsaken"],
  [/festival of the lost 2024|festival of the lost 2025/i, "S29 Monument of Triumph"],
  [/festival of the lost 2023/i, "S23 Season of the Wish"],
  [/festival of the lost 2022/i, "S18 Season of Plunder"],
  [/festival of the lost 2021/i, "S15 Season of the Lost"],
  [/festival of the lost 2020/i, "S12 Season of the Hunt"],
  [/festival of the lost 2018/i, "Forsaken"],
  [/the dawning 2024|the dawning 2025/i, "S29 Monument of Triumph"],
  [/guardian games 2024|guardian games 2025/i, "S29 Monument of Triumph"],
];

/** Sources tied to the current live season — resolved from manifest at build time. */
export const LATEST_SEASON_SOURCE_PATTERNS = [];

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
  /\bemissary of the nine\b/i,
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

export function buildSeasonIndexAnchors(
  items,
  collectibles,
  seasons,
  seasonPassItemSeason,
) {
  const anchors = [];

  for (const item of Object.values(items)) {
    if (!item?.collectibleHash) continue;
    const collectible = collectibles[String(item.collectibleHash)];
    if (!collectible) continue;

    const seasonLabel = resolveItemSeasonLabel(
      item,
      collectible,
      seasons,
      seasonPassItemSeason,
    );
    if (!seasonLabel) continue;

    anchors.push({
      index: item.index ?? 0,
      seasonLabel,
    });
  }

  return anchors;
}

export function resolveItemSeasonLabel(
  item,
  collectible,
  seasons,
  seasonPassItemSeason,
) {
  const source = collectible?.sourceString ?? "";
  const fromSource = resolveSeasonLabelFromSource(source, seasons);
  if (fromSource) return fromSource;

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
