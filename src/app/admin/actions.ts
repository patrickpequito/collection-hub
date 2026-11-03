"use server";

import { revalidatePath, updateTag } from "next/cache";
import { MANUAL_ROTATION_GROUPS, rotationKey } from "@/data/destinations/weekly-rotations";
import { ADMIN_WEEK_TAG, clearWeek, isAdminMembership, saveWeek, type AdminWeekOverride } from "@/lib/admin/weekly-store";
import { rotationWeekIndex } from "@/lib/rad-loot/featured-rotation";
import { getSession } from "@/lib/session";

export type AdminSaveState = { ok: boolean; message: string } | null;

function refreshSite() {
  updateTag(ADMIN_WEEK_TAG);
  revalidatePath("/", "layout");
}

/** Saves this week's picks from /admin (owner only) and records the "seen in game" rotations. */
export async function saveAdminWeek(_previous: AdminSaveState, formData: FormData): Promise<AdminSaveState> {
  const session = await getSession();
  if (!isAdminMembership(session?.membershipId)) return { ok: false, message: "Not allowed." };

  const week = rotationWeekIndex(new Date());
  const pick = (name: string) => String(formData.get(name) ?? "").trim();
  const pair = (a: string, b: string) => {
    const values = [pick(a), pick(b)];
    return values.every(Boolean) && values[0] !== values[1] ? values : undefined;
  };

  const rotations: Record<string, string> = {};
  const confirmed: string[] = [];
  for (const group of MANUAL_ROTATION_GROUPS) {
    for (const rotation of group.rotations) {
      const key = rotationKey(group.destination, rotation);
      const value = pick(`rotation:${key}`);
      if (!value) continue;
      rotations[key] = value;
      if (formData.get(`seen:${key}`) === "on") confirmed.push(key);
    }
  }

  const override: AdminWeekOverride = {
    featuredRaids: pair("raid1", "raid2"),
    featuredDungeons: pair("dungeon1", "dungeon2"),
    pantheon: pick("pantheonReprise") || pick("pantheonEncore")
      ? { Reprise: pick("pantheonReprise") || undefined, Encore: pick("pantheonEncore") || undefined }
      : undefined,
    rotations,
  };
  try {
    await saveWeek(week, override, confirmed);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not save." };
  }
  refreshSite();
  return { ok: true, message: `Week saved · ${confirmed.length} rotation${confirmed.length === 1 ? "" : "s"} added to the history.` };
}

/** Drops this week's picks so everything goes back to the automatic sources. */
export async function resetAdminWeek(): Promise<AdminSaveState> {
  const session = await getSession();
  if (!isAdminMembership(session?.membershipId)) return { ok: false, message: "Not allowed." };
  try {
    await clearWeek(rotationWeekIndex(new Date()));
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not reset." };
  }
  refreshSite();
  return { ok: true, message: "Back to automatic for this week." };
}
