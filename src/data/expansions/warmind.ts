import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const WARMIND_HUB: ExpansionHub = {
  slug: "warmind",
  title: "Warmind",
  titleSlug: null,
  triumphGroupSlug: null,
  seasonLabels: ["Warmind"],
  seasonIconHashes: ["da5f961ef97b78293cc498978c10e178"],
  seasonNumber: 3,
  destinationArmorSetNames: [],
  destinationTitle: "Destination // Mars",
  destinationActivityTitle: "Mars",
  destinationActivitySlug: "mars",
  destinationWeaponSourcePattern: /mars|warmind|braytech|data recovery/i,
  relatedRadSlugs: ["spire-of-stars"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /mars|warmind|spire of stars|eververse|bright engram/i,
  raidsDungeonsBlurb: "Raid lair from Warmind — open the full loot hub.",
  triumphsGroupTitle: "Triumphs",
  exoticPanelDescription:
    "Exotics introduced with Warmind. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Warmind-era playlist loot found for the tracked activity pools.",
  indexImageFile: "spire-of-stars.webp",
  available: true,
};
