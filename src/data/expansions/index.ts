import { BEYOND_LIGHT_HUB } from "@/data/expansions/beyond-light";
import { CURSE_OF_OSIRIS_HUB } from "@/data/expansions/curse-of-osiris";
import { FORSAKEN_HUB } from "@/data/expansions/forsaken";
import { LIGHTFALL_HUB } from "@/data/expansions/lightfall";
import { RENEGADES_HUB } from "@/data/expansions/renegades";
import { SHADOWKEEP_HUB } from "@/data/expansions/shadowkeep";
import { EDGE_OF_FATE_HUB } from "@/data/expansions/the-edge-of-fate";
import { FINAL_SHAPE_HUB } from "@/data/expansions/the-final-shape";
import { WITCH_QUEEN_HUB } from "@/data/expansions/the-witch-queen";
import { WARMIND_HUB } from "@/data/expansions/warmind";
import type {
  ExpansionHub,
  ExpansionIndexEntry,
} from "@/data/expansions/types";

/** Chronological expansion hubs with pages (Red War is index-only for now). */
export const EXPANSION_HUBS: readonly ExpansionHub[] = [
  CURSE_OF_OSIRIS_HUB,
  WARMIND_HUB,
  FORSAKEN_HUB,
  SHADOWKEEP_HUB,
  BEYOND_LIGHT_HUB,
  WITCH_QUEEN_HUB,
  LIGHTFALL_HUB,
  FINAL_SHAPE_HUB,
  EDGE_OF_FATE_HUB,
  RENEGADES_HUB,
];

/** Red War — shown on the index as a Coming soon placeholder. */
export const RED_WAR_INDEX_ENTRY: ExpansionIndexEntry = {
  slug: "red-war",
  title: "Red War",
  available: false,
  imageFile: "red-war.webp",
};

const hubsBySlug = new Map(
  EXPANSION_HUBS.map((hub) => [hub.slug, hub] as const),
);

export function getExpansionHub(slug: string): ExpansionHub | undefined {
  return hubsBySlug.get(slug);
}

export function getExpansionSlugs(): string[] {
  return EXPANSION_HUBS.map((hub) => hub.slug);
}

/** Newest first on the Expansions & Seasons index. */
export const EXPANSION_INDEX_ENTRIES: readonly ExpansionIndexEntry[] = [
  ...[...EXPANSION_HUBS].reverse().map((hub) => ({
    slug: hub.slug,
    title: hub.title,
    available: hub.available,
    imageFile: `${hub.slug}.webp`,
    fallbackImageFile: hub.indexImageFile,
    href: hub.available ? `/expansions/${hub.slug}` : undefined,
  })),
  RED_WAR_INDEX_ENTRY,
];
