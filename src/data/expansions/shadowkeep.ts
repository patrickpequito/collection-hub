import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

/**
 * Shadowkeep expansion hub — Layout B (completionist dashboard).
 */
export const SHADOWKEEP_HUB: ExpansionHub = {
  slug: "shadowkeep",
  title: "Shadowkeep",
  titleSlug: "shadowkeep",
  triumphGroupSlug: "the-moon",
  seasonLabels: ["Shadowkeep"],
  seasonIconHashes: ["a15754752f40aaf7b1b00aadb70a8f35"],
  seasonNumber: 8,
  destinationArmorSetNames: ["Dreambane"],
  destinationArmorPreviewFiles: ["dreambane.webp"],
  destinationTitle: "Destination // The Moon",
  destinationActivityTitle: "The Moon",
  destinationActivitySlug: "the-moon",
  // Prefer "The Moon" / Altars — avoid bare "luna" (false positives elsewhere).
  destinationWeaponSourcePattern: /the moon|altars of sorrow/i,
  destinationWeaponExtraNames: [
    "Loud Lullaby",
    "Every Waking Moment",
    "Dream Breaker",
    "One Small Step",
    "Tranquility",
    "Love and Death",
    "A Fine Memorial",
    "Night Terror",
  ],
  relatedRadSlugs: ["garden-of-salvation", "pit-of-heresy"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /the moon|altars of sorrow|garden of salvation|pit of heresy|eververse|bright engram|pantheon|pale heart|solstice/i,
  raidsDungeonsBlurb:
    "Raid and dungeon from Shadowkeep — open the full loot hubs.",
  triumphsGroupTitle: "The Moon // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with Shadowkeep — campaign armor, Deathbringer, and Xenophage. Divinity lives on the Garden of Salvation hub.",
  deepLootEmptyDescription:
    "No Shadowkeep-era playlist loot found for the tracked activity pools.",
  indexImageFile: "garden-of-salvation.webp",
  available: true,
  excludedNamePatterns: [
    /^Khvostov\b/i,
    /^Reckless Oracle\b/i,
    /^Solstice\b/i,
  ],
  excludedSourcePatterns: [/solstice/i, /pale heart/i, /pantheon/i],
  exoticQuestSourcePattern:
    /deathbringer|xenophage|symphony of death/i,
  exoticExcludedNames: ["Divinity"],
  raidDungeonDeepLootExcludedNames: [
    "Accrued Redemption",
    "Ancient Gospel",
    "Omniscient Eye",
    "Prophet of Doom",
    "Sacred Provenance",
    "Zealot's Reward",
    "Premonition",
    "Apostate",
    "Blasphemer",
    "Heretic",
    "Divinity",
  ],
};
