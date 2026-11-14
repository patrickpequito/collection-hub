import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

const pool = (id: string) =>
  DEFAULT_SEASON_WEAPON_POOLS.find((entry) => entry.id === id)!;

const byPool = (id: string, names: string[]) =>
  Object.fromEntries(names.map((name) => [name, id]));

const ECHOES_ACTIVITY_WEAPONS = [
  "Aberrant Action",
  "Chronophage",
  "Corrasion",
  "Faith-Keeper",
  "Ill Omen",
  "Lost Signal",
  "Sightline Survey",
  "Speleologist",
  "Timeworn Wayfarer",
  "Veiled Threat",
];
// Season of Dawn reprisals ("Source: Episode: Echoes").
const BREACH_WEAPONS = [
  "Breachlight",
  "Line in the Sand",
  "Martyr's Retribution",
  "Patron of Lost Causes",
  "Perfect Paradox",
];
const VANGUARD_WEAPONS = [
  "Origin Story",
  "Scintillation",
  "Scintillation (Adept)",
  "Shadow Price",
  "Shadow Price (Adept)",
  "Uzume RR4",
  "Uzume RR4 (Adept)",
  "Warden's Law",
  "Warden's Law (Adept)",
  "Undercurrent",
  "Undercurrent (Adept)",
  "Pre Astyanax IV (Adept)",
];
const TRIALS_WEAPONS = [
  "Aisha's Care",
  "Aisha's Care (Adept)",
  "Eye of Sol",
  "Eye of Sol (Adept)",
  "Shayura's Wrath",
  "Shayura's Wrath (Adept)",
  "Incisor",
  "Incisor (Adept)",
];
const CRUCIBLE_WEAPONS = ["Better Devils", "The Riposte"];
const GAMBIT_WEAPONS = ["Hush"];
const IRON_BANNER_WEAPONS = [
  "Claws of the Wolf",
  "Crimil's Dagger",
  "Lethal Abundance",
  "Point of the Stag",
  "Riiswalker",
  "The Guiding Sight",
];
const WORLD_WEAPONS = [
  "Adverse Possession IX",
  "Controlling Vision",
  "Ded Gramarye IV",
  "Maahes HC4",
  "Suspectum-4fr",
  "The Domino",
  "Truthteller",
  "Yarovit MG4",
];
const RITUAL_WEAPONS = ["Perfect Pitch"];

export const EPISODE_ECHOES_HUB: SeasonHub = {
  slug: "s24-episode-echoes",
  title: "Episode: Echoes",
  seasonLabel: "S24 Episode: Echoes",
  parentExpansionSlug: "the-final-shape",
  seasonNumber: 24,
  episodeNumber: 1,
  titleIconPath:
    "/common/destiny2_content/icons/e3f231ec52829494d458524a06af868e.png",
  seal: { title: "Intrepid", completionRecordHash: "149024466" },
  videos: [
    { id: "trailer", label: "Episode trailer", youtubeId: "v2ZcAb7kh1o" },
    // Cutscene Archive: the episode's cinematics, in story order.
    { id: "cutscene-archive-1", label: "Bright Future", youtubeId: "CTV83PlA_1I" },
    { id: "cutscene-archive-2", label: "The Echoes", youtubeId: "m_SOh3yFZuY" },
    { id: "cutscene-archive-3", label: "The Story of Maya", youtubeId: "BAWPaBA1eMo" },
    { id: "cutscene-archive-4", label: "Meet the Conductor", youtubeId: "70z5xPGlVaE" },
    { id: "cutscene-archive-5", label: "Finale", youtubeId: "kouX7j6MvL8" },
  ],
  // Episode armor, then the new Vanguard / Crucible / Gambit sets.
  // (Veteran Legend carries the 10th anniversary event icon: it belongs with events.)
  armorSetNames: ["Untethered Edge", "Wall-Watcher", "Crimson Plume", "Poison Promise"],
  ornamentSets: [{ setName: "Chromacloak", armorSetName: "Untethered Edge" }],
  // Echoes weapons were reissued in the Monument of Triumph and the catalog also
  // tags Dawning and Solstice weapons with S24 — list the episode's weapons
  // explicitly (sources from each S24 version's collectible).
  matchWeaponVersions: false,
  extraWeaponNames: [
    ...ECHOES_ACTIVITY_WEAPONS,
    ...BREACH_WEAPONS,
    ...VANGUARD_WEAPONS,
    ...TRIALS_WEAPONS,
    ...CRUCIBLE_WEAPONS,
    ...GAMBIT_WEAPONS,
    ...IRON_BANNER_WEAPONS,
    ...WORLD_WEAPONS,
    ...RITUAL_WEAPONS,
  ],
  // The Dawning weapon carries the S24 watermark.
  excludedWeaponNames: ["Cold Front"],
  exoticItemNames: ["Red Death Reformed", "Choir of One"],
  weaponPools: [
    {
      id: "echoes-activities",
      title: "Echoes Weapons",
      sourcePattern: /(?!)/,
    },
    {
      id: "breach-executable",
      title: "Reprised Sundial Weapons",
      sourcePattern: /(?!)/,
    },
    ...["vanguard-ops", "trials-of-osiris", "crucible", "gambit", "iron-banner"].map(pool),
    {
      id: "ritual",
      title: "Ritual Weapon",
      sourcePattern: /(?!)/,
    },
  ],
  weaponPoolByName: {
    ...byPool("echoes-activities", ECHOES_ACTIVITY_WEAPONS),
    ...byPool("breach-executable", BREACH_WEAPONS),
    ...byPool("vanguard-ops", VANGUARD_WEAPONS),
    ...byPool("trials-of-osiris", TRIALS_WEAPONS),
    ...byPool("crucible", CRUCIBLE_WEAPONS),
    ...byPool("gambit", GAMBIT_WEAPONS),
    ...byPool("iron-banner", IRON_BANNER_WEAPONS),
    ...byPool("world-loot", WORLD_WEAPONS),
    ...byPool("ritual", RITUAL_WEAPONS),
  },
  playableActivities: [
    {
      id: "encore",
      title: "Encore",
      description: "Exotic mission on Nessus that rewards Choir of One.",
      location: "Vanguard Pinnacle Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/pinnacle_ops_exotic_encore.jpg",
    },
  ],
  exoticPanelDescription:
    "Exotic weapons from Episode: Echoes — Red Death Reformed from the Episode Pass and Choir of One from the Encore mission.",
  cosmeticPanelDescription:
    "Episode Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  // Exactly the Season Archive (Monument to Seasons Past) rewards.
  cosmeticRewards: [
    "Spectrum Shell",
    "Polychroma",
    "Unbridled Iridescence",
    "The Ol' Switcheroo",
    "Adding Flavor",
    "Old Blood",
    "Unsated Curiosity",
    "Unwavering Gallantry",
    "Unpredictable Liability",
    "Resonant Entrance",
    "Prismatic Entrance",
    "Vex Mantle Projection",
    "Mental Math",
    "Cavalry Charge",
    "The Final Slice",
  ],
  showEververseCosmetics: true,
  eververseOrnamentSetGroups: [["Spectral Displacer", "Apex Draconic", "Flayer's Dominion"]],
  available: true,
};
