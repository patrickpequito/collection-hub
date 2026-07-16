import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

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

const schedule = JSON.parse(
  readFileSync(
    resolve(root, "public/data/featured-rotation-schedule.json"),
    "utf8",
  ),
);

export const ROTATION_EPOCH_MS = Date.parse(schedule.epochUtc);
export const DUNGEON_ROTATION_WEEKS = schedule.dungeonWeeks;
export const RAID_ROTATION_FALLBACK_WEEKS = schedule.raidFallbackWeeks ?? [];

export function rotationWeekIndex(at = new Date()) {
  const elapsed = at.getTime() - ROTATION_EPOCH_MS;
  if (elapsed < 0) return 0;
  return Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
}

export function featuredDungeonSlugsForWeek(weekIndex) {
  const pair =
    DUNGEON_ROTATION_WEEKS[weekIndex % DUNGEON_ROTATION_WEEKS.length] ??
    DUNGEON_ROTATION_WEEKS[0];
  return [...pair];
}

export function featuredRaidFallbackForWeek(weekIndex) {
  if (!RAID_ROTATION_FALLBACK_WEEKS.length) return [];
  const pair =
    RAID_ROTATION_FALLBACK_WEEKS[
      weekIndex % RAID_ROTATION_FALLBACK_WEEKS.length
    ] ?? RAID_ROTATION_FALLBACK_WEEKS[0];
  return [...pair].sort();
}

export function weekBounds(weekIndex) {
  const startMs = ROTATION_EPOCH_MS + weekIndex * 7 * 24 * 60 * 60 * 1000;
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
