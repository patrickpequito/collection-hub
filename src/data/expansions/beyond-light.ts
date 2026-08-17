import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const BEYOND_LIGHT_HUB: ExpansionHub = {
  slug: "beyond-light",
  title: "Beyond Light",
  titleSlug: "beyond-light",
  triumphGroupSlug: "europa",
  seasonLabels: ["Beyond Light"],
  seasonIconHashes: ["bce51cf90464e28026140df77c4eb6ce"],
  seasonNumber: 12,
  destinationArmorSetNames: ["Crystocrene"],
  destinationTitle: "Destination // Europa",
  destinationActivityTitle: "Europa",
  destinationActivitySlug: "europa",
  destinationWeaponSourcePattern: /europa/i,
  relatedRadSlugs: ["deep-stone-crypt"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /europa|deep stone crypt|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Raid from Beyond Light — open the full loot hub.",
  triumphsGroupTitle: "Europa // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with Beyond Light. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Beyond Light–era playlist loot found for the tracked activity pools.",
  indexImageFile: "deep-stone-crypt.webp",
  available: true,
};
