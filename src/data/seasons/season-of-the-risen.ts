import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_THE_RISEN_HUB: SeasonHub = {
  slug: "s16-season-of-the-risen",
  title: "Season of the Risen",
  seasonLabel: "S16 Season of the Risen",
  parentExpansionSlug: "the-witch-queen",
  seasonNumber: 16,
  titleIconPath:
    "/common/destiny2_content/icons/684ab17baff96d093a8f23088ac0b1b4.png",
  seal: { title: "Risen", completionRecordHash: "1710217127" },
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "bHPSWwCgCps",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "_VkMYeN7PRg",
    },
  ],
  armorSetNames: ["Tusked Allegiance"],
  ornamentSets: [
    { setName: "Psionic", armorSetName: "Tusked Allegiance" },
  ],
  matchWeaponVersions: false,
  extraWeaponNames: [
    "Explosive Personality",
    "Piece of Mind",
    "Reckless Endangerment",
    "Recurrent Impact",
    "Sweet Sorrow",
    "Thoughtless",
    "Under Your Skin",
  ],
  exoticItemNames: ["Grand Overture", "Dead Messenger"],
  weaponPools: [
    {
      id: "psiops-battlegrounds",
      title: "PsiOps Battlegrounds",
      sourcePattern: /season of the risen|psiops/i,
    },
    {
      id: "ritual-weapon",
      title: "Ritual Weapon",
      sourcePattern: /ritual weapon|seasonal quest/i,
    },
    ...DEFAULT_SEASON_WEAPON_POOLS,
  ],
  weaponPoolByName: {
    "Explosive Personality": "psiops-battlegrounds",
    "Recurrent Impact": "psiops-battlegrounds",
    "Sweet Sorrow": "psiops-battlegrounds",
    "Under Your Skin": "psiops-battlegrounds",
    "Piece of Mind": "season-pass",
    Thoughtless: "season-pass",
    "Reckless Endangerment": "ritual-weapon",
  },
  playableActivities: [
    {
      id: "vox-obscura",
      title: "Vox Obscura",
      description: "Exotic mission on Mars.",
      location: "Vanguard Pinnacle Ops",
      pgcrImagePath:
        "/img/destiny_content/pgcr/exotic_mission_chrome.jpg",
    },
  ],
  exoticPanelDescription:
    "Exotic gear from Season of the Risen — Grand Overture from the Season Pass and Dead Messenger from Vox Obscura.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Flayer Shell",
    "Mind Shard",
    "Sovereign Order",
    "Lucent Shrieker Entrance",
    "Risen Projection",
    "Psychic Warfare",
    "Life for Life",
    "Like a Moth to a…",
    "Mind's Eye",
    "Royal Dye",
  ],
  showEververseCosmetics: true,
  excludedEververseNames: ["Witch Queen Projection"],
  available: true,
};
