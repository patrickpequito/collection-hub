import type { SeasonHub } from "@/data/seasons/types";
import { SEASON_OF_ARRIVALS_HUB } from "@/data/seasons/season-of-arrivals";
import { SEASON_OF_THE_CHOSEN_HUB } from "@/data/seasons/season-of-the-chosen";
import { SEASON_OF_DAWN_HUB } from "@/data/seasons/season-of-dawn";
import { SEASON_OF_THE_HUNT_HUB } from "@/data/seasons/season-of-the-hunt";
import { SEASON_OF_THE_LOST_HUB } from "@/data/seasons/season-of-the-lost";
import { SEASON_OF_THE_SPLICER_HUB } from "@/data/seasons/season-of-the-splicer";
import { SEASON_OF_THE_UNDYING_HUB } from "@/data/seasons/season-of-the-undying";
import { SEASON_OF_THE_WORTHY_HUB } from "@/data/seasons/season-of-the-worthy";

export type { SeasonIndexEntry } from "@/data/seasons/index-entries";
export {
  SEASON_INDEX_ENTRIES,
  SEASONS_BY_EXPANSION_SLUG,
} from "@/data/seasons/index-entries";

const SEASON_HUBS: Record<string, SeasonHub> = {
  [SEASON_OF_THE_UNDYING_HUB.slug]: SEASON_OF_THE_UNDYING_HUB,
  [SEASON_OF_DAWN_HUB.slug]: SEASON_OF_DAWN_HUB,
  [SEASON_OF_THE_WORTHY_HUB.slug]: SEASON_OF_THE_WORTHY_HUB,
  [SEASON_OF_ARRIVALS_HUB.slug]: SEASON_OF_ARRIVALS_HUB,
  [SEASON_OF_THE_HUNT_HUB.slug]: SEASON_OF_THE_HUNT_HUB,
  [SEASON_OF_THE_CHOSEN_HUB.slug]: SEASON_OF_THE_CHOSEN_HUB,
  [SEASON_OF_THE_SPLICER_HUB.slug]: SEASON_OF_THE_SPLICER_HUB,
  [SEASON_OF_THE_LOST_HUB.slug]: SEASON_OF_THE_LOST_HUB,
};

export const PUBLISHED_SEASON_SLUGS = new Set(
  Object.values(SEASON_HUBS)
    .filter((hub) => hub.available)
    .map((hub) => hub.slug),
);

export function getSeasonHub(slug: string): SeasonHub | undefined {
  return SEASON_HUBS[slug];
}

export function getSeasonSlugs(): string[] {
  return Object.keys(SEASON_HUBS);
}
