import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_THE_CHOSEN_HUB: SeasonHub = {
  slug: "s13-season-of-the-chosen",
  title: "Season of the Chosen",
  seasonLabel: "S13 Season of the Chosen",
  parentExpansionSlug: "beyond-light",
  seasonNumber: 13,
  titleIconPath:
    "/common/destiny2_content/icons/937fd284fc16c3521d19e92a1f884bf5.png",
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "_XlFBp_ZmyE",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "8OSUVBTGyD4",
    },
  ],
  armorSetNames: ["Praefectus", "Pyrrhic Ascent"],
  ornamentSets: [{ setName: "Legatus", armorSetName: "Praefectus" }],
  extraWeaponNames: [
    "Igneous Hammer",
    "The Messenger",
    "The Palindrome",
    "Brass Attacks",
    "Trinary System",
    "Bottom Dollar",
    "The Third Axiom",
    "The Time-Worn Spire",
    "Multimach CCX",
    "Retrofuturist",
    "The Keening",
    "Frozen Orbit",
    "Sola's Scar",
  ],
  exoticItemNames: [
    "Dead Man's Tale",
    "Ticuu's Divination",
    "Cuirass of the Falling Star",
    "Mantle of Battle Harmony",
    "Omnioculus",
  ],
  weaponPools: DEFAULT_SEASON_WEAPON_POOLS,
  weaponPoolByName: {
    "Igneous Hammer": "trials-of-osiris",
    "The Messenger": "trials-of-osiris",
    "Sola's Scar": "trials-of-osiris",
    "The Palindrome": "vanguard-ops",
    "The Third Axiom": "vanguard-ops",
    "Brass Attacks": "world-loot",
    "Retrofuturist": "crucible",
    "The Keening": "crucible",
    "Frozen Orbit": "crucible",
    "Trinary System": "gambit",
    "Bottom Dollar": "gambit",
    "The Time-Worn Spire": "iron-banner",
    "Multimach CCX": "iron-banner",
    "Tarantula": "world-loot",
  },
  playableActivities: [
    {
      id: "battleground-behemoth",
      title: "Battleground: Behemoth",
      description:
        "Cabal battleground on Nessus. Available from the Director battlegrounds playlist.",
      pgcrImagePath:
        "/img/destiny_content/pgcr/nessus_battleground_behemoth.jpg",
    },
    {
      id: "battleground-foothold",
      title: "Battleground: Foothold",
      description:
        "Cabal battleground in the Cosmodrome. Available from the Director battlegrounds playlist.",
      pgcrImagePath:
        "/img/destiny_content/pgcr/cosmodrome_battleground_foothold.jpg",
    },
    {
      id: "battleground-oracle",
      title: "Battleground: Oracle",
      description:
        "Cabal battleground on Nessus. Available from the Director battlegrounds playlist.",
      pgcrImagePath: "/img/destiny_content/pgcr/nessus_battleground_oracle.jpg",
    },
    {
      id: "proving-grounds",
      title: "Proving Grounds",
      description:
        "Strike against Valus Galg, introduced this season. Still available in the Vanguard strike playlist.",
      pgcrImagePath: "/img/destiny_content/pgcr/nessus_proving_grounds.jpg",
    },
    {
      id: "presage",
      title: "Presage",
      description:
        "Exotic mission aboard the Glykon Volatus. Still playable from the Director — rewards Dead Man's Tale.",
      pgcrImagePath: "/img/destiny_content/pgcr/exotic_quest_presage.jpg",
    },
  ],
  exoticPanelDescription:
    "Exotic gear from Season of the Chosen — Presage, the Exotic Archive quest line, and the season exotic armor.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Challenger Shell",
    "Blade Breaker",
    "Humanity's Shield",
    "Shield Slam",
    "Gladitorial Entrance",
    "Armatura",
    "Testudo",
    "Hasta Solari",
  ],
  available: true,
};
