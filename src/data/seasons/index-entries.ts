/**
 * Season / Episode index cards for the Expansions & Seasons page.
 *
 * Index art: `public/images/seasons/activities/{imageFile}`
 * Page headers: `public/images/headers/{slug}-header.webp`
 */

export type SeasonIndexEntry = {
  slug: string;
  title: string;
  available: boolean;
  imageFile: string;
  href?: string;
};

function season(slug: string, title: string): SeasonIndexEntry {
  return {
    slug,
    title,
    available: false,
    imageFile: `${slug}.webp`,
  };
}

function publishedSeason(
  slug: string,
  title: string,
): SeasonIndexEntry {
  return {
    slug,
    title,
    available: true,
    imageFile: `${slug}.webp`,
    href: `/seasons/${slug}`,
  };
}

/**
 * Seasons paired to the expansion that ran during that year.
 * Display order within each group is chronological oldest → newest; the index
 * UI reverses this so the 2×2 grid reads newest → oldest.
 */
export const SEASONS_BY_EXPANSION_SLUG: Readonly<
  Record<string, readonly SeasonIndexEntry[]>
> = {
  forsaken: [
    season("s5-season-of-the-forge", "Season of the Forge"),
    season("s6-season-of-the-drifter", "Season of the Drifter"),
    season("s7-season-of-opulence", "Season of Opulence"),
  ],
  shadowkeep: [
    season("s8-season-of-the-undying", "Season of the Undying"),
    season("s9-season-of-dawn", "Season of Dawn"),
    season("s10-season-of-the-worthy", "Season of the Worthy"),
    season("s11-season-of-arrivals", "Season of Arrivals"),
  ],
  "beyond-light": [
    publishedSeason("s12-season-of-the-hunt", "Season of the Hunt"),
    publishedSeason("s13-season-of-the-chosen", "Season of the Chosen"),
    publishedSeason("s14-season-of-the-splicer", "Season of the Splicer"),
    publishedSeason("s15-season-of-the-lost", "Season of the Lost"),
  ],
  "the-witch-queen": [
    season("s16-season-of-the-risen", "Season of the Risen"),
    season("s17-season-of-the-haunted", "Season of the Haunted"),
    season("s18-season-of-plunder", "Season of Plunder"),
    season("s19-season-of-the-seraph", "Season of the Seraph"),
  ],
  // Lightfall year slots: Defiance, Deep, Wish, Into the Light
  // (Season of the Witch omitted from this index layout).
  lightfall: [
    season("s20-season-of-defiance", "Season of Defiance"),
    season("s21-season-of-the-deep", "Season of the Deep"),
    season("s23-season-of-the-wish", "Season of the Wish"),
    season("into-the-light", "Into the Light"),
  ],
  "the-final-shape": [
    season("s24-episode-echoes", "Episode: Echoes"),
    season("s25-episode-revenant", "Episode: Revenant"),
    season("s26-episode-heresy", "Episode: Heresy"),
  ],
};

/** Flat list for docs / tooling (newest first). */
export const SEASON_INDEX_ENTRIES: readonly SeasonIndexEntry[] = [
  ...[...(SEASONS_BY_EXPANSION_SLUG["the-final-shape"] ?? [])].reverse(),
  ...[...(SEASONS_BY_EXPANSION_SLUG.lightfall ?? [])].reverse(),
  ...[...(SEASONS_BY_EXPANSION_SLUG["the-witch-queen"] ?? [])].reverse(),
  ...[...(SEASONS_BY_EXPANSION_SLUG["beyond-light"] ?? [])].reverse(),
  ...[...(SEASONS_BY_EXPANSION_SLUG.shadowkeep ?? [])].reverse(),
  ...[...(SEASONS_BY_EXPANSION_SLUG.forsaken ?? [])].reverse(),
];
