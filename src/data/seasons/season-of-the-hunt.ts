import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_THE_HUNT_HUB: SeasonHub = {
  slug: "s12-season-of-the-hunt",
  title: "Season of the Hunt",
  seasonLabel: "S12 Season of the Hunt",
  parentExpansionSlug: "beyond-light",
  seasonNumber: 12,
  titleIconPath:
    "/common/destiny2_content/icons/5ea0af3a7d0aa5717e65f9b65472ba67.png",
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "A32M1Lz9eIY",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "Z3w3_A5b3O8",
    },
  ],
  armorSetNames: [
    "Wild Hunt",
    "Phobos Warden",
    "Cinder Pinion",
    "Calamity Rig",
  ],
  ornamentSets: [{ setName: "Steeplechase", armorSetName: "Wild Hunt" }],
  /** Beyond Light / DSC / Europa loot shares Hunt watermarks — stay on primary label. */
  matchWeaponVersions: false,
  extraWeaponNames: ["Adored", "The Guiding Sight"],
  exoticItemNames: ["Duality", "Hawkmoon"],
  weaponPools: [
    {
      id: "wrathborn",
      title: "Wrathborn Hunts",
      sourcePattern: /wrathborn/i,
    },
    ...DEFAULT_SEASON_WEAPON_POOLS,
  ],
  weaponPoolByName: {
    "Friction Fire": "wrathborn",
    "Deafening Whisper": "wrathborn",
    "Corsair's Wrath": "wrathborn",
    "Royal Chase": "season-pass",
    "Blast Battue": "season-pass",
    "Crowd Pleaser": "gambit",
    "The Steady Hand": "iron-banner",
    "The Guiding Sight": "iron-banner",
    Adored: "world-loot",
  },
  playableActivities: [],
  exoticPanelDescription:
    "Exotic weapons from Season of the Hunt — Duality from the Season Pass / Monument, and Hawkmoon from the Crow quest line.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Digital Cortex",
    "Little Bird",
    "Victory Pose",
    "Silencing Shot",
    "Stalker's Entrance",
    "Lawful Neutral",
    "Horizon Blush",
    "Antiquity",
  ],
  available: true,
};
