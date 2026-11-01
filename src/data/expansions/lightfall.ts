import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const LIGHTFALL_HUB: ExpansionHub = {
  slug: "lightfall",
  title: "Lightfall",
  titleSlug: "lightfall",
  triumphGroupSlug: "neomuna",
  seasonLabels: ["Lightfall"],
  seasonIconHashes: ["fc02418ad2002351a3f88faa5b14eb88"],
  seasonNumber: 20,
  destinationArmorSetNames: ["Thunderhead"],
  destinationArmorPreviewFiles: ["neomuna.webp"],
  destinationTitle: "Destination // Neomuna",
  destinationActivityTitle: "Neomuna",
  destinationActivitySlug: "neomuna",
  destinationWeaponSourcePattern: /neomuna/i,
  // Terminal Overload and campaign weapons: Neomuna loot, not world loot.
  destinationWeaponExtraNames: [
    "Basso Ostinato",
    "Circular Logic",
    "Synchronic Roulette",
    "Dimensional Hypotrochoid",
    "Phyllotactic Spiral",
    "Volta Bracket",
  ],
  relatedRadSlugs: ["root-of-nightmares"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /neomuna|root of nightmares|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Raid from Lightfall — open the full loot hub.",
  triumphsGroupTitle: "Neomuna // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with Lightfall. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Lightfall-era playlist loot found for the tracked activity pools.",
  indexImageFile: "root-of-nightmares.webp",
  trailerYoutubeId: "uZdYuxAREMw",
  available: true,
};
