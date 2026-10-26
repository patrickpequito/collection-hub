import {
  SEASON_INDEX_ENTRIES,
  type SeasonIndexEntry,
} from "@/data/seasons";

export type SeasonNavLink = {
  slug: string;
  title: string;
  href: string;
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
