import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DESTINATIONS, destinationImageUrl, type Destination } from "@/data/destinations";
import {
  formatTrialsWeekRange,
  resolveTrialsFeaturedMaps,
  type TrialsFeaturedMapsResult,
} from "@/lib/activities/trials-featured-maps";
import { ironBannerWindowFor } from "@/lib/activities/trials-schedule";
import { loadDestinationCurse, loadDestinationWeekly } from "@/lib/destinations/weekly";
import { featuredActivityEntries } from "@/lib/rad-loot/featured-activities";
import { rotationWeekIndex, weekBounds } from "@/lib/rad-loot/featured-rotation";
import type { ActivityEntry } from "@/types/activity-loot";

const MS_FOUR_WEEKS = 28 * 24 * 60 * 60 * 1000;

/** Public profile whose launchable activities reveal this week's Nightfall and Pantheon bosses. */
const PROBE_PROFILE = "/Platform/Destiny2/3/Profile/4611686018473121985/?components=204";

/** Order of the destination strip; destinations without a `weekly` key show greyed out. */
const DESTINATION_STRIP = ["kepler", "the-pale-heart", "neomuna", "throne-world", "europa", "the-moon", "dreaming-city"];

type WeeklyActivityName = {
  kind: "nightfall" | "grandmaster" | "pantheon";
  name: string;
  difficulty?: string;
  /** Pantheon only: which boss pool the featured boss comes from. */
  pool?: "Reprise" | "Encore";
};

export type PantheonFeaturedBoss = {
  pool: "Reprise" | "Encore";
  boss: string;
  /** Art in public/images/pantheon/bosses, or null when it hasn't been added yet. */
  image: string | null;
};

/** "Insurrection Prime" → /images/pantheon/bosses/insurrection-prime.webp when the file exists. */
function pantheonBossImage(boss: string): string | null {
  const file = `/images/pantheon/bosses/${boss.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.webp`;
  return existsSync(path.join(process.cwd(), "public", file)) ? file : null;
}

export type DestinationWeek = {
  slug: string;
  name: string;
  imageUrl: string;
  href: string | null;
  /** null while the rotation isn't known yet (card is greyed out). */
  headline: string | null;
  cadence: "daily" | "weekly" | null;
};

export type HomeThisWeekData = {
  /** Next weekly reset (Tuesday 17:00 UTC). */
  weekEndMs: number;
  raids: ActivityEntry[];
  dungeons: ActivityEntry[];
  /** This week's Nightfall strike; `grandmaster` when the Grandmaster version is up. */
  nightfall: { strike: string; grandmaster: boolean } | null;
  /** This week's featured Pantheon bosses (one Reprise, one Encore). */
  pantheon: PantheonFeaturedBoss[];
  trials: TrialsFeaturedMapsResult;
  trialsRange: string;
  ironBanner: { live: boolean; startMs: number; endMs: number; nextStartMs: number };
  destinations: DestinationWeek[];
};

async function loadWeeklyFromProbe(): Promise<Pick<HomeThisWeekData, "nightfall" | "pantheon">> {
  const apiKey = process.env.BUNGIE_API_KEY?.trim();
  if (!apiKey) return { nightfall: null, pantheon: [] };
  try {
    const [names, response] = await Promise.all([
      readFile(path.join(process.cwd(), "data/weekly-activities.json"), "utf8").then(
        (raw) => JSON.parse(raw) as Record<string, WeeklyActivityName>,
      ),
      fetch(`https://www.bungie.net${PROBE_PROFILE}`, { headers: { "X-API-Key": apiKey }, next: { revalidate: 1800 } }),
    ]);
    if (!response.ok) return { nightfall: null, pantheon: [] };
    const payload = (await response.json()) as {
      Response?: { characterActivities?: { data?: Record<string, { availableActivities: { activityHash: number }[] }> } };
    };
    const found = Object.values(payload.Response?.characterActivities?.data ?? {})
      .flatMap((character) => character.availableActivities)
      .map((activity) => names[String(activity.activityHash)])
      .filter((entry): entry is WeeklyActivityName => Boolean(entry));
    const grandmaster = found.find((entry) => entry.kind === "grandmaster");
    const nightfall = grandmaster ?? found.find((entry) => entry.kind === "nightfall");
    return {
      nightfall: nightfall ? { strike: nightfall.name, grandmaster: Boolean(grandmaster) } : null,
      pantheon: (["Reprise", "Encore"] as const).flatMap((pool) => {
        const entry = found.find((candidate) => candidate.kind === "pantheon" && candidate.pool === pool);
        return entry ? [{ pool, boss: entry.name, image: pantheonBossImage(entry.name) }] : [];
      }),
    };
  } catch {
    return { nightfall: null, pantheon: [] };
  }
}

async function destinationWeek(destination: Destination): Promise<DestinationWeek> {
  const base = {
    slug: destination.slug,
    name: destination.name,
    imageUrl: destinationImageUrl(destination),
    href: destination.built ? `/activities/destinations/${destination.slug}` : null,
  };
  if (!destination.weekly) return { ...base, headline: null, cadence: null };
  const [weekly, curse] = [await loadDestinationWeekly(destination), loadDestinationCurse(destination)];
  // Throne World leads with today's Wellspring (daily reset).
  const daily = weekly.find((entry) => /today/i.test(entry.label));
  if (daily) return { ...base, headline: `Wellspring: ${daily.name}`, cadence: "daily" };
  const first = weekly[0];
  if (destination.weekly === "nightmare-hunts" && weekly.length) {
    return { ...base, headline: `Nightmare Hunts: ${weekly.map((entry) => entry.name).join(" · ")}`, cadence: "weekly" };
  }
  if (curse) {
    return { ...base, headline: `Curse: ${curse.levels[curse.current]}${first ? ` · ${first.name}` : ""}`, cadence: "weekly" };
  }
  return { ...base, headline: first ? `${first.label}: ${first.name}` : null, cadence: first ? "weekly" : null };
}

/** Weekly rotation snapshot for the home page (computed at request time). */
export async function loadHomeThisWeek(): Promise<HomeThisWeekData> {
  const now = Date.now();
  const [featured, trials, probe, destinations] = await Promise.all([
    featuredActivityEntries(),
    resolveTrialsFeaturedMaps(now),
    loadWeeklyFromProbe(),
    Promise.all(
      DESTINATION_STRIP.flatMap((slug) => {
        const destination = DESTINATIONS.find((entry) => entry.slug === slug);
        return destination ? [destinationWeek(destination)] : [];
      }),
    ),
  ]);
  const window = ironBannerWindowFor(now);
  const live = now >= window.startMs && now < window.endMs;

  return {
    weekEndMs: Date.parse(weekBounds(rotationWeekIndex(new Date(now))).weekEnd),
    raids: featured.raids,
    dungeons: featured.dungeons,
    ...probe,
    trials,
    trialsRange: formatTrialsWeekRange(trials.weekStart, trials.weekEnd),
    ironBanner: {
      live,
      startMs: window.startMs,
      endMs: window.endMs,
      nextStartMs: live ? window.startMs : window.startMs + MS_FOUR_WEEKS,
    },
    destinations,
  };
}
