import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_ARRIVALS_HUB: SeasonHub = {
  slug: "s11-season-of-arrivals",
  title: "Season of Arrivals",
  seasonLabel: "S11 Season of Arrivals",
  parentExpansionSlug: "shadowkeep",
  seasonNumber: 11,
  titleIconPath:
    "/common/destiny2_content/icons/2fb6a08f5bd02095acab19f0e566e3c4.png",
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "5tJwLjVfFPc",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "TLWPy4Qs2w8",
    },
  ],
  armorSetNames: ["Holdfast", "Iron Fellowship"],
  ornamentSets: [{ setName: "Siegebreak", armorSetName: "Holdfast" }],
  exoticItemNames: [
    "Witherhoard",
    "Ruinous Effigy",
    "Traveler's Chosen",
  ],
  weaponPools: [
    {
      id: "umbral",
      title: "Umbral Engrams",
      sourcePattern: /umbral|prismatic recaster|interference/i,
    },
    {
      id: "contact",
      title: "Contact",
      sourcePattern: /contact/i,
    },
    {
      id: "prophecy",
      title: "Prophecy",
      sourcePattern: /prophecy/i,
    },
    ...DEFAULT_SEASON_WEAPON_POOLS,
  ],
  weaponPoolByName: {
    "Cold Denial": "umbral",
    "False Promises": "umbral",
    "Hollow Words": "umbral",
    "Whispering Slab": "umbral",
    "Death Adder": "umbral",
    "Falling Guillotine": "season-pass",
    "Temptation's Hook": "season-pass",
    "IKELOS_SMG_v1.0.2": "contact",
    "IKELOS_SR_v1.0.2": "contact",
    "IKELOS_HC_v1.0.2": "prophecy",
    "IKELOS_SG_v1.0.2": "prophecy",
    "The Fool's Remedy": "iron-banner",
    "The Forward Path": "iron-banner",
    "Nature of the Beast": "crucible",
    "First In, Last Out": "world-loot",
    Hoosegow: "world-loot",
    "Negative Space": "world-loot",
    "Berenger's Memory": "world-loot",
    "Widow's Bite": "world-loot",
    Truthteller: "world-loot",
  },
  playableActivities: [
    {
      id: "prophecy",
      title: "Prophecy",
      description:
        "Dungeon introduced this season. Still playable from the Director — rewards IKELOS weapons and Moonfang-X7 armor.",
      pgcrImagePath: "/img/destiny_content/pgcr/dungeon_prophecy.jpg",
      href: "/rad-loot/prophecy",
    },
  ],
  exoticPanelDescription:
    "Exotic weapons from Season of Arrivals — Witherhoard from the Season Pass, Ruinous Effigy from its exotic quest, and Traveler's Chosen from the Exotic Archive.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Last Bastion Shell",
    "Warden's Wailer",
    "Edge of Arrival",
    "Revolution Blade",
    "Traveler Entrance",
    "Horizons Beyond",
    "Throne of Soot",
    "White Collar Crime",
  ],
  available: true,
};
