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

/** Filter dropdown icon — only The Final Shape has a separate compact asset. */
export function localSeasonFilterIconPath(label: string): string {
  if (label === "The Final Shape") {
    return `${SEASON_ICON_DIR}/the-final-shape-small.png`;
  }
  return localSeasonIconPath(label);
}
