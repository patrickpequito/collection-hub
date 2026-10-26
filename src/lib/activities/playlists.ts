/** Playlist pages in Activities-hub order (drives Z / C and the header line). */
export const PLAYLISTS = [
  { slug: "vanguard-ops", title: "Vanguard Ops", mode: "PvE" },
  { slug: "gambit", title: "Gambit", mode: "PvE · PvP" },
  { slug: "crucible", title: "Crucible", mode: "PvP" },
  { slug: "trials-of-osiris", title: "Trials of Osiris", mode: "PvP" },
  { slug: "iron-banner", title: "Iron Banner", mode: "PvP" },
  { slug: "sparrow-racing-league", title: "Sparrow Racing League", mode: "Racing" },
] as const;

export function playlistEyebrow(slug: string): string {
  const playlist = PLAYLISTS.find((entry) => entry.slug === slug);
  return playlist ? `Playlist · ${playlist.mode}` : "Playlist";
}

export function playlistSiblings(slug: string) {
  const index = PLAYLISTS.findIndex((entry) => entry.slug === slug);
  const link = (entry: (typeof PLAYLISTS)[number] | undefined) =>
    entry ? { href: `/activities/${entry.slug}`, label: entry.title } : undefined;
  return { previous: link(PLAYLISTS[index - 1]), next: link(PLAYLISTS[index + 1]) };
}

/** "Oct 21" in UTC for header badges. */
export function formatShortDay(ms: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(ms),
  );
}
