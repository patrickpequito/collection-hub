import { readFileSync } from "node:fs";
import path from "node:path";
import type { Destination } from "@/data/destinations";
import {
  DREAMING_CITY_CURSE,
  DREAMING_CITY_ROTATIONS,
  EUROPA_ROTATIONS,
  THRONE_WORLD_ROTATIONS,
  type ManualRotation,
} from "@/data/destinations/weekly-rotations";
import destinationLoot from "../../../data/destination-loot.json";
import { rotationWeekIndex } from "@/lib/rad-loot/featured-rotation";

export type WeeklyActivity = { label: string; name: string; detail: string };

type NightmareHunt = { name: string; boss: string; image: string | null };

const cycleIndex = (week: number, anchor: number, length: number) =>
  (((week - anchor) % length) + length) % length;

export type CurseState = { levels: string[]; current: number };

/** Dreaming City curse strength this week; null elsewhere or when not anchored yet. */
export function loadDestinationCurse(destination: Destination): CurseState | null {
  if (destination.weekly !== "dreaming-city" || DREAMING_CITY_CURSE.anchorWeek === null) return null;
  const { levels, anchorWeek } = DREAMING_CITY_CURSE;
  return { levels, current: cycleIndex(rotationWeekIndex(new Date()), anchorWeek, levels.length) };
}

function manualWeekly(rotations: ManualRotation[]): WeeklyActivity[] {
  const week = rotationWeekIndex(new Date());
  return rotations.flatMap((rotation) => {
    if (rotation.anchorWeek === null) return [];
    const entry = rotation.order[cycleIndex(week, rotation.anchorWeek, rotation.order.length)];
    return [{ label: rotation.label, name: entry.name, detail: entry.detail }];
  });
}

/** Public profile whose launchable activities reveal today's Wellspring (same as the Nightmare Hunt probe). */
const PROBE_PROFILE = "/Platform/Destiny2/3/Profile/4611686018473121985/?components=204";

const WELLSPRING = (destinationLoot as unknown as {
  wellspring?: Record<string, { mode: string; boss: string; drop: string }>;
}).wellspring ?? {};

/** Today's Wellspring encounter (daily reset), or null if Bungie is unreachable. */
async function loadWellspringToday(): Promise<WeeklyActivity | null> {
  const apiKey = process.env.BUNGIE_API_KEY?.trim();
  if (!apiKey) return null;
  try {
    const response = await fetch(`https://www.bungie.net${PROBE_PROFILE}`, {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 1800 },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      Response?: { characterActivities?: { data?: Record<string, { availableActivities: { activityHash: number }[] }> } };
    };
    const characters = Object.values(payload.Response?.characterActivities?.data ?? {});
    for (const character of characters) {
      for (const activity of character.availableActivities) {
        const encounter = WELLSPRING[String(activity.activityHash)];
        if (encounter) {
          return { label: "The Wellspring · today", name: encounter.boss, detail: `${encounter.mode} · drops ${encounter.drop}` };
        }
      }
    }
  } catch {
    // Card is skipped.
  }
  return null;
}

/** "This week" entries for a destination; empty when nothing is confirmed for it. */
export async function loadDestinationWeekly(destination: Destination): Promise<WeeklyActivity[]> {
  if (destination.weekly === "throne-world") {
    const wellspring = await loadWellspringToday();
    return [...manualWeekly(THRONE_WORLD_ROTATIONS), ...(wellspring ? [wellspring] : [])];
  }
  if (destination.weekly === "europa") return manualWeekly(EUROPA_ROTATIONS);
  if (destination.weekly === "dreaming-city") return manualWeekly(DREAMING_CITY_ROTATIONS);
  if (destination.weekly !== "nightmare-hunts") return [];
  try {
    const snapshot = JSON.parse(
      readFileSync(path.join(process.cwd(), "data/featured-activities.json"), "utf8"),
    ) as { weekIndex: number; featuredNightmareHunts?: NightmareHunt[] };
    if (snapshot.weekIndex !== rotationWeekIndex(new Date())) return [];
    return (snapshot.featuredNightmareHunts ?? []).map((hunt) => ({
      label: "Nightmare Hunt",
      name: hunt.name,
      detail: hunt.boss,
    }));
  } catch {
    return [];
  }
}
