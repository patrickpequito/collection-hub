import type { ActivityLootPage } from "@/types/activity-loot";
import { crotasEndLoot } from "@/data/rad-loot/crotas-end";
import { kingsFallLoot } from "@/data/rad-loot/kings-fall";
import { lastWishLoot } from "@/data/rad-loot/last-wish";
import { prophecyLoot } from "@/data/rad-loot/prophecy";
import { vaultOfGlassLoot } from "@/data/rad-loot/vault-of-glass";

const ACTIVITY_PAGES: Record<string, ActivityLootPage> = {
  "vault-of-glass": vaultOfGlassLoot,
  "crotas-end": crotasEndLoot,
  "kings-fall": kingsFallLoot,
  "last-wish": lastWishLoot,
  prophecy: prophecyLoot,
};

export function getActivityLootPage(slug: string): ActivityLootPage | null {
  return ACTIVITY_PAGES[slug] ?? null;
}
