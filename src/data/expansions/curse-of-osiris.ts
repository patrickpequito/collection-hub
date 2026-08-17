import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const CURSE_OF_OSIRIS_HUB: ExpansionHub = {
  slug: "curse-of-osiris",
  title: "Curse of Osiris",
  titleSlug: null,
  triumphGroupSlug: null,
  seasonLabels: ["Curse of Osiris"],
  seasonIconHashes: ["7ba9d804508dd083ec20fcdb8ba0869d"],
  seasonNumber: 2,
  destinationArmorSetNames: ["Kairos Function"],
  destinationTitle: "Destination // Mercury",
  destinationActivityTitle: "Mercury",
  destinationActivitySlug: "mercury",
  destinationWeaponSourcePattern: /mercury/i,
  relatedRadSlugs: ["eater-of-worlds"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /mercury|eater of worlds|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Raid lair from Curse of Osiris — open the full loot hub.",
  triumphsGroupTitle: "Triumphs",
  exoticPanelDescription:
    "Exotics introduced with Curse of Osiris. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Curse of Osiris–era playlist loot found for the tracked activity pools.",
  indexImageFile: "eater-of-worlds.webp",
  available: true,
};
