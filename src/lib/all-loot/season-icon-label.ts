/** Mirrors scripts/all-loot-mappings.mjs — icon watermark is the season label source of truth. */

export const MONUMENT_OF_TRIUMPH_LABEL = "Monument of Triumph";

export const MANIFEST_CHAPTER_LABEL: Record<number, string> = {
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

const MONUMENT_FEATURED_WATERMARK = "e78fd9419f99464816ac8f628bc3c4af.png";
const REVENANT_EPISODE_WATERMARK = "5232219633cc4d90570bffda36caccf4.png";
const INTO_THE_LIGHT_WATERMARK = "60d34bc853c51063b79592233c3661d4.png";
const CALL_TO_ARMS_WATERMARK = "6eeb62a30439cecc7699c22f3e1fb3cf.png";

/** Event watermarks — the emblem on the icon is the display source of truth. */
export const WATERMARK_EVENT_LABELS: Record<string, string> = {
  "bcc26708e314306fb2fc8cb98fcbf47e.png": "30th Anniversary",
  [CALL_TO_ARMS_WATERMARK]: "Call to Arms",
  "83fbcacd223402c09af4b7ab067f8cce.png": "The Dawning",
  "53dc0b02306726ff1517af33ac908cef.png": "Festival of the Lost",
  "9c091ec0e22c01dacc25efb63b46eb9b.png": "Guardian Games",
  "50c3ebe414c6946429934d79504922fa.png": "Solstice",
  "2b89827888c5581a14af976968bcb18a.png": "Pride",
};
const RENEGADES_ARMOR_CHAPTER_WATERMARK =
  "4376a7d734583ae347acf9732aa3bb43.png";

/**
 * Season watermarks missing from the partial DIM map bundled in-app.
 * Same majority mapping used by the shaders catalog.
 */
export const EXTRA_WATERMARK_SEASON_LABELS: Record<string, string> = {
  "0b212b58a961f150708bca95095e0ecb.png": "S8 Season of the Undying",
  "0d6c3365022ed3b059eac467b076978f.png": "S26 Episode: Heresy",
  "247715dd42abef457b52ef37280c0e42.png": "S10 Season of the Worthy",
  "2c022e452f395db7b1daec1cb44631fc.png": "S6 Season of the Drifter",
  "2dc17f123b7449b14144e76cfbeb2309.png": "S22 Season of the Witch",
  "3543d23d9063fbf7332c7f129a74ada2.png": "The Edge of Fate",
  "36418dde751148bd3b95a023d491ea73.png": "S14 Season of the Splicer",
  "41d05b7cb5cc0a384af07ee9b7d36dd2.png": "S19 Season of the Seraph",
  "58d3ec8338cc9746a2e0cf901fbcec0e.png": "S7 Season of Opulence",
  "661c84a377389a3b8a1fc38b44189b41.png": "S24 Episode: Echoes",
  "6f17d323d81dd683086d88a9268f8106.png": "S23 Season of the Wish",
  "75adde12e4e9c9fb237e492d8258eb73.png": "S17 Season of the Haunted",
  "7d815c943977fe71bbf00caf1bd9c514.png": "S18 Season of Plunder",
  "914322d11262322c839a5388db2a4943.png": "S15 Season of the Lost",
  "9bfaa5536772e2f3ef1252813a21c4d1.png": "S24 Episode: Echoes",
  "9dcae1241214f11398178375859888e6.png": "Red War",
  "a0556509f8825756b6b89f59f90528ec.png": "S20 Season of Defiance",
  "a5e27dc822aa72787f388bd1fc115803.png": "S12 Season of the Hunt",
  "ae5c7f708a36f754c2f68c65c88ab9aa.png": "S21 Season of the Deep",
  "aeb95eb1abe8e45e1fe2573d6b3ab3c5.png": "Forsaken",
  "c1e11e70eba15abcd4e0414fa29ef714.png": "S6 Season of the Drifter",
  "cf4ebcfce71b8ac247a4274323cd5090.png": "Red War",
  "d105aa342f2d0c53a90a28477552f61f.png": "S11 Season of Arrivals",
  "da5f961ef97b78293cc498978c10e178.png": "Warmind",
  "e0c16042274fd7d9cbffc4489e340c5d.png": "S5 Season of the Forge",
  "ede19a0e1a54564243b0e5e8a18bde84.png": "S9 Season of Dawn",
  "fe8bcc20fbfaf4cac69dfb640bb0b84e.png": "Curse of Osiris",
};

/** Hard-coded watermark basename → label (shared with catalog scripts). */
export const WATERMARK_LABEL_OVERRIDES: Record<string, string> = {
  "7ba9d804508dd083ec20fcdb8ba0869d.png": "Curse of Osiris",
  "a15754752f40aaf7b1b00aadb70a8f35.png": "Shadowkeep",
  "bce51cf90464e28026140df77c4eb6ce.png": "Beyond Light",
  "fc02418ad2002351a3f88faa5b14eb88.png": "Lightfall",
  "0b441021fbc328e6d0e2abc895f5c96e.png": "The Witch Queen",
  "4376a7d734583ae347acf9732aa3bb43.png": "The Edge of Fate",
  "95f7754d52d6016fdc445fb62aa7a31e.png": "Renegades",
  "0ac354c1c326441716ddb15d2c158c59.png": "S26 Episode: Heresy",
};

/** Partial DIM watermark map — relabel/generate merge the live GitHub export. */
export const DIM_WATERMARK_TO_SEASON: Record<string, number> = {
  "/common/destiny2_content/icons/249813e647271a8227bae0d8a39ed505.png": 27,
  "/common/destiny2_content/icons/6129365b4fad6754f2b8c4478fc3c4ac.png": 27,
  "/common/destiny2_content/icons/4376a7d734583ae347acf9732aa3bb43.png": 27,
  "/common/destiny2_content/icons/95f7754d52d6016fdc445fb62aa7a31e.png": 28,
  "/common/destiny2_content/icons/e78fd9419f99464816ac8f628bc3c4af.png": 28,
  "/common/destiny2_content/icons/5232219633cc4d90570bffda36caccf4.png": 25,
  "/common/destiny2_content/icons/0ac354c1c326441716ddb15d2c158c59.png": 26,
  "/common/destiny2_content/icons/6eeb62a30439cecc7699c22f3e1fb3cf.png": 28,
  "/common/destiny2_content/icons/7b48b09fbb50634680168d5880b16bc9.png": 13,
  "/common/destiny2_content/icons/7b41678824a620d4f295984862702179.png": 16,
  "/common/destiny2_content/icons/0b441021fbc328e6d0e2abc895f5c96e.png": 16,
  "/common/destiny2_content/icons/fc02418ad2002351a3f88faa5b14eb88.png": 20,
};

function watermarkBasename(iconPath: string): string {
  return iconPath.split("/").pop() ?? "";
}

function manifestSeasonForIconPath(seasonIconPath: string): number {
  const direct = DIM_WATERMARK_TO_SEASON[seasonIconPath];
  if (direct) return direct;

  const basename = watermarkBasename(seasonIconPath);
  const byBasename = DIM_WATERMARK_TO_SEASON[
    `/common/destiny2_content/icons/${basename}`
  ];
  return byBasename ?? 0;
}

export function displayNumberFromLabel(label: string): number {
  const match = label.match(/^S(\d+)/);
  if (match) return Number(match[1]);
  const expansions: Record<string, number> = {
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
  return expansions[label] ?? 0;
}

/** Event label from the watermark on the icon (icon-first). */
export function resolveEventLabelFromIconPath(
  seasonIconPath?: string | null,
): string | null {
  if (!seasonIconPath) return null;
  return WATERMARK_EVENT_LABELS[watermarkBasename(seasonIconPath)] ?? null;
}

/**
 * Resolve a player-facing season/expansion label from the Bungie watermark.
 * Event watermarks are excluded here — use `resolveEventLabelFromIconPath`.
 */
export function resolveSeasonLabelFromIconPath(
  seasonIconPath?: string | null,
): string | null {
  if (!seasonIconPath) return null;

  const basename = watermarkBasename(seasonIconPath);

  if (basename === MONUMENT_FEATURED_WATERMARK) {
    return MONUMENT_OF_TRIUMPH_LABEL;
  }
  if (basename === REVENANT_EPISODE_WATERMARK) {
    return "S25 Episode: Revenant";
  }
  if (basename === INTO_THE_LIGHT_WATERMARK) {
    return "Into the Light";
  }

  if (WATERMARK_EVENT_LABELS[basename]) {
    return null;
  }
  if (basename === RENEGADES_ARMOR_CHAPTER_WATERMARK) {
    return "Renegades";
  }

  const override = WATERMARK_LABEL_OVERRIDES[basename];
  if (override) return override;

  const extra = EXTRA_WATERMARK_SEASON_LABELS[basename];
  if (extra) return extra;

  const manifestSeason = manifestSeasonForIconPath(seasonIconPath);
  if (manifestSeason > 0) {
    return MANIFEST_CHAPTER_LABEL[manifestSeason] ?? null;
  }

  return null;
}

/**
 * Display label for an icon watermark: event emblem wins, then season/expansion.
 */
export function resolveDisplayLabelFromIconPath(
  seasonIconPath?: string | null,
): string | null {
  return (
    resolveEventLabelFromIconPath(seasonIconPath) ||
    resolveSeasonLabelFromIconPath(seasonIconPath)
  );
}
