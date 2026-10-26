import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_PLUNDER_HUB: SeasonHub = {
  slug: "s18-season-of-plunder",
  title: "Season of Plunder",
  seasonLabel: "S18 Season of Plunder",
  parentExpansionSlug: "the-witch-queen",
  seasonNumber: 18,
  titleIconPath:
    "/common/destiny2_content/icons/8baab00c3586301651d5fc6d05f236ce.png",
  seal: { title: "Scallywag", completionRecordHash: "4176879201" },
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "9jxwEEmrVKg",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "O9Mlvz5jAWI",
    },
  ],
  armorSetNames: ["Ketchkiller's"],
  ornamentSets: [{ setName: "Starfarer's", armorSetName: "Ketchkiller's" }],
  // Most Plunder weapons were reissued later (Monument, Year 8), so the
  // primary catalog label is not S18 — list them explicitly.
  matchWeaponVersions: false,
  // King's Fall is a Destiny 1 raid reprisal — its loot stays on the raid page.
  // The Harrowed variants are catalogued as S18, so exclude them explicitly.
  excludedWeaponNames: [
    "Defiance of Yasmin (Harrowed)",
    "Doom of Chelchis (Harrowed)",
    "Midha's Reckoning (Harrowed)",
    "Qullim's Terminus (Harrowed)",
    "Smite of Merain (Harrowed)",
    "Zaouli's Bane (Harrowed)",
  ],
  extraWeaponNames: [
    "Blood Feud",
    "No Reprieve",
    "Sailspy Pitchglass",
    "Tarnished Mettle",
    "Brigand's Law",
    "Planck's Stride",
    "Mindbender's Ambition",
    "The Militia's Birthright",
    "The Inquisitor",
    "Whistler's Whim",
    "Ammit AR2",
    "Taipan-4fr",
    "Allied Demand",
    "Cry Mutiny",
    "Out of Bounds",
    "Roar of the Bear",
    "Yesteryear",
  ],
  exoticItemNames: [
    "Delicate Tomb",
    "Quicksilver Storm",
    "Gyrfalcon's Hauberk",
    "Point-Contact Cannon Brace",
    "Fallen Sunstar",
  ],
  weaponPools: [
    {
      id: "plunder-activities",
      title: "Ketchcrash & Expeditions",
      sourcePattern: /season of plunder activities/i,
    },
    ...DEFAULT_SEASON_WEAPON_POOLS,
  ],
  weaponPoolByName: {
    Yesteryear: "gambit",
    "Roar of the Bear": "iron-banner",
    "Allied Demand": "iron-banner",
    "Out of Bounds": "crucible",
    "Brigand's Law": "season-pass",
    "Planck's Stride": "season-pass",
    "Mindbender's Ambition": "vanguard-ops",
    "The Militia's Birthright": "vanguard-ops",
    "The Inquisitor": "trials-of-osiris",
    "Whistler's Whim": "trials-of-osiris",
  },
  playableActivities: [
    {
      id: "ketchcrash",
      title: "Ketchcrash",
      description: "Six-player ship-to-ship assault against Eliksni pirates.",
      location: "Vanguard Arena Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/season_18_ketchcrash.jpg",
    },
    {
      id: "expeditions",
      title: "Expeditions",
      description: "Three-player treasure digs on the Cosmodrome, Europa and Nessus.",
      location: "Vanguard Fireteam Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/season_18_expedition.jpg",
    },
  ],
  exoticPanelDescription:
    "Exotic gear from Season of Plunder — Delicate Tomb, Quicksilver Storm, and the season's new exotic armor.",
  cosmeticPanelDescription:
    "Season Pass and seasonal triumph cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Castaway's Shell",
    "Bucca's Jollyboat",
    "Thar Be Treasure!",
    "Swashbuckler's Projection",
    "Flintlock Fury",
    "Avant-Garde Mausoleum",
    "Directive: Crash",
    "Rusted Coin",
    "Dusted Tome",
    "Swashbuckler Shell",
    "Generation's Shadow",
  ],
  showEververseCosmetics: true,
  available: true,
};
