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
    // The three expeditions rotate weekly in Fireteam Ops; Bungie shares one art across them
    // (Europa: its patrol art; Nessus: owner-supplied screenshot).
    {
      id: "expedition-cosmodrome",
      title: "Expedition: Cosmodrome",
      description: "Three-player treasure dig on the Cosmodrome.",
      location: "Vanguard Fireteam Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/season_18_expedition.jpg",
      rotationActivityHashes: ["4001207919", "3082680901", "3302997692", "3219786703", "2003481787", "1516872608"],
    },
    {
      id: "expedition-europa",
      title: "Expedition: Europa",
      description: "Three-player treasure dig on Europa.",
      location: "Vanguard Fireteam Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/season_18_expedition.jpg",
      imageFile: "/images/seasons/playable/expedition-europa.webp",
      rotationActivityHashes: ["4001207918", "4263349830", "3766038363", "2425464470", "1826451826", "1516872609"],
    },
    {
      id: "expedition-nessus",
      title: "Expedition: Nessus",
      description: "Three-player treasure dig on Nessus.",
      location: "Vanguard Fireteam Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/season_18_expedition.jpg",
      imageFile: "/images/seasons/playable/expedition-nessus.webp",
      rotationActivityHashes: ["2407738200", "1230209641", "651146256", "2396783420", "1516872611"],
    },
  ],
  exoticPanelDescription:
    "Exotic gear from Season of Plunder — Delicate Tomb, Quicksilver Storm, and the season's new exotic armor.",
  cosmeticPanelDescription:
    "Season Pass and seasonal triumph cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  // Exactly the Season Archive (Monument to Seasons Past) rewards.
  cosmeticRewards: [
    "Swashbuckler's Projection",
    "Pirate Treasure",
    "Victorious Captain",
    "Flintlock Fury",
    "Castaway's Shell",
    "Bucca's Jollyboat",
    "Thar Be Treasure!",
    "Dusted Tome",
    "Rusted Coin",
    "Avant-Garde Mausoleum",
  ],
  // Seasonal triumph / vendor rewards no longer obtainable.
  seasonalRewards: [
    "Directive: Crash",
    "Swashbuckler Shell",
    "Generation's Shadow",
  ],
  showEververseCosmetics: true,
  available: true,
};
