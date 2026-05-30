import type { ActivityLootPage } from "@/types/activity-loot";
import { crotasEndLoot } from "@/data/rad-loot/crotas-end";
import { vaultOfGlassLoot } from "@/data/rad-loot/vault-of-glass";

const ACTIVITY_PAGES: Record<string, ActivityLootPage> = {
  "vault-of-glass": vaultOfGlassLoot,
  "crotas-end": crotasEndLoot,
};

export function getActivityLootPage(slug: string): ActivityLootPage | null {
  return ACTIVITY_PAGES[slug] ?? null;
}
