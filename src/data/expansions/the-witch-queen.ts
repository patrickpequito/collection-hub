import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

/**
 * The Witch Queen expansion hub — Layout B (completionist dashboard).
 */
export const WITCH_QUEEN_HUB: ExpansionHub = {
  slug: "the-witch-queen",
  title: "The Witch Queen",
  titleSlug: "the-witch-queen",
  triumphGroupSlug: "throne-world",
  seasonLabels: ["The Witch Queen"],
  seasonIconHashes: ["0b441021fbc328e6d0e2abc895f5c96e"],
  seasonNumber: 16,
  destinationArmorSetNames: ["Veritas"],
  destinationArmorPreviewFiles: ["veritas.webp"],
  destinationTitle: "Destination // Savathûn's Throne World",
  destinationActivityTitle: "Throne World",
  destinationActivitySlug: "throne-world",
  destinationWeaponSourcePattern: /throne world|wellspring/i,
  destinationWeaponExtraNames: ["Forensic Nightmare"],
  relatedRadSlugs: [
    "vow-of-the-disciple",
    "duality",
    "spire-of-the-watcher",
  ],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /throne world|wellspring|vow of the disciple|duality|spire of the watcher|eververse|bright engram/i,
  raidsDungeonsBlurb:
    "Raid and dungeons from The Witch Queen year — open the full loot hubs.",
  triumphsGroupTitle: "Throne World // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with The Witch Queen — including raid and exotic quests. Season watermark takes priority over catalog season labels.",
  deepLootEmptyDescription:
    "No Witch Queen–season playlist loot found for Vanguard, Gambit, Crucible, Iron Banner, or Trials.",
  indexImageFile: "vow-of-the-disciple.webp",
  available: true,
  excludedNamePatterns: [/^Tusked Allegiance\b/i],
  excludedSeasonLabels: ["S16 Season of the Risen"],
  excludedSourcePatterns: [/season of the risen/i],
  exoticQuestSourcePattern: /evidence board|of queens and worms|vox obscura/i,
  exoticExcludedNames: ["Collective Obligation"],
  exoticExcludedSourcePattern: /vow of the disciple/i,
  deepLootWeaponPoolByName: {
    "Herod-C": "gambit",
    "The Enigma": "world-loot",
    "Frontier's Cry": "iron-banner",
    "Ogma PR6": "world-loot",
    "Syncopation-53": "world-loot",
    "Palmyra-B": "world-loot",
    "Aisha's Embrace": "trials-of-osiris",
    "Fortissimo-11": "vanguard-ops",
    "Ragnhild-D": "world-loot",
    "Empirical Evidence": "world-loot",
  },
  raidDungeonDeepLootExcludedNames: [
    "Cataclysmic",
    "Deliverance",
    "Forbearance",
    "Insidious",
    "Lubrae's Ruin",
    "Submission",
    "Collective Obligation",
  ],
};
