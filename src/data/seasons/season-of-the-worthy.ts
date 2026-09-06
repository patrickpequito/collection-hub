import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_THE_WORTHY_HUB: SeasonHub = {
  slug: "s10-season-of-the-worthy",
  title: "Season of the Worthy",
  seasonLabel: "S10 Season of the Worthy",
  parentExpansionSlug: "shadowkeep",
  seasonNumber: 10,
  titleIconPath:
    "/common/destiny2_content/icons/727afea7b30642ef77fc1bbbf1a5452f.png",
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "I34Lx4wvAD8",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "2lCOjueWHgs",
    },
  ],
  armorSetNames: ["Seventh Seraph", "Iron Remembrance"],
  ornamentSets: [{ setName: "Valkyrian", armorSetName: "Seventh Seraph" }],
  exoticItemNames: [
    "The Fourth Horseman",
    "Tommy's Matchbook",
    "Heir Apparent",
    "Citan's Ramparts",
    "Felwinter's Helm",
    "Raiju's Harness",
  ],
  weaponPools: [
    {
      id: "seraph-bunker",
      title: "Seraph Bunker",
      sourcePattern: /seraph|warsat|bunker|almight/i,
    },
    ...DEFAULT_SEASON_WEAPON_POOLS,
  ],
  weaponPoolByName: {
    "Seventh Seraph Carbine": "seraph-bunker",
    "Seventh Seraph CQC-12": "seraph-bunker",
    "Seventh Seraph Officer Revolver": "seraph-bunker",
    "Seventh Seraph SAW": "seraph-bunker",
    "Seventh Seraph SI-2": "seraph-bunker",
    "Seventh Seraph VY-7": "seraph-bunker",
    "Felwinter's Lie": "iron-banner",
    "Point of the Stag": "iron-banner",
    "Astral Horizon": "trials-of-osiris",
    "Exile's Curse": "trials-of-osiris",
    "Eye of Sol": "trials-of-osiris",
    "The Scholar": "trials-of-osiris",
    "The Summoner": "trials-of-osiris",
    "Tomorrow's Answer": "trials-of-osiris",
    "Dire Promise": "world-loot",
    "Distant Tumulus": "world-loot",
    "Enigma's Draw": "world-loot",
    "Escape Velocity": "world-loot",
    "Honor's Edge": "world-loot",
    "Interference VI": "world-loot",
    "Jian 7 Rifle": "world-loot",
    "Timelines' Vertex": "world-loot",
    "True Prophecy": "world-loot",
  },
  /** Seraph Towers and the Almighty public event left with the Destiny Content Vault. */
  playableActivities: [],
  exoticPanelDescription:
    "Exotic gear from Season of the Worthy — The Fourth Horseman and Tommy's Matchbook from Exotic Archive quests, Heir Apparent from Guardian Games, plus the season's Hunter, Titan, and Warlock exotic armor.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Hardlink Shell",
    "Valkyrian Impaler",
    "Emblem of the Worthy",
    "Big Red Entrance",
    "Darkwater Froth",
    "Silver Tactical",
    "The Chopper",
    "Tyrant's Cudgel",
  ],
  available: true,
};
