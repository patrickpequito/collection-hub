import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const FINAL_SHAPE_HUB: ExpansionHub = {
  slug: "the-final-shape",
  title: "The Final Shape",
  titleSlug: "the-final-shape",
  triumphGroupSlug: "the-pale-heart",
  seasonLabels: ["The Final Shape"],
  seasonIconHashes: ["661c84a377389a3b8a1fc38b44189b41"],
  seasonNumber: 24,
  destinationArmorSetNames: ["First Ascent"],
  destinationTitle: "Destination // The Pale Heart",
  destinationActivityTitle: "The Pale Heart",
  destinationActivitySlug: "the-pale-heart",
  destinationWeaponSourcePattern: /pale heart/i,
  relatedRadSlugs: ["salvations-edge"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /pale heart|salvation.?s edge|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Raid from The Final Shape — open the full loot hub.",
  triumphsGroupTitle: "The Pale Heart // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with The Final Shape. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Final Shape–era playlist loot found for the tracked activity pools.",
  indexImageFile: "salvations-edge.webp",
  available: true,
};
