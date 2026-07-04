const SEASON_ICON_DIR = "/images/seasons";

export function seasonLabelToIconSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function localSeasonIconPath(label: string): string {
  return `${SEASON_ICON_DIR}/${seasonLabelToIconSlug(label)}.png`;
}

/** Seasons/expansions with a separate compact asset in the All Loot filter dropdown. */
const SEASON_FILTER_SMALL_ICON_LABELS = new Set([
  "30th Anniversary",
  "Beyond Light",
  "Curse of Osiris",
  "Lightfall",
  "Red War",
  "S5 Season of the Forge",
  "S7 Season of Opulence",
  "S10 Season of the Worthy",
  "S12 Season of the Hunt",
  "S13 Season of the Chosen",
  "S15 Season of the Lost",
  "S16 Season of the Risen",
  "S17 Season of the Haunted",
  "S19 Season of the Seraph",
  "S20 Season of Defiance",
  "The Final Shape",
  "The Witch Queen",
  "Warmind",
]);

/** Filter dropdown icon — some seasons use a separate `{slug}-small.png` asset. */
export function localSeasonFilterIconPath(label: string): string {
  if (SEASON_FILTER_SMALL_ICON_LABELS.has(label)) {
    return `${SEASON_ICON_DIR}/${seasonLabelToIconSlug(label)}-small.png`;
  }
  return localSeasonIconPath(label);
}
