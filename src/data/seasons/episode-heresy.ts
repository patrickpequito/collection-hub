import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

const pool = (id: string) =>
  DEFAULT_SEASON_WEAPON_POOLS.find((entry) => entry.id === id)!;

const byPool = (id: string, names: string[]) =>
  Object.fromEntries(names.map((name) => [name, id]));

// Sources from each weapon's S26 version (collectible), since most were
// reissued later.
const HERESY_WEAPONS = [
  "Abyssal Edge",
  "Abyssal Edge (Adept)",
  "Adamantite",
  "Adamantite (Adept)",
  "Afterlight",
  "Afterlight (Adept)",
  "Anamnesis",
  "Anamnesis (Adept)",
  "Division",
  "Division (Adept)",
  "Eyes Unveiled",
  "Eyes Unveiled (Adept)",
  "Mirror Imago",
  "Mirror Imago (Adept)",
  "Psychopomp",
  "Psychopomp (Adept)",
  "Refusal of the Call",
  "Refusal of the Call (Adept)",
  "Watchful Eye",
  "Watchful Eye (Adept)",
];
// Reprised weapons ("Source: Episode: Heresy Activities").
const REPRISED_WEAPONS = [
  "Cold Denial",
  "False Promises",
  "Hollow Words",
  "Temptation's Hook",
  "Whispering Slab",
];
const SUNDERED_DOCTRINE_WEAPONS = ["Unloved", "Unsworn", "Unvoiced", "Unworthy"];
// Rite of the Nine: refreshed Ghosts of the Deep, Spire of the Watcher and Prophecy.
const RITE_OF_THE_NINE_WEAPONS = [
  "A Sudden Death",
  "A Sudden Death (Adept)",
  "Cold Comfort",
  "Cold Comfort (Adept)",
  "Greasy Luck",
  "Greasy Luck (Adept)",
  "New Pacific Epitaph",
  "New Pacific Epitaph (Adept)",
  "No Survivors",
  "No Survivors (Adept)",
  "Liminal Vigil",
  "Liminal Vigil (Adept)",
  "Long Arm",
  "Long Arm (Adept)",
  "Terminus Horizon",
  "Terminus Horizon (Adept)",
  "Wilderflight",
  "Wilderflight (Adept)",
  "Judgment",
  "Prosecutor",
  "Prosecutor (Adept)",
  "Relentless",
  "Relentless (Adept)",
];
// Vault of Glass weapons, reissued this episode (with their Timelost versions).
const VAULT_OF_GLASS_WEAPONS = [
  "Corrective Measure",
  "Corrective Measure (Timelost)",
  "Fatebringer",
  "Fatebringer (Timelost)",
  "Found Verdict",
  "Found Verdict (Timelost)",
  "Hezen Vengeance",
  "Hezen Vengeance (Timelost)",
  "Praedyth's Revenge",
  "Praedyth's Revenge (Timelost)",
  "Vision of Confluence",
  "Vision of Confluence (Timelost)",
];
const VANGUARD_WEAPONS = [
  "Cynosure",
  "Cruel Mercy",
  "Cruel Mercy (Adept)",
  "Lotus-Eater",
  "Lotus-Eater (Adept)",
  "The Palindrome",
  "The Palindrome (Adept)",
];
const TRIALS_WEAPONS = [
  "Exalted Truth",
  "Exalted Truth (Adept)",
  "Keen Thistle",
  "Keen Thistle (Adept)",
  "The Inquisitor",
  "The Inquisitor (Adept)",
];
const CRUCIBLE_WEAPONS = ["Joxer's Longsword", "Redrix's Estoc"];
const GAMBIT_WEAPONS = ["Backfang"];
const IRON_BANNER_WEAPONS = ["Nature Reclaimed", "Peacebond", "Warlord's Spear"];
const WORLD_WEAPONS = ["Admetus-D", "Boondoggle Mk. 55", "Cruoris FR4", "Qua Furor V"];
const RITUAL_WEAPONS = ["Resounding"];

export const EPISODE_HERESY_HUB: SeasonHub = {
  slug: "s26-episode-heresy",
  title: "Episode: Heresy",
  seasonLabel: "S26 Episode: Heresy",
  parentExpansionSlug: "the-final-shape",
  seasonNumber: 26,
  episodeNumber: 3,
  titleIconPath:
    "/common/destiny2_content/icons/1e16b39aacfe4992e939274f84644a53.png",
  seal: { title: "Heretic", completionRecordHash: "393827228" },
  videos: [
    { id: "trailer", label: "Episode trailer", youtubeId: "ovo-J5F2rRI" },
    // Cutscene Archive: the episode's cinematics, in story order.
    { id: "cutscene-archive-1", label: "The Dreadnaught Returns", youtubeId: "1DLwogqASBY" },
    { id: "cutscene-archive-2", label: "Keit'Ehr's Ambush", youtubeId: "raTyEJUSe0w" },
    { id: "cutscene-archive-3", label: "Moonlight", youtubeId: "3v5uyzKatTU" },
    { id: "cutscene-archive-4", label: "High Heresy", youtubeId: "MCK0UHoXnSY" },
    { id: "cutscene-archive-5", label: "Xivu Arath Affronted", youtubeId: "nr11oKJ6brw" },
  ],
  // Episode armor, the Trials set and the Sundered Doctrine dungeon set.
  armorSetNames: ["Apostate's Blade", "Episode: Heresy Set", "Flain"],
  ornamentSets: [{ setName: "Navigator's Raiment", armorSetName: "Apostate's Blade" }],
  matchWeaponVersions: false,
  extraWeaponNames: [
    ...HERESY_WEAPONS,
    ...REPRISED_WEAPONS,
    ...SUNDERED_DOCTRINE_WEAPONS,
    ...RITE_OF_THE_NINE_WEAPONS,
    ...VAULT_OF_GLASS_WEAPONS,
    ...VANGUARD_WEAPONS,
    ...TRIALS_WEAPONS,
    ...CRUCIBLE_WEAPONS,
    ...GAMBIT_WEAPONS,
    ...IRON_BANNER_WEAPONS,
    ...WORLD_WEAPONS,
    ...RITUAL_WEAPONS,
  ],
  // Guardian Games weapons and the pre-order bonus carry the S26 watermark.
  excludedWeaponNames: [
    "Hullabaloo",
    "Keraunios",
    "New Land Beyond",
  ],
  exoticItemNames: ["Lodestar", "Barrow-Dyad", "Finality's Auger"],
  weaponPools: [
    {
      id: "heresy-activities",
      title: "Heresy Weapons",
      sourcePattern: /(?!)/,
    },
    {
      id: "rite-of-the-nine",
      title: "Rite of the Nine",
      sourcePattern: /(?!)/,
    },
    {
      id: "heresy-reprised",
      title: "Reprised Weapons",
      sourcePattern: /(?!)/,
    },
    {
      id: "sundered-doctrine",
      title: "Sundered Doctrine",
      sourcePattern: /(?!)/,
    },
    {
      id: "vault-of-glass",
      title: "Vault of Glass",
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
    ...byPool("heresy-activities", HERESY_WEAPONS),
    ...byPool("heresy-reprised", REPRISED_WEAPONS),
    ...byPool("sundered-doctrine", SUNDERED_DOCTRINE_WEAPONS),
    ...byPool("rite-of-the-nine", RITE_OF_THE_NINE_WEAPONS),
    ...byPool("vault-of-glass", VAULT_OF_GLASS_WEAPONS),
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
      id: "derealize",
      title: "Derealize",
      description: "Exotic mission investigating the source of a mysterious Taken power.",
      location: "Vanguard Pinnacle Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/s26_exotic.jpg",
    },
    {
      id: "sundered-doctrine",
      title: "Sundered Doctrine",
      description: "Dungeon in the deepest vaults of the Pyramid on the Pale Heart.",
      location: "Dungeon",
      pgcrImagePath: "/img/destiny_content/pgcr/dungeon_delver.jpg",
      href: "/activities/sundered-doctrine",
    },
  ],
  exoticPanelDescription:
    "Exotic weapons from Episode: Heresy — Lodestar from the Episode Pass, Barrow-Dyad from the episode's activities, and Finality's Auger from Sundered Doctrine.",
  cosmeticPanelDescription:
    "Episode Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  // Exactly the Season Archive (Monument to Seasons Past) rewards.
  cosmeticRewards: [
    "Pelorus Shell",
    "Scream-Eyed",
    "Endling Seek",
    "Contented Captain",
    "Checkmate",
    "Artificial Sun",
    "Shipwright's Finery",
    "Dreadful Symmetry",
    "Subsequence",
    "King's Wings Entrance",
    "Heretical Entrance",
    "Navigator Projection",
    "Ambitious Grasp",
    "Resolute Command",
    "Written in Stone",
    // Helmet-only ornaments (one per class, same name).
    "Navigator's Crown",
  ],
  showEververseCosmetics: true,
  // Three themes, one set per class.
  eververseOrnamentSetGroups: [
    ["Verglas Stalker", "Cracked Iceberg", "Cryosphere"],
    ["Uncanny Conjurer", "Cryptic Magus", "Eerie Thaumaturge"],
    ["Covert Ranger", "Shock Enforcer", "Royal Protector"],
  ],
  available: true,
};
