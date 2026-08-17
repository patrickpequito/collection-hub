import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const FORSAKEN_HUB: ExpansionHub = {
  slug: "forsaken",
  title: "Forsaken",
  titleSlug: "the-dreaming-city",
  triumphGroupSlug: "dreaming-city",
  seasonLabels: ["Forsaken"],
  seasonIconHashes: ["aeb95eb1abe8e45e1fe2573d6b3ab3c5"],
  seasonNumber: 4,
  destinationArmorSetNames: ["Reverie Dawn"],
  destinationTitle: "Destination // Dreaming City",
  destinationActivityTitle: "Dreaming City",
  destinationActivitySlug: "dreaming-city",
  destinationWeaponSourcePattern: /dreaming city/i,
  relatedRadSlugs: [
    "last-wish",
    "the-shattered-throne",
    "scourge-of-the-past",
  ],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /dreaming city|last wish|shattered throne|scourge of the past|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Raid and dungeons from the Forsaken era — open the full loot hubs.",
  triumphsGroupTitle: "Dreaming City // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with Forsaken. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Forsaken-era playlist loot found for the tracked activity pools.",
  indexImageFile: "last-wish.webp",
  available: true,
};
