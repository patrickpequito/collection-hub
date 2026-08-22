import {
  DEFAULT_DEEP_LOOT_ACTIVITIES,
  type ExpansionHub,
} from "@/data/expansions/types";

/**
 * Beyond Light expansion hub — Layout B (completionist dashboard).
 */
export const BEYOND_LIGHT_HUB: ExpansionHub = {
  slug: "beyond-light",
  title: "Beyond Light",
  titleSlug: "beyond-light",
  triumphGroupSlug: "europa",
  seasonLabels: ["Beyond Light"],
  seasonIconHashes: ["bce51cf90464e28026140df77c4eb6ce"],
  seasonNumber: 12,
  destinationArmorSetNames: ["Crystocrene"],
  destinationArmorPreviewFiles: ["crystocrene.webp"],
  destinationTitle: "Destination // Europa",
  destinationActivityTitle: "Europa",
  destinationActivitySlug: "europa",
  destinationWeaponSourcePattern: /europa|empire hunt|variks/i,
  destinationWeaponExtraNames: [
    "Arctic Haze",
    "Biting Winds",
    "Bonechiller",
    "Coriolis Force",
    "Hailing Confusion",
    "High Albedo",
    "Subzero Salvo",
    "Thermal Erosion",
  ],
  relatedRadSlugs: ["deep-stone-crypt"],
  deepLootActivities: DEFAULT_DEEP_LOOT_ACTIVITIES,
  deepLootExcludedSourcePattern:
    /europa|empire hunt|variks|deep stone crypt|eververse|bright engram|solstice|pale heart|pantheon/i,
  raidsDungeonsBlurb:
    "Raid from Beyond Light — open the full loot hub.",
  triumphsGroupTitle: "Europa // All triumphs",
  exoticPanelDescription:
    "Exotics introduced with Beyond Light — Cloudstrike, Salvation's Grip, The Lament, and No Time to Explain (Deluxe). Eyes of Tomorrow lives on the Deep Stone Crypt hub.",
  deepLootEmptyDescription:
    "No Beyond Light–era playlist loot found for the tracked activity pools.",
  indexImageFile: "deep-stone-crypt.webp",
  available: true,
  excludedNamePatterns: [/^Solstice\b/i],
  excludedSourcePatterns: [/solstice/i, /pale heart/i, /pantheon/i],
  exoticQuestSourcePattern: /lost lament|stasis prototype/i,
  exoticExcludedNames: ["Eyes of Tomorrow"],
  exoticExcludedSourcePattern: /deep stone crypt/i,
  raidDungeonDeepLootExcludedNames: [
    "Bequest",
    "Commemoration",
    "Heritage",
    "Posterity",
    "Succession",
    "Trustee",
    "Eyes of Tomorrow",
  ],
};
