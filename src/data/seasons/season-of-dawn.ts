import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_DAWN_HUB: SeasonHub = {
  slug: "s9-season-of-dawn",
  title: "Season of Dawn",
  seasonLabel: "S9 Season of Dawn",
  parentExpansionSlug: "shadowkeep",
  seasonNumber: 9,
  titleIconPath:
    "/common/destiny2_content/icons/df8549cf24eb5b90b92a15d11599d88f.png",
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "iVZ-G88rOYg",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "B8w9ksLabno",
    },
  ],
  armorSetNames: ["Righteous", "Iron Truage"],
  ornamentSets: [{ setName: "Virtuous", armorSetName: "Righteous" }],
  excludedWeaponNames: ["Cold Front"],
  exoticItemNames: [
    "Bastion",
    "Devil's Ruin",
    "Symmetry",
    "The Bombardiers",
    "Severance Enclosure",
    "Promethium Spur",
  ],
  weaponPools: [
    {
      id: "sundial",
      title: "The Sundial",
      sourcePattern: /sundial|obelisk|timelost|mercury/i,
    },
    ...DEFAULT_SEASON_WEAPON_POOLS,
  ],
  weaponPoolByName: {
    Breachlight: "sundial",
    "Steelfeather Repeater": "sundial",
    "Martyr's Retribution": "sundial",
    "Line in the Sand": "sundial",
    "Infinite Paths 8": "sundial",
    "Gallant Charge": "sundial",
    "Patron of Lost Causes": "sundial",
    "Traveler's Judgment 5": "sundial",
    "Jack Queen King 3": "sundial",
    "Perfect Paradox": "sundial",
    "Pyroclastic Flow": "season-pass",
    "Trophy Hunter": "season-pass",
    Buzzard: "vanguard-ops",
    Python: "gambit",
    "Komodo-4FR": "crucible",
    "Elatha FR4": "world-loot",
    "Uriel's Gift": "world-loot",
    "The Old Fashioned": "world-loot",
    "Mos Epoch III": "world-loot",
    "Hawthorne's Field-Forged Shotgun": "world-loot",
    "Last Hope": "world-loot",
  },
  /** The Sundial and Mercury left the game with the Destiny Content Vault. */
  playableActivities: [],
  exoticPanelDescription:
    "Exotic gear from Season of Dawn — Bastion, Devil's Ruin, and Symmetry from Exotic Archive quests, plus the season's Hunter, Titan, and Warlock exotic armor.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Saintly Shell",
    "The Kellbreaker",
    "Dawn Chaser",
    "Defiant Vexsplosion",
    "Gunmetal Marigold",
    "Regal Medallion",
    "Meteoric Descent",
    "Zaroff's Prized Longbore",
  ],
  available: true,
};
