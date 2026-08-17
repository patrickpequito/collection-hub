import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const EDGE_OF_FATE_HUB: ExpansionHub = {
  slug: "the-edge-of-fate",
  title: "The Edge of Fate",
  titleSlug: "the-edge-of-fate",
  triumphGroupSlug: "kepler",
  seasonLabels: ["The Edge of Fate"],
  seasonIconHashes: [
    "4376a7d734583ae347acf9732aa3bb43",
    "249813e647271a8227bae0d8a39ed505",
    "6129365b4fad6754f2b8c4478fc3c4ac",
  ],
  seasonNumber: 27,
  destinationArmorSetNames: ["AION Adapter", "AION Renewal"],
  destinationTitle: "Destination // Kepler",
  destinationActivityTitle: "Kepler",
  destinationActivitySlug: "kepler",
  destinationWeaponSourcePattern: /kepler/i,
  relatedRadSlugs: ["the-desert-perpetual"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /kepler|desert perpetual|edge of fate|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Raid from The Edge of Fate — open the full loot hub.",
  triumphsGroupTitle: "Kepler // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with The Edge of Fate. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Edge of Fate–era playlist loot found for the tracked activity pools.",
  indexImageFile: "the-desert-perpetual.webp",
  available: true,
};
