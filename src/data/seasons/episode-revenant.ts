import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

const pool = (id: string) =>
  DEFAULT_SEASON_WEAPON_POOLS.find((entry) => entry.id === id)!;

const byPool = (id: string, names: string[]) =>
  Object.fromEntries(names.map((name) => [name, id]));

// Sources from each weapon's S25 version (collectible), since most were
// reissued in the Monument of Triumph.
const REVENANT_WEAPONS = [
  "Bitter/Sweet",
  "Exuviae",
  "Heretic's Fervor",
  "Insurmountable",
  "Liturgy",
  "Noxious Vetiver",
  "Red Tape",
  "Scavenger's Fate",
  "Sovereignty",
  "Vantage Point",
];
// Reprised weapons from the Override activity.
const OVERRIDE_WEAPONS = [
  "Chroma Rush",
  "Gridskipper",
  "Ignition Code",
  "Sojourner's Tale",
];
const VESPERS_HOST_WEAPONS = [
  "VS Chill Inhibitor",
  "VS Gravitic Arrest",
  "VS Pyroelectric Propellant",
  "VS Velocity Baton",
];
// Garden of Salvation weapons, reissued this episode.
const GARDEN_WEAPONS = [
  "Accrued Redemption",
  "Ancient Gospel",
  "Omniscient Eye",
  "Prophet of Doom",
  "Reckless Oracle",
  "Sacred Provenance",
  "Zealot's Reward",
];
const VANGUARD_WEAPONS = [
  "Wicked Sister",
  "PLUG ONE.1",
  "PLUG ONE.1 (Adept)",
  "Rake Angle",
  "Rake Angle (Adept)",
];
const TRIALS_WEAPONS = [
  "Tomorrow's Answer",
  "Tomorrow's Answer (Adept)",
  "Yesterday's Question",
  "Yesterday's Question (Adept)",
];
const CRUCIBLE_WEAPONS = ["Anonymous Autumn", "Deadlock"];
const GAMBIT_WEAPONS = ["Bygones"];
const IRON_BANNER_WEAPONS = ["Archon's Thunder", "Tinasha's Mastery"];
const WORLD_WEAPONS = ["Legato-11", "Live Fire", "Neoptolemus II", "Veleda-F"];
const RITUAL_WEAPONS = ["Fair Judgment"];

export const EPISODE_REVENANT_HUB: SeasonHub = {
  slug: "s25-episode-revenant",
  title: "Episode: Revenant",
  seasonLabel: "S25 Episode: Revenant",
  parentExpansionSlug: "the-final-shape",
  seasonNumber: 25,
  episodeNumber: 2,
  titleIconPath:
    "/common/destiny2_content/icons/3641e9343839e60eaeeb4be10cc23b9a.png",
  seal: { title: "Slayer Baron", completionRecordHash: "3047534189" },
  videos: [
    { id: "trailer", label: "Episode trailer", youtubeId: "Vm_UeYVOWFI" },
    // Cutscene Archive: the episode's cinematics, in story order.
    { id: "cutscene-archive-1", label: "Kell of Kells", youtubeId: "9zux4JSCRh4" },
    { id: "cutscene-archive-2", label: "Slayer Baron", youtubeId: "JqNfsMYNbrE" },
    { id: "cutscene-archive-3", label: "The Echo of Riis and a Whirlwind Dirge", youtubeId: "wmh3P4AUbbM" },
    { id: "cutscene-archive-4", label: "A Reunion and a Gift", youtubeId: "PmfoSft8hNo" },
  ],
  // Episode armor, Iron Banner set and the Vesper's Host dungeon set.
  armorSetNames: ["Shadestalker", "Iron Intent", "Spacewalk"],
  ornamentSets: [{ setName: "Heretical", armorSetName: "Shadestalker" }],
  matchWeaponVersions: false,
  extraWeaponNames: [
    ...REVENANT_WEAPONS,
    ...OVERRIDE_WEAPONS,
    ...VESPERS_HOST_WEAPONS,
    ...GARDEN_WEAPONS,
    ...VANGUARD_WEAPONS,
    ...TRIALS_WEAPONS,
    ...CRUCIBLE_WEAPONS,
    ...GAMBIT_WEAPONS,
    ...IRON_BANNER_WEAPONS,
    ...WORLD_WEAPONS,
    ...RITUAL_WEAPONS,
  ],
  // Dawning and Festival of the Lost weapons carry the S25 watermark.
  excludedWeaponNames: ["Avalanche", "Glacioclasm", "Jurassic Green", "BrayTech Werewolf"],
  exoticItemNames: [
    "Alethonym",
    "Slayer's Fang",
    "Ice Breaker",
    "Blastwave Striders",
    "Mask of Fealty",
    "Rime-coat Raiment",
  ],
  weaponPools: [
    {
      id: "revenant-activities",
      title: "Revenant Engrams",
      sourcePattern: /(?!)/,
    },
    {
      id: "override-reprised",
      title: "Override Reprised Weapons",
      sourcePattern: /(?!)/,
    },
    {
      id: "vespers-host",
      title: "Vesper's Host",
      sourcePattern: /(?!)/,
    },
    {
      id: "garden-of-salvation",
      title: "Garden of Salvation",
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
    ...byPool("revenant-activities", REVENANT_WEAPONS),
    ...byPool("override-reprised", OVERRIDE_WEAPONS),
    ...byPool("vespers-host", VESPERS_HOST_WEAPONS),
    ...byPool("garden-of-salvation", GARDEN_WEAPONS),
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
      id: "kells-fall",
      title: "Kell's Fall",
      description: "Fikrul's Revenant Fortress in the Tangled Shore; rewards Slayer's Fang.",
      location: "Vanguard Pinnacle Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/fikrul_keep.jpg",
    },
    {
      id: "vespers-host",
      title: "Vesper's Host",
      description: "Dungeon on a Rasputin-built space station orbiting Mars.",
      location: "Dungeon",
      pgcrImagePath: "/img/destiny_content/pgcr/vespers_host.jpg",
      href: "/activities/vespers-host",
    },
  ],
  exoticPanelDescription:
    "Exotic gear from Episode: Revenant — Alethonym from the Episode Pass, Slayer's Fang from Kell's Fall, Ice Breaker from Vesper's Host, and the episode's new exotic armor from solo Lost Sectors.",
  cosmeticPanelDescription:
    "Episode Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  // Exactly the Season Archive (Monument to Seasons Past) rewards.
  cosmeticRewards: [
    "Restless Dreams",
    "Dissected Carve",
    "Rustpiercer",
    "Cooperative Alchemy",
    "Vampire Hunter",
    "Pure Sapphire",
    "Shas'ki",
    "Splicer Mint",
    "Tetanus",
    "Gold Plating",
    "Umbral Harbinger",
    "Revenant Projection",
    "My Boomstick",
    "Powerful Potion",
    "Through the Heart",
    // Totembreaker's: helmet-only ornaments (Episode Pass).
    "Totembreaker's Mask",
    "Totembreaker's Helm",
    "Totembreaker's Hood",
  ],
  showEververseCosmetics: true,
  eververseOrnamentSetGroups: [
    ["Doki Doki Destiny Hunter", "Doki Doki Destiny Titan", "Doki Doki Destiny Warlock"],
  ],
  available: true,
};
