import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

export const RENEGADES_HUB: ExpansionHub = {
  slug: "renegades",
  title: "Renegades",
  titleSlug: "renegades",
  triumphGroupSlug: "renegades",
  seasonLabels: ["Renegades"],
  seasonIconHashes: ["95f7754d52d6016fdc445fb62aa7a31e"],
  seasonNumber: 28,
  destinationArmorSetNames: ["Shrewd Survivor", "Thriving Survivor"],
  destinationTitle: "Destination // Renegades",
  destinationActivityTitle: "Renegades",
  destinationActivitySlug: "renegades",
  destinationWeaponSourcePattern: /source:\s*renegades/i,
  relatedRadSlugs: ["equilibrium"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /source:\s*renegades|equilibrium|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Dungeon from Renegades — open the full loot hub.",
  triumphsGroupTitle: "Renegades // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with Renegades. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Renegades-era playlist loot found for the tracked activity pools.",
  indexImageFile: "equilibrium.webp",
  available: true,
};
