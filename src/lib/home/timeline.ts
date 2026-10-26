import { PUBLISHED_EXPANSION_SLUGS } from "@/data/expansions";
import { PUBLISHED_SEASON_SLUGS } from "@/data/seasons";

export type TimelineEntry = {
  slug: string;
  /** Short name for the home strip, e.g. "Haunted". */
  title: string;
  /** Full name for the Seasons timeline, e.g. "Season of the Haunted". */
  fullTitle: string;
  /** Release month, "YYYY-MM". */
  date: string;
  /** Short tag under the title, e.g. "S17" or "Expansion". */
  tag: string;
  kind: "expansion" | "season";
  imageUrl?: string;
  /** Only published hubs link; the rest show as "Soon". */
  href?: string;
};

export type TimelineYear = {
  label: string;
  /** Calendar span, e.g. "2022–23". */
  span: string;
  entries: TimelineEntry[];
};

function expansion(slug: string, title: string, date: string): TimelineEntry {
  const published = PUBLISHED_EXPANSION_SLUGS.has(slug);
  return {
    slug,
    title,
    fullTitle: title,
    date,
    tag: "Expansion",
    kind: "expansion",
    imageUrl: `/images/expansions/activities/${slug}.webp`,
    href: published ? `/expansions/${slug}` : undefined,
  };
}

function season(
  slug: string,
  title: string,
  tag: string,
  date: string,
  { hasImage = true, fullTitle }: { hasImage?: boolean; fullTitle?: string } = {},
): TimelineEntry {
  const published = PUBLISHED_SEASON_SLUGS.has(slug);
  return {
    slug,
    title,
    fullTitle: fullTitle ?? title,
    date,
    tag,
    kind: "season",
    imageUrl: hasImage ? `/images/seasons/activities/${slug}.webp` : undefined,
    href: published ? `/seasons/${slug}` : undefined,
  };
}

/** Destiny 2 by year, oldest → newest (left → right on the home page). */
export const HOME_TIMELINE: readonly TimelineYear[] = [
  {
    label: "Year 1",
    span: "2017–18",
    entries: [
      expansion("red-war", "Red War", "2017-09"),
      expansion("curse-of-osiris", "Curse of Osiris", "2017-12"),
      expansion("warmind", "Warmind", "2018-05"),
    ],
  },
  {
    label: "Year 2",
    span: "2018–19",
    entries: [
      expansion("forsaken", "Forsaken", "2018-09"),
      season("s5-season-of-the-forge", "Forge", "S5", "2018-11", { fullTitle: "Season of the Forge" }),
      season("s6-season-of-the-drifter", "Drifter", "S6", "2019-03", { fullTitle: "Season of the Drifter" }),
      season("s7-season-of-opulence", "Opulence", "S7", "2019-06", { fullTitle: "Season of Opulence" }),
    ],
  },
  {
    label: "Year 3",
    span: "2019–20",
    entries: [
      expansion("shadowkeep", "Shadowkeep", "2019-10"),
      season("s8-season-of-the-undying", "Undying", "S8", "2019-10", { fullTitle: "Season of the Undying" }),
      season("s9-season-of-dawn", "Dawn", "S9", "2019-12", { fullTitle: "Season of Dawn" }),
      season("s10-season-of-the-worthy", "Worthy", "S10", "2020-03", { fullTitle: "Season of the Worthy" }),
      season("s11-season-of-arrivals", "Arrivals", "S11", "2020-06", { fullTitle: "Season of Arrivals" }),
    ],
  },
  {
    label: "Year 4",
    span: "2020–22",
    entries: [
      expansion("beyond-light", "Beyond Light", "2020-11"),
      season("s12-season-of-the-hunt", "Hunt", "S12", "2020-11", { fullTitle: "Season of the Hunt" }),
      season("s13-season-of-the-chosen", "Chosen", "S13", "2021-02", { fullTitle: "Season of the Chosen" }),
      season("s14-season-of-the-splicer", "Splicer", "S14", "2021-05", { fullTitle: "Season of the Splicer" }),
      season("s15-season-of-the-lost", "Lost", "S15", "2021-08", { fullTitle: "Season of the Lost" }),
    ],
  },
  {
    label: "Year 5",
    span: "2022–23",
    entries: [
      expansion("the-witch-queen", "The Witch Queen", "2022-02"),
      season("s16-season-of-the-risen", "Risen", "S16", "2022-02", { fullTitle: "Season of the Risen" }),
      season("s17-season-of-the-haunted", "Haunted", "S17", "2022-05", { fullTitle: "Season of the Haunted" }),
      season("s18-season-of-plunder", "Plunder", "S18", "2022-08", { fullTitle: "Season of Plunder" }),
      season("s19-season-of-the-seraph", "Seraph", "S19", "2022-12", { fullTitle: "Season of the Seraph" }),
    ],
  },
  {
    label: "Year 6",
    span: "2023–24",
    entries: [
      expansion("lightfall", "Lightfall", "2023-02"),
      season("s20-season-of-defiance", "Defiance", "S20", "2023-02", { fullTitle: "Season of Defiance" }),
      season("s21-season-of-the-deep", "Deep", "S21", "2023-05", { fullTitle: "Season of the Deep" }),
      season("s22-season-of-the-witch", "Witch", "S22", "2023-08", { fullTitle: "Season of the Witch" }),
      season("s23-season-of-the-wish", "Wish", "S23", "2023-11", { fullTitle: "Season of the Wish" }),
    ],
  },
  {
    label: "Year 7",
    span: "2024–25",
    entries: [
      season("into-the-light", "Into the Light", "Update", "2024-04"),
      expansion("the-final-shape", "The Final Shape", "2024-06"),
      season("s24-episode-echoes", "Echoes", "Episode", "2024-06"),
      season("s25-episode-revenant", "Revenant", "Episode", "2024-10"),
      season("s26-episode-heresy", "Heresy", "Episode", "2025-02"),
    ],
  },
  {
    label: "Year 8",
    span: "2025–26",
    entries: [
      expansion("the-edge-of-fate", "The Edge of Fate", "2025-07"),
      season("s27-season-reclamation", "Reclamation", "S27", "2025-07", {
        hasImage: false,
        fullTitle: "Season: Reclamation",
      }),
      expansion("renegades", "Renegades", "2025-12"),
      season("s28-season-lawless", "Lawless", "S28", "2025-12", {
        hasImage: false,
        fullTitle: "Season: Lawless",
      }),
    ],
  },
];

/** Destiny 1 release, newest first — placeholders on the Seasons timeline. */
export const DESTINY_1_TIMELINE: readonly { title: string; tag: string; date: string }[] = [
  { title: "Rise of Iron", tag: "Expansion", date: "2016-09" },
  { title: "The Taken King", tag: "Expansion", date: "2015-09" },
  { title: "House of Wolves", tag: "Expansion", date: "2015-05" },
  { title: "The Dark Below", tag: "Expansion", date: "2014-12" },
  { title: "Destiny", tag: "Base game", date: "2014-09" },
];

/** Timeline entry and its year for a hub page header ("Year 5 · Feb 2022"). */
export function findTimelineEntry(
  slug: string,
): { entry: TimelineEntry; year: TimelineYear } | null {
  for (const year of HOME_TIMELINE) {
    const entry = year.entries.find((candidate) => candidate.slug === slug);
    if (entry) return { entry, year };
  }
  return null;
}

/** "2022-02" → "Feb 2022". */
export function formatTimelineMonth(date: string): string {
  const [year, month] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
