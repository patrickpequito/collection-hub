import { readFileSync } from "node:fs";
import path from "node:path";
import type { FeaturedRotationSchedule } from "@/types/featured-rotation";

export const RAID_MILESTONE_SLUGS: Record<string, string> = {
  "1888320892": "vault-of-glass",
  "540415767": "crotas-end",
  "292102995": "kings-fall",
  "3181387331": "last-wish",
  "2712317338": "garden-of-salvation",
  "541780856": "deep-stone-crypt",
  "2136320298": "vow-of-the-disciple",
  "3699252268": "root-of-nightmares",
  "4196566271": "salvations-edge",
};

/** Newest raids with weekly challenges but outside the rotator highlight pool. */
export const EXCLUDED_FEATURED_RAID_SLUGS = new Set([
  "the-desert-perpetual",
  "the-pantheon",
]);

let cachedSchedule: FeaturedRotationSchedule | null = null;

function loadFeaturedRotationSchedule(): FeaturedRotationSchedule {
  if (cachedSchedule) return cachedSchedule;

  const filePath = path.join(
    process.cwd(),
    "data/featured-rotation-schedule.json",
  );
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as {
    epochUtc: string;
    dungeonWeeks: string[][];
    raidFallbackWeeks?: string[][];
  };

  cachedSchedule = {
    epochMs: Date.parse(raw.epochUtc),
    dungeonWeeks: raw.dungeonWeeks,
    raidFallbackWeeks: raw.raidFallbackWeeks ?? [],
  };
  return cachedSchedule;
}

const rotationSchedule = loadFeaturedRotationSchedule();

/** Tuesday 17:00 UTC — weekly reset (19:00 Madrid summer). */
export const ROTATION_EPOCH_MS = rotationSchedule.epochMs;

export const DUNGEON_ROTATION_WEEKS: readonly (readonly string[])[] =
  rotationSchedule.dungeonWeeks;

export const RAID_ROTATION_FALLBACK_WEEKS: readonly (readonly string[])[] =
  rotationSchedule.raidFallbackWeeks;

export function rotationWeekIndex(at = new Date()): number {
  const elapsed = at.getTime() - ROTATION_EPOCH_MS;
  if (elapsed < 0) return 0;
  return Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Confirmed dungeon pairs only — never modulo-extrapolate past the table.
 */
export function featuredDungeonSlugsForWeek(weekIndex: number): string[] {
  if (weekIndex < 0 || weekIndex >= DUNGEON_ROTATION_WEEKS.length) {
    return [];
  }
  const pair = DUNGEON_ROTATION_WEEKS[weekIndex];
  return pair ? [...pair] : [];
}

export function featuredRaidFallbackForWeek(weekIndex: number): string[] {
  if (!RAID_ROTATION_FALLBACK_WEEKS.length) return [];
  const pair =
    weekIndex >= 0 && weekIndex < RAID_ROTATION_FALLBACK_WEEKS.length
      ? RAID_ROTATION_FALLBACK_WEEKS[weekIndex]
      : RAID_ROTATION_FALLBACK_WEEKS[RAID_ROTATION_FALLBACK_WEEKS.length - 1];
  return pair ? [...pair].sort() : [];
}

export function weekBounds(weekIndex: number): {
  weekStart: string;
  weekEnd: string;
} {
  const startMs = ROTATION_EPOCH_MS + weekIndex * 7 * 24 * 60 * 60 * 1000;
  const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
  return {
    weekStart: new Date(startMs).toISOString(),
    weekEnd: new Date(endMs).toISOString(),
  };
}

type MilestoneActivity = {
  challengeObjectiveHashes?: number[];
};

type LiveMilestone = {
  activities?: MilestoneActivity[];
};

function milestoneHasWeeklyChallenge(live: LiveMilestone): boolean {
  return (live.activities ?? []).some(
    (activity) => (activity.challengeObjectiveHashes?.length ?? 0) > 0,
  );
}

export async function fetchFeaturedRaidsFromBungie(
  apiKey: string,
): Promise<string[]> {
  const response = await fetch(
    "https://www.bungie.net/Platform/Destiny2/Milestones/",
    {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 1800 },
    },
  );

  if (!response.ok) {
    throw new Error(`Bungie milestones request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    ErrorCode: number;
    Message?: string;
    Response?: Record<string, LiveMilestone>;
  };

  if (data.ErrorCode !== 1) {
    throw new Error(data.Message ?? `Bungie error ${data.ErrorCode}`);
  }

  const milestones = data.Response ?? {};
  const featured: string[] = [];

  for (const [milestoneHash, live] of Object.entries(milestones)) {
    const slug = RAID_MILESTONE_SLUGS[milestoneHash];
    if (!slug || EXCLUDED_FEATURED_RAID_SLUGS.has(slug)) continue;

    if (milestoneHasWeeklyChallenge(live)) {
      featured.push(slug);
    }
  }

  return featured.sort();
}

/** Display names → activity slugs (community articles / weekly posts). */
const DUNGEON_NAME_TO_SLUG: Record<string, string> = {
  "shattered throne": "the-shattered-throne",
  "the shattered throne": "the-shattered-throne",
  duality: "duality",
  "pit of heresy": "pit-of-heresy",
  "spire of the watcher": "spire-of-the-watcher",
  "ghosts of the deep": "ghosts-of-the-deep",
  "ghost of the deep": "ghosts-of-the-deep",
  "warlord's ruin": "warlords-ruin",
  "warlords ruin": "warlords-ruin",
  "warlords' ruin": "warlords-ruin",
  "grasp of avarice": "grasp-of-avarice",
  "vesper's host": "vespers-host",
  "vespers host": "vespers-host",
  "sundered doctrine": "sundered-doctrine",
  prophecy: "prophecy",
  equilibrium: "equilibrium",
};

const KYBER_HOME_URL = "https://kyberscorner.com/";
const KYBER_FEATURED_URL =
  "https://kyberscorner.com/destiny2/weekly-featured-raids-and-dungeons/";

const KYBER_FETCH_HEADERS = {
  "User-Agent": "d2-collector-featured-rotation/1.0",
  Accept: "text/html",
};

function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;|’/g, "'")
    .replace(/\s+/g, " ");
}

function weekStartDateLabel(weekStartIso: string): string {
  return new Date(weekStartIso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Find the first two known dungeon names in free text (order preserved). */
export function extractTwoDungeonSlugs(chunk: string): string[] | null {
  const compactChunk = String(chunk ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const entries = Object.entries(DUNGEON_NAME_TO_SLUG)
    .map(([name, slug]) => ({
      slug,
      compact: name.replace(/[^a-z0-9]/g, ""),
    }))
    .sort((a, b) => b.compact.length - a.compact.length);

  const found: string[] = [];
  let rest = compactChunk;
  while (found.length < 2 && rest.length) {
    let hit: { slug: string; idx: number; len: number } | null = null;
    for (const entry of entries) {
      if (found.includes(entry.slug)) continue;
      const idx = rest.indexOf(entry.compact);
      if (idx === -1) continue;
      if (
        !hit ||
        idx < hit.idx ||
        (idx === hit.idx && entry.compact.length > hit.len)
      ) {
        hit = { slug: entry.slug, idx, len: entry.compact.length };
      }
    }
    if (!hit) break;
    rest = rest.slice(hit.idx + hit.len);
    found.push(hit.slug);
  }
  return found.length === 2 ? found : null;
}

/**
 * Parse FEATURED DUNGEONS from a Kyber weekly reset overview post.
 * Requires the post's CURRENT WEEK start date to match `weekStartIso`.
 */
export function parseKyberFeaturedDungeons(
  html: string,
  weekStartIso: string,
): string[] | null {
  const text = htmlToPlainText(html);
  const label = weekStartDateLabel(weekStartIso);

  const currentWeek = text.match(
    /CURRENT WEEK\s+([A-Za-z]+)\s+(\d{1,2})\s*[–\-]\s*\d{1,2},?\s*(\d{4})/i,
  );
  if (currentWeek) {
    const startLabel = `${currentWeek[1]} ${currentWeek[2]}, ${currentWeek[3]}`;
    if (startLabel.toLowerCase() !== label.toLowerCase()) {
      return null;
    }
  } else if (!text.toLowerCase().includes(label.toLowerCase())) {
    return null;
  }

  const section = text.match(
    /FEATURED DUNGEONS\s+(.+?)(?=GRANDMASTER|FEATURED PANTHEON|LIVE EVENT|ZAVALA|Weekly Featured|PORTAL|$)/i,
  );
  if (!section) return null;
  return extractTwoDungeonSlugs(section[1] ?? "");
}

function sameDungeonPair(a: string[], b: string[]): boolean {
  if (!a.length || !b.length || a.length !== b.length) return false;
  return [...a].sort().join(",") === [...b].sort().join(",");
}

/**
 * Community sites often lag Tuesday reset and keep last week's pair.
 * Consecutive weeks never share the same featured dungeon pair.
 */
export function isStalePriorDungeonPair(
  weekIndex: number,
  pair: string[],
): boolean {
  if (weekIndex <= 0 || !pair.length) return false;
  const prior = featuredDungeonSlugsForWeek(weekIndex - 1);
  return prior.length > 0 && sameDungeonPair(pair, prior);
}

async function fetchLatestKyberWeeklyResetUrl(): Promise<string> {
  const response = await fetch(KYBER_HOME_URL, {
    headers: KYBER_FETCH_HEADERS,
    next: { revalidate: 1800 },
  });
  if (!response.ok) {
    throw new Error(`Kyber home fetch failed: ${response.status}`);
  }
  const html = await response.text();
  const links = [
    ...html.matchAll(
      /href="(https:\/\/kyberscorner\.com\/destiny-2-weekly-reset[^"#]+)"/gi,
    ),
  ].map((match) => match[1]);
  const unique = [...new Set(links.filter(Boolean))];
  if (!unique.length || !unique[0]) {
    throw new Error("No Kyber weekly reset post link found on homepage");
  }
  return unique[0];
}

/**
 * Live featured dungeon pair from Kyber (Bungie does not expose this).
 * Cached ~30m so a missed CI run cannot leave the site with empty dungeons.
 */
export async function fetchFeaturedDungeonsFromKyber(
  weekStartIso: string,
): Promise<string[]> {
  const resetUrl = await fetchLatestKyberWeeklyResetUrl();
  const response = await fetch(resetUrl, {
    headers: KYBER_FETCH_HEADERS,
    next: { revalidate: 1800 },
  });
  if (!response.ok) {
    throw new Error(`Kyber weekly reset fetch failed: ${response.status}`);
  }
  const html = await response.text();
  const pair = parseKyberFeaturedDungeons(html, weekStartIso);
  if (pair) return pair;

  const featuredResponse = await fetch(KYBER_FEATURED_URL, {
    headers: KYBER_FETCH_HEADERS,
    next: { revalidate: 1800 },
  });
  if (!featuredResponse.ok) {
    throw new Error(
      `Kyber featured page fetch failed: ${featuredResponse.status}`,
    );
  }
  const featuredHtml = await featuredResponse.text();
  const featuredText = htmlToPlainText(featuredHtml);
  const section = featuredText.match(
    /Featured Dungeons\s+(.+?)(?=Resources|FEATURED RAID AND DUNGEON|Share:|$)/i,
  );
  const fromFeatured = section
    ? extractTwoDungeonSlugs(section[1] ?? "")
    : null;
  if (!fromFeatured) {
    throw new Error(
      `Kyber has no featured dungeon pair for ${weekStartDateLabel(weekStartIso)}`,
    );
  }
  return fromFeatured;
}
