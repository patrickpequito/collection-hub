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

/** Compact season icons for filter dropdowns (e.g. `the-final-shape-small.png`). */
export function localSeasonFilterIconPath(label: string): string {
  return `${SEASON_ICON_DIR}/${seasonLabelToIconSlug(label)}-small.png`;
}
