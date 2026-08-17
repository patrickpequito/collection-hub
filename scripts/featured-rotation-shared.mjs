/**
 * Shared featured raid/dungeon rotation helpers (Node scripts).
 *
 * Raids: Bungie public milestones (weekly challenge).
 * Dungeons: Kyber's Corner weekly reset (primary), Blueberries "Dungeon this
 * week" cards (fallback). Bungie does not expose featured dungeons publicly.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const SCHEDULE_PATH = resolve(root, "data/featured-rotation-schedule.json");

export const RAID_MILESTONE_SLUGS = {
  1888320892: "vault-of-glass",
  540415767: "crotas-end",
  292102995: "kings-fall",
  3181387331: "last-wish",
  2712317338: "garden-of-salvation",
  541780856: "deep-stone-crypt",
  2136320298: "vow-of-the-disciple",
  3699252268: "root-of-nightmares",
  4196566271: "salvations-edge",
};

export const EXCLUDED_FEATURED_RAID_SLUGS = new Set([
  "the-desert-perpetual",
  "the-pantheon",
]);

/** Display names → activity slugs (community articles / weekly posts). */
export const DUNGEON_NAME_TO_SLUG = {
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
const BLUEBERRIES_ROTATION_URL =
  "https://www.blueberries.gg/leveling/destiny-2-raid-dungeon-rotation/";

const FETCH_HEADERS = {
  "User-Agent": "d2-collector-featured-rotation/1.0 (+https://github.com/)",
  Accept: "text/html",
};

function loadSchedule() {
  return JSON.parse(readFileSync(SCHEDULE_PATH, "utf8"));
}

let schedule = loadSchedule();

export function reloadSchedule() {
  schedule = loadSchedule();
  return schedule;
}

export const ROTATION_EPOCH_MS = Date.parse(schedule.epochUtc);

export function getDungeonRotationWeeks() {
  return schedule.dungeonWeeks;
}

export function getRaidFallbackWeeks() {
  return schedule.raidFallbackWeeks ?? [];
}

/** @deprecated use getDungeonRotationWeeks() — kept for older imports */
export const DUNGEON_ROTATION_WEEKS = schedule.dungeonWeeks;
/** @deprecated use getRaidFallbackWeeks() */
export const RAID_ROTATION_FALLBACK_WEEKS = schedule.raidFallbackWeeks ?? [];

export function rotationWeekIndex(at = new Date()) {
  const elapsed = at.getTime() - Date.parse(schedule.epochUtc);
  if (elapsed < 0) return 0;
  return Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Known confirmed dungeon pairs only — never modulo-extrapolate past the table.
 */
export function featuredDungeonSlugsForWeek(weekIndex) {
  const weeks = schedule.dungeonWeeks;
  if (weekIndex < 0 || weekIndex >= weeks.length) return [];
  return [...weeks[weekIndex]];
}

export function featuredRaidFallbackForWeek(weekIndex) {
  const weeks = schedule.raidFallbackWeeks ?? [];
  if (!weeks.length) return [];
  if (weekIndex < 0 || weekIndex >= weeks.length) {
    return [...(weeks[weeks.length - 1] ?? [])].sort();
  }
  return [...weeks[weekIndex]].sort();
}

export function weekBounds(weekIndex) {
  const epochMs = Date.parse(schedule.epochUtc);
  const startMs = epochMs + weekIndex * 7 * 24 * 60 * 60 * 1000;
  const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
  return {
    weekStart: new Date(startMs).toISOString(),
    weekEnd: new Date(endMs).toISOString(),
  };
}

export function milestoneHasWeeklyChallenge(live) {
  return (live.activities ?? []).some(
    (activity) => (activity.challengeObjectiveHashes?.length ?? 0) > 0,
  );
}

export function featuredRaidsFromMilestones(milestones) {
  const featured = [];

  for (const [milestoneHash, live] of Object.entries(milestones)) {
    const slug = RAID_MILESTONE_SLUGS[milestoneHash];
    if (!slug || EXCLUDED_FEATURED_RAID_SLUGS.has(slug)) continue;
    if (milestoneHasWeeklyChallenge(live)) featured.push(slug);
  }

  return featured.sort();
}

export function dungeonSlugFromName(name) {
  const key = String(name ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (DUNGEON_NAME_TO_SLUG[key]) return DUNGEON_NAME_TO_SLUG[key];

  const compact = key.replace(/[^a-z0-9]/g, "");
  for (const [label, slug] of Object.entries(DUNGEON_NAME_TO_SLUG)) {
    if (label.replace(/[^a-z0-9]/g, "") === compact) return slug;
  }
  return null;
}

function htmlToPlainText(html) {
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

function weekStartDateLabel(weekStartIso) {
  const date = new Date(weekStartIso);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Find the first two known dungeon names in free text (order preserved). */
export function extractTwoDungeonSlugs(chunk) {
  const compactChunk = String(chunk ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const entries = Object.entries(DUNGEON_NAME_TO_SLUG)
    .map(([name, slug]) => ({
      slug,
      compact: name.replace(/[^a-z0-9]/g, ""),
    }))
    .sort((a, b) => b.compact.length - a.compact.length);

  const found = [];
  let rest = compactChunk;
  while (found.length < 2 && rest.length) {
    let hit = null;
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
export function parseKyberFeaturedDungeons(html, weekStartIso) {
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
  return extractTwoDungeonSlugs(section[1]);
}

export async function fetchLatestKyberWeeklyResetUrl() {
  const response = await fetch(KYBER_HOME_URL, { headers: FETCH_HEADERS });
  if (!response.ok) {
    throw new Error(`Kyber home fetch failed: ${response.status}`);
  }
  const html = await response.text();
  const links = [
    ...html.matchAll(
      /href="(https:\/\/kyberscorner\.com\/destiny-2-weekly-reset[^"#]+)"/gi,
    ),
  ].map((match) => match[1]);
  const unique = [...new Set(links)];
  if (!unique.length) {
    throw new Error("No Kyber weekly reset post link found on homepage");
  }
  return unique[0];
}

export async function fetchFeaturedDungeonsFromKyber(weekStartIso) {
  const resetUrl = await fetchLatestKyberWeeklyResetUrl();
  const response = await fetch(resetUrl, { headers: FETCH_HEADERS });
  if (!response.ok) {
    throw new Error(`Kyber weekly reset fetch failed: ${response.status}`);
  }
  const html = await response.text();
  const pair = parseKyberFeaturedDungeons(html, weekStartIso);
  if (pair) return pair;

  // Secondary: dedicated featured RAD page (sometimes updates first).
  const featuredResponse = await fetch(KYBER_FEATURED_URL, {
    headers: FETCH_HEADERS,
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
  const fromFeatured = section ? extractTwoDungeonSlugs(section[1]) : null;
  if (!fromFeatured) {
    throw new Error(
      `Kyber has no featured dungeon pair for ${weekStartDateLabel(weekStartIso)}`,
    );
  }
  return fromFeatured;
}

/**
 * Blueberries "Dungeon this week" cards (live rotator), not the long calendar.
 */
export function parseBlueberriesDungeonThisWeek(html) {
  const text = htmlToPlainText(html);
  const section = text.match(
    /Dungeon this week\s+(.+?)(?=Featured Dungeon Weapons|Weekly Dungeon rotation|Monument of Triumph calendar|$)/i,
  );
  if (!section) return null;
  return extractTwoDungeonSlugs(section[1]);
}

export async function fetchFeaturedDungeonsFromBlueberries() {
  const response = await fetch(BLUEBERRIES_ROTATION_URL, {
    headers: FETCH_HEADERS,
  });
  if (!response.ok) {
    throw new Error(`Blueberries fetch failed: ${response.status}`);
  }
  const html = await response.text();
  const pair = parseBlueberriesDungeonThisWeek(html);
  if (!pair) {
    throw new Error('Blueberries "Dungeon this week" cards not found');
  }
  return pair;
}

/**
 * Persist a confirmed dungeon pair for weekIndex (append or replace).
 * Keeps schedule.json as the source of truth for later weeks / offline fallback.
 */
export function upsertDungeonWeek(weekIndex, slugs) {
  const current = loadSchedule();
  const weeks = [...current.dungeonWeeks];
  const pair = [...slugs];

  while (weeks.length < weekIndex) {
    // Do not invent pairs for skipped weeks.
    break;
  }

  if (weekIndex < weeks.length) {
    weeks[weekIndex] = pair;
  } else if (weekIndex === weeks.length) {
    weeks.push(pair);
  } else {
    throw new Error(
      `Cannot upsert dungeon week ${weekIndex}: schedule only has ${weeks.length} confirmed weeks (append in order)`,
    );
  }

  const next = {
    ...current,
    dungeonWeeks: weeks,
    sourceNotes: `${current.sourceNotes ?? ""}\nWeek ${weekIndex} confirmed ${new Date().toISOString().slice(0, 10)}: ${pair.join(" + ")}.`.trim(),
  };
  writeFileSync(SCHEDULE_PATH, `${JSON.stringify(next, null, 2)}\n`);
  schedule = next;
  return next;
}
