import {
  EXPANSION_INDEX_ENTRIES,
  PUBLISHED_EXPANSION_SLUGS,
} from "@/data/expansions";
import type { ExpansionIndexEntry } from "@/data/expansions/types";
import { SEASONS_BY_EXPANSION_SLUG, type SeasonIndexEntry } from "@/data/seasons";

export type ExpansionNavLink = {
  slug: string;
  title: string;
  href: string;
};

/** Published expansions oldest → newest (for prev/next adjacency). */
export function getPublishedExpansionsChronological(): ExpansionNavLink[] {
  return [...EXPANSION_INDEX_ENTRIES]
    .reverse()
    .filter(
      (entry): entry is ExpansionIndexEntry & { href: string } =>
        Boolean(
          entry.available &&
            entry.href &&
            PUBLISHED_EXPANSION_SLUGS.has(entry.slug),
        ),
    )
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      href: entry.href,
    }));
}

export function getExpansionNavAdjacent(slug: string): {
  previous: ExpansionNavLink | null;
  next: ExpansionNavLink | null;
} {
  const published = getPublishedExpansionsChronological();
  const index = published.findIndex((entry) => entry.slug === slug);
  if (index === -1) {
    return { previous: null, next: null };
  }
  return {
    previous: published[index - 1] ?? null,
    next: published[index + 1] ?? null,
  };
}

/** All expansions for the picker — newest first (index order). */
export function getExpansionNavEntries(): readonly ExpansionIndexEntry[] {
  return EXPANSION_INDEX_ENTRIES;
}

/** Seasons paired to an expansion year — newest → oldest for the trailer 2×2. */
export function getExpansionSeasonBanners(
  expansionSlug: string,
): readonly SeasonIndexEntry[] {
  const seasons = SEASONS_BY_EXPANSION_SLUG[expansionSlug] ?? [];
  return [...seasons].reverse();
}
