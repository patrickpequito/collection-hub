import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

const pool = (id: string) =>
  DEFAULT_SEASON_WEAPON_POOLS.find((entry) => entry.id === id)!;

export const SEASON_OF_THE_WITCH_HUB: SeasonHub = {
  slug: "s22-season-of-the-witch",
  title: "Season of the Witch",
  seasonLabel: "S22 Season of the Witch",
  parentExpansionSlug: "lightfall",
  seasonNumber: 22,
  titleIconPath:
    "/common/destiny2_content/icons/187195641b8bd4e5a901dff870d8836f.png",
  seal: { title: "Haruspex", completionRecordHash: "2269203216" },
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "uRDEP5NOioU",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "DPrwuAJOx6s",
    },
  ],
  // Trials set: Fused Aurum / Photonic / Skybreaker (see trials-of-osiris.ts).
  armorSetNames: ["Veiled Tithes", "Season of the Witch Set"],
  ornamentSets: [{ setName: "Hexwrought", armorSetName: "Veiled Tithes" }],
  // Most S22 weapons were reissued later (Monument, Echoes) and the catalog
  // also tags Solstice reprisals and Crota's End (a reprised raid, left out)
  // with S22 — list the season's weapons explicitly.
  matchWeaponVersions: false,
  extraWeaponNames: [
    // Altars of Summoning, Savathûn's Spire and the Imbaru Engine.
    "Brya's Love",
    "Eleatic Principle",
    "Kept Confidence",
    "Locus Locutus",
    "Semiotician",
    "The Eremite",
    // Season Pass (Red War reprisals and Nightshade).
    "Deadpan Delivery",
    "Persuader",
    "The Showrunner",
    // Playlists.
    "Luna Regolith III",
    "Warden's Law",
    "Warden's Law (Adept)",
    "Pre Astyanax IV",
    "Pre Astyanax IV (Adept)",
    "Qua Xaphan V",
    "Igneous Hammer",
    "Igneous Hammer (Adept)",
    "Cataphract GL3",
    "Cataphract GL3 (Adept)",
    "Point of the Stag",
    "The Guiding Sight",
    // World loot.
    "Geodetic HSm",
    "Heliocentric QSc",
    "Malediction",
    "Nightshade",
    "Nox Perennial V",
    "Psi Hermetic V",
    "Unending Tempest",
  ],
  // Crota's End weapon whose primary version carries the S22 watermark.
  excludedWeaponNames: ["Eidolon Ally"],
  exoticItemNames: [
    "Ex Diris",
    // The Final Shape pre-order bonus, released with the S22 watermark.
    "Tessellation",
    "Briarbinds",
    "Mothkeeper's Wraps",
    "Pyrogale Gauntlets",
  ],
  weaponPools: [
    {
      id: "witch-activities",
      title: "Altars & Savathûn's Spire",
      sourcePattern: /season of the witch/i,
    },
    // Crucible and Gambit side by side in the two-column grid.
    ...["vanguard-ops", "crucible", "gambit", "trials-of-osiris", "iron-banner", "season-pass"].map(pool),
  ],
  weaponPoolByName: {
    "Brya's Love": "witch-activities",
    "Eleatic Principle": "witch-activities",
    "Kept Confidence": "witch-activities",
    "Locus Locutus": "witch-activities",
    Semiotician: "witch-activities",
    "The Eremite": "witch-activities",
    "Deadpan Delivery": "season-pass",
    Persuader: "season-pass",
    "The Showrunner": "season-pass",
    "Luna Regolith III": "vanguard-ops",
    "Warden's Law": "vanguard-ops",
    "Warden's Law (Adept)": "vanguard-ops",
    "Pre Astyanax IV": "vanguard-ops",
    "Pre Astyanax IV (Adept)": "vanguard-ops",
    "Qua Xaphan V": "gambit",
    "Igneous Hammer": "trials-of-osiris",
    "Igneous Hammer (Adept)": "trials-of-osiris",
    "Cataphract GL3": "trials-of-osiris",
    "Cataphract GL3 (Adept)": "trials-of-osiris",
    "Point of the Stag": "iron-banner",
    "The Guiding Sight": "iron-banner",
    "Geodetic HSm": "world-loot",
    "Heliocentric QSc": "world-loot",
    Malediction: "world-loot",
    Nightshade: "season-pass",
    "Nox Perennial V": "world-loot",
    "Psi Hermetic V": "world-loot",
    "Unending Tempest": "crucible",
  },
  // Altars of Summoning and Savathûn's Spire are no longer launchable.
  // Crota's End launched this season but is a reprised raid, not season content.
  playableActivities: [],
  exoticPanelDescription:
    "Exotic gear from Season of the Witch — Ex Diris from the Season Pass, Tessellation from The Final Shape pre-order, and the season's new exotic armor.",
  cosmeticPanelDescription:
    "Season Pass and seasonal triumph cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Prophetic Projection",
    "Arcane Banishment",
    "Hexed Shell",
    "Pharmakos Shell",
    "Acroamatis",
    "Laminos",
    "Sparagmos",
    "Beyond Sight",
    "Organic Adornment",
    "Ossified Carving",
    "Forbidden Wish",
    "Fatebinder",
    "Cartomancy",
    "Twisted Space",
  ],
  showEververseCosmetics: true,
  available: true,
};
