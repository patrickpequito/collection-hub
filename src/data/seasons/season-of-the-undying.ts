import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_THE_UNDYING_HUB: SeasonHub = {
  slug: "s8-season-of-the-undying",
  title: "Season of the Undying",
  seasonLabel: "S8 Season of the Undying",
  parentExpansionSlug: "shadowkeep",
  seasonNumber: 8,
  titleIconPath:
    "/common/destiny2_content/icons/00364cdc6a352f251b1e46244176d0a6.png",
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "G8mC5GaDoyQ",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "AVAgDFvak_o",
    },
  ],
  armorSetNames: ["Substitutional Alloy", "Iron Will"],
  ornamentSets: [
    { setName: "Phenotype Plasticity", armorSetName: "Substitutional Alloy" },
  ],
  excludedWeaponNames: ["BrayTech Werewolf"],
  exoticItemNames: [
    "Eriana's Vow",
    "Leviathan's Breath",
    "Monte Carlo",
  ],
  weaponPools: [
    {
      id: "vex-offensive",
      title: "Vex Offensive",
      sourcePattern: /vex offensive/i,
    },
    ...DEFAULT_SEASON_WEAPON_POOLS,
  ],
  weaponPoolByName: {
    Adhortative: "vex-offensive",
    Imperative: "vex-offensive",
    Optative: "vex-offensive",
    Subjunctive: "vex-offensive",
    Edgewise: "vanguard-ops",
    "Exit Strategy": "gambit",
    "Randy's Throwing Knife": "crucible",
    "Temporal Clause": "vex-offensive",
    Pluperfect: "season-pass",
  },
  /** Vex Offensive and Moon invasions left the Director — no remaining seasonal playlist. */
  playableActivities: [],
  exoticPanelDescription:
    "Exotic weapons from Season of the Undying — Eriana's Vow and Leviathan's Breath from the Exotic Archive / Season Pass quests, and Monte Carlo from exotic engrams.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Never Live It Down",
    "Belgian Flying Kick",
    "Blade Carnival",
    "Palm of Wen Jie",
    "Blackheart Growth",
    "First Frost",
    "Night's Chill",
    "For Wei",
  ],
  available: true,
};
