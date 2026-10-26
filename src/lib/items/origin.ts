import { DUNGEONS, LEGACY_RAIDS, PANTHEON, RAID_LAIRS, RAIDS } from "@/data/rad-loot/activities";
import { EXPANSION_HUBS, PUBLISHED_EXPANSION_SLUGS } from "@/data/expansions";
import { getSeasonHub, getSeasonSlugs, PUBLISHED_SEASON_SLUGS } from "@/data/seasons";
import { PLAYLISTS } from "@/lib/activities/playlists";
import type { AllLootItem } from "@/types/all-loot";

export type ItemOrigin = {
  /** "Vault of Glass", "Iron Banner", "Season of the Haunted"… */
  label: string;
  section: "activity" | "playlist" | "season" | "expansion";
  href?: string;
  /** "Raid", "Dungeon", "Playlist"… */
  kind: string;
};

const PLAYLIST_PATTERNS: Record<string, RegExp> = {
  "vanguard-ops": /vanguard|zavala|nightfall|strike/i,
  gambit: /gambit|drifter/i,
  crucible: /crucible|shaxx/i,
  "trials-of-osiris": /trials of osiris|saint-14|flawless/i,
  "iron-banner": /iron banner|saladin/i,
  "sparrow-racing-league": /sparrow racing league/i,
};

/** Where an item comes from, matched against the site's hubs (best effort). */
export function resolveItemOrigin(item: AllLootItem): ItemOrigin | null {
  const source = (item.source ?? "").toLowerCase();
  const activities = [
    ...[...RAIDS, ...LEGACY_RAIDS, ...RAID_LAIRS].map((entry) => ({ entry, kind: "Raid" })),
    ...DUNGEONS.map((entry) => ({ entry, kind: "Dungeon" })),
    { entry: PANTHEON, kind: "Endgame" },
  ].sort((a, b) => b.entry.title.length - a.entry.title.length);
  for (const { entry, kind } of activities) {
    if (source.includes(entry.title.toLowerCase())) {
      return {
        label: entry.title,
        section: "activity",
        kind,
        href: entry.available ? `/activities/${entry.slug}` : undefined,
      };
    }
  }

  for (const playlist of PLAYLISTS) {
    if (PLAYLIST_PATTERNS[playlist.slug]?.test(source)) {
      return { label: playlist.title, section: "playlist", kind: "Playlist", href: `/activities/${playlist.slug}` };
    }
  }

  for (const slug of getSeasonSlugs()) {
    const hub = getSeasonHub(slug);
    if (hub && hub.seasonLabel === item.seasonLabel) {
      return {
        label: hub.title,
        section: "season",
        kind: "Season",
        href: PUBLISHED_SEASON_SLUGS.has(slug) ? `/seasons/${slug}` : undefined,
      };
    }
  }
  for (const hub of EXPANSION_HUBS) {
    if (hub.seasonLabels.includes(item.seasonLabel)) {
      return {
        label: hub.title,
        section: "expansion",
        kind: "Expansion",
        href: PUBLISHED_EXPANSION_SLUGS.has(hub.slug) ? `/expansions/${hub.slug}` : undefined,
      };
    }
  }
  return null;
}

/** Breadcrumb trail for an item page: hub section + origin. */
export function originCrumbs(origin: ItemOrigin | null): { label: string; href?: string }[] {
  if (!origin) return [];
  const section =
    origin.section === "activity" || origin.section === "playlist"
      ? { label: "Activities", href: "/activities" }
      : { label: "Timeline", href: "/expansions" };
  return [section, { label: origin.label, href: origin.href }];
}
