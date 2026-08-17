import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const SHADOWKEEP_HUB: ExpansionHub = {
  slug: "shadowkeep",
  title: "Shadowkeep",
  titleSlug: "shadowkeep",
  triumphGroupSlug: "the-moon",
  seasonLabels: ["Shadowkeep"],
  seasonIconHashes: ["a15754752f40aaf7b1b00aadb70a8f35"],
  seasonNumber: 8,
  destinationArmorSetNames: ["Dreambane"],
  destinationTitle: "Destination // The Moon",
  destinationActivityTitle: "The Moon",
  destinationActivitySlug: "the-moon",
  destinationWeaponSourcePattern: /the moon|\bluna\b/i,
  relatedRadSlugs: ["garden-of-salvation", "pit-of-heresy"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /the moon|\bluna\b|garden of salvation|pit of heresy|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Raid and dungeon from Shadowkeep — open the full loot hubs.",
  triumphsGroupTitle: "The Moon // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with Shadowkeep. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Shadowkeep-era playlist loot found for the tracked activity pools.",
  indexImageFile: "garden-of-salvation.webp",
  available: true,
};
