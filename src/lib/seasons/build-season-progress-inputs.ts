import { getSeasonHub } from "@/data/seasons";
import type { SeasonProgressInputs } from "@/lib/seasons/season-progress";
import { resolveSeasonLoot } from "@/lib/seasons/resolve-season-loot";

export async function buildSeasonProgressInputs(
  slug: string,
): Promise<SeasonProgressInputs> {
  const hub = getSeasonHub(slug);
  if (!hub) {
    throw new Error(`Missing season hub: ${slug}`);
  }

  const loot = await resolveSeasonLoot(hub);

  return {
    slug,
    progressTotal: loot.progressTotal,
    progressOwnershipGroups: loot.progressOwnershipGroups,
  };
}
