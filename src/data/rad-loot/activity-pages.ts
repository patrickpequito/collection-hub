import type { ActivityLootPage } from "@/types/activity-loot";
import { crotasEndLoot } from "@/data/rad-loot/crotas-end";
import { deepStoneCryptLoot } from "@/data/rad-loot/deep-stone-crypt";
import { dualityLoot } from "@/data/rad-loot/duality";
import { equilibriumLoot } from "@/data/rad-loot/equilibrium";
import { gardenOfSalvationLoot } from "@/data/rad-loot/garden-of-salvation";
import { ghostsOfTheDeepLoot } from "@/data/rad-loot/ghosts-of-the-deep";
import { graspOfAvariceLoot } from "@/data/rad-loot/grasp-of-avarice";
import { kingsFallLoot } from "@/data/rad-loot/kings-fall";
import { lastWishLoot } from "@/data/rad-loot/last-wish";
import { pitOfHeresyLoot } from "@/data/rad-loot/pit-of-heresy";
import { prophecyLoot } from "@/data/rad-loot/prophecy";
import { rootOfNightmaresLoot } from "@/data/rad-loot/root-of-nightmares";
import { salvationsEdgeLoot } from "@/data/rad-loot/salvations-edge";
import { spireOfTheWatcherLoot } from "@/data/rad-loot/spire-of-the-watcher";
import { sunderedDoctrineLoot } from "@/data/rad-loot/sundered-doctrine";
import { theDesertPerpetualLoot } from "@/data/rad-loot/the-desert-perpetual";
import { theShatteredThroneLoot } from "@/data/rad-loot/the-shattered-throne";
import { vaultOfGlassLoot } from "@/data/rad-loot/vault-of-glass";
import { vespersHostLoot } from "@/data/rad-loot/vespers-host";
import { vowOfTheDiscipleLoot } from "@/data/rad-loot/vow-of-the-disciple";
import { warlordsRuinLoot } from "@/data/rad-loot/warlords-ruin";

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
  "grasp-of-avarice": graspOfAvariceLoot,
  duality: dualityLoot,
  "spire-of-the-watcher": spireOfTheWatcherLoot,
  "ghosts-of-the-deep": ghostsOfTheDeepLoot,
  "warlords-ruin": warlordsRuinLoot,
  "vespers-host": vespersHostLoot,
  "sundered-doctrine": sunderedDoctrineLoot,
  equilibrium: equilibriumLoot,
};

export function getActivityLootPage(slug: string): ActivityLootPage | null {
  return ACTIVITY_PAGES[slug] ?? null;
}
