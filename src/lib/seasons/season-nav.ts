import { EXPANSION_INDEX_ENTRIES } from "@/data/expansions";
import {
  SEASON_INDEX_ENTRIES,
  SEASONS_BY_EXPANSION_SLUG,
  type SeasonIndexEntry,
} from "@/data/seasons";

export type SeasonNavLink = {
  slug: string;
  title: string;
  href: string;
};

export type SeasonNavGroup = {
  expansionSlug: string;
  expansionTitle: string;
  seasons: readonly SeasonIndexEntry[];
};

/** Published seasons oldest → newest (for prev/next adjacency). */
export function getPublishedSeasonsChronological(): SeasonNavLink[] {
  return [...SEASON_INDEX_ENTRIES]
    .reverse()
    .filter(
      (entry): entry is SeasonIndexEntry & { href: string } =>
        Boolean(entry.available && entry.href),
    )
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      href: entry.href,
    }));
}

export function getSeasonNavAdjacent(slug: string): {
  previous: SeasonNavLink | null;
  next: SeasonNavLink | null;
} {
  const published = getPublishedSeasonsChronological();
  const index = published.findIndex((entry) => entry.slug === slug);
  if (index === -1) {
    return { previous: null, next: null };
  }
  return {
    previous: published[index - 1] ?? null,
    next: published[index + 1] ?? null,
  };
}

/**
 * All seasons for the picker, grouped by expansion year.
 * Expansion groups newest → oldest; seasons within each group newest → oldest
 * (same reading order as the Expansions & Seasons index).
 */
export function getSeasonNavGroups(): SeasonNavGroup[] {
  const expansionTitleBySlug = new Map(
    EXPANSION_INDEX_ENTRIES.map((entry) => [entry.slug, entry.title]),
  );

  const groups: SeasonNavGroup[] = [];
  for (const expansion of EXPANSION_INDEX_ENTRIES) {
    const seasons = SEASONS_BY_EXPANSION_SLUG[expansion.slug];
    if (!seasons?.length) continue;
    groups.push({
      expansionSlug: expansion.slug,
      expansionTitle:
        expansionTitleBySlug.get(expansion.slug) ?? expansion.title,
      seasons: [...seasons].reverse(),
    });
  }
  return groups;
}
