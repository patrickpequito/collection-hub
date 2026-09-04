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

/** Event watermarks — resolved via eventLabel, not seasonLabel. */
const WATERMARK_EVENT_LABELS: Record<string, string> = {
  "bcc26708e314306fb2fc8cb98fcbf47e.png": "30th Anniversary",
  [CALL_TO_ARMS_WATERMARK]: "Call to Arms",
};
const RENEGADES_ARMOR_CHAPTER_WATERMARK =
  "4376a7d734583ae347acf9732aa3bb43.png";

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

/** Resolve a player-facing season label from the Bungie season watermark on an icon. */
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

  const manifestSeason = manifestSeasonForIconPath(seasonIconPath);
  if (manifestSeason > 0) {
    return MANIFEST_CHAPTER_LABEL[manifestSeason] ?? null;
  }

  return null;
}
