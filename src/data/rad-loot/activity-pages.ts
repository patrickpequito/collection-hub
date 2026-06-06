import type { ActivityLootPage } from "@/types/activity-loot";
import { crotasEndLoot } from "@/data/rad-loot/crotas-end";
import { deepStoneCryptLoot } from "@/data/rad-loot/deep-stone-crypt";
import { gardenOfSalvationLoot } from "@/data/rad-loot/garden-of-salvation";
import { kingsFallLoot } from "@/data/rad-loot/kings-fall";
import { lastWishLoot } from "@/data/rad-loot/last-wish";
import { pitOfHeresyLoot } from "@/data/rad-loot/pit-of-heresy";
import { prophecyLoot } from "@/data/rad-loot/prophecy";
import { rootOfNightmaresLoot } from "@/data/rad-loot/root-of-nightmares";
import { salvationsEdgeLoot } from "@/data/rad-loot/salvations-edge";
import { theDesertPerpetualLoot } from "@/data/rad-loot/the-desert-perpetual";
import { theShatteredThroneLoot } from "@/data/rad-loot/the-shattered-throne";
import { vaultOfGlassLoot } from "@/data/rad-loot/vault-of-glass";
import { vowOfTheDiscipleLoot } from "@/data/rad-loot/vow-of-the-disciple";

const ACTIVITY_PAGES: Record<string, ActivityLootPage> = {
  "vault-of-glass": vaultOfGlassLoot,
  "crotas-end": crotasEndLoot,
  "kings-fall": kingsFallLoot,
  "last-wish": lastWishLoot,
  "garden-of-salvation": gardenOfSalvationLoot,
  "deep-stone-crypt": deepStoneCryptLoot,
  "vow-of-the-disciple": vowOfTheDiscipleLoot,
  "root-of-nightmares": rootOfNightmaresLoot,
  "salvations-edge": salvationsEdgeLoot,
  "the-desert-perpetual": theDesertPerpetualLoot,
  prophecy: prophecyLoot,
  "pit-of-heresy": pitOfHeresyLoot,
  "the-shattered-throne": theShatteredThroneLoot,
};

export function getActivityLootPage(slug: string): ActivityLootPage | null {
  return ACTIVITY_PAGES[slug] ?? null;
}
