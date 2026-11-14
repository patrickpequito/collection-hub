import { readFileSync } from "node:fs";
import path from "node:path";
import type { Destination } from "@/data/destinations";
import {
  DREAMING_CITY_CURSE,
  DREAMING_CITY_ROTATIONS,
  EUROPA_ROTATIONS,
  NEOMUNA_ROTATIONS,
  THRONE_WORLD_ROTATIONS,
  rotationKey,
  type ManualRotation,
} from "@/data/destinations/weekly-rotations";
import { readRotationHistory, readWeekOverride } from "@/lib/admin/weekly-store";
import { resolveRotation } from "@/lib/destinations/rotation-learning";
import destinationLoot from "../../../data/destination-loot.json";
import { rotationWeekIndex } from "@/lib/rad-loot/featured-rotation";

export type WeeklyActivity = {
  label: string;
  name: string;
  detail: string;
  /** Card art: Bungie pgcr path (/img/…) or local /images/… file. */
  image?: string;
  cadence?: "weekly" | "daily";
};

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

/** This week's value of each hand-entered rotation: admin pick, else the learned cycle, else the coded order. */
async function manualWeekly(destination: string, rotations: ManualRotation[]): Promise<WeeklyActivity[]> {
  const week = rotationWeekIndex(new Date());
  const [override, history] = await Promise.all([readWeekOverride(week), readRotationHistory()]);
  return rotations.flatMap((rotation) => {
    const key = rotationKey(destination, rotation);
    const picked = override?.rotations?.[key];
    if (rotation.anchorWeek === null && !picked && !history[key]) return [];
    const { entry } = resolveRotation(rotation, week, history[key], picked);
    return [{ label: rotation.label, name: entry.name, detail: entry.detail, image: entry.image, cadence: "weekly" as const }];
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
          return {
            label: "The Wellspring · today",
            name: encounter.boss,
            detail: `${encounter.mode} · drops ${encounter.drop}`,
            image: `/img/destiny_content/pgcr/wellspring_${encounter.mode === "Defend" ? "defend" : "attack"}_one.jpg`,
            cadence: "daily",
          };
        }
      }
    }
  } catch {
    // Card is skipped.
  }
  return null;
}

/** Terminal Overload moves between three Neomuna districts at the daily reset. */
const TERMINAL_OVERLOAD: Record<string, { district: string; image: string }> = {
  "508116160": { district: "Ahimsa Park", image: "/img/destiny_content/pgcr/neomuna_terminal_overload_frontline.jpg" },
  "2375923691": { district: "Límíng Harbor", image: "/img/destiny_content/pgcr/neomuna_terminal_overload_harbor.jpg" },
  "681459255": { district: "Zephyr Concourse", image: "/img/destiny_content/pgcr/neomuna_terminal_overload_avenue.jpg" },
};

/** Today's Terminal Overload district, or null if Bungie is unreachable. */
async function loadTerminalOverloadToday(): Promise<WeeklyActivity | null> {
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
    for (const character of Object.values(payload.Response?.characterActivities?.data ?? {})) {
      for (const activity of character.availableActivities) {
        const today = TERMINAL_OVERLOAD[String(activity.activityHash)];
        if (today) {
          return {
            label: "Terminal Overload · today",
            name: today.district,
            detail: "Shadow Legion public event",
            image: today.image,
            cadence: "daily",
          };
        }
      }
    }
  } catch {
    // Card is skipped.
  }
  return null;
}

/**
 * Kepler's weekly Fabled missions: a fixed three-week cycle of two story missions.
 * Anchor: the week of the Nov 17 2026 reset is The Invitation / Gouge (owner, in game).
 */
const KEPLER_FABLED_CYCLE: { name: string; image: string }[][] = [
  [
    { name: "The Invitation", image: "/img/destiny_content/pgcr/mission_touchdown.jpg" },
    { name: "Gouge", image: "/img/destiny_content/pgcr/mission_overseer.jpg" },
  ],
  [
    { name: "Commencement", image: "/img/destiny_content/pgcr/mission_gate.jpg" },
    { name: "Charge", image: "/img/destiny_content/pgcr/mission_energize.jpg" },
  ],
  [
    { name: "Quarantine", image: "/img/destiny_content/pgcr/mission_offline.jpg" },
    { name: "The Message", image: "/img/destiny_content/pgcr/mission_voracious.jpg" },
  ],
];
const KEPLER_ANCHOR_WEEK = rotationWeekIndex(new Date("2026-11-14T12:00:00Z"));

function keplerWeekly(): WeeklyActivity[] {
  const week = KEPLER_FABLED_CYCLE[cycleIndex(rotationWeekIndex(new Date()), KEPLER_ANCHOR_WEEK, KEPLER_FABLED_CYCLE.length)];
  return week.map((mission) => ({ label: "Fabled mission", name: mission.name, detail: "", image: mission.image, cadence: "weekly" }));
}

/** "This week" entries for a destination; empty when nothing is confirmed for it. */
export async function loadDestinationWeekly(destination: Destination): Promise<WeeklyActivity[]> {
  if (destination.weekly === "throne-world") {
    const wellspring = await loadWellspringToday();
    return [...(await manualWeekly("throne-world", THRONE_WORLD_ROTATIONS)), ...(wellspring ? [wellspring] : [])];
  }
  if (destination.weekly === "europa") return manualWeekly("europa", EUROPA_ROTATIONS);
  if (destination.weekly === "neomuna") {
    const terminalOverload = await loadTerminalOverloadToday();
    return [...(await manualWeekly("neomuna", NEOMUNA_ROTATIONS)), ...(terminalOverload ? [terminalOverload] : [])];
  }
  if (destination.weekly === "dreaming-city") return manualWeekly("dreaming-city", DREAMING_CITY_ROTATIONS);
  if (destination.weekly === "kepler") return keplerWeekly();
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
      image: hunt.image ?? undefined,
      cadence: "weekly" as const,
    }));
  } catch {
    return [];
  }
}
