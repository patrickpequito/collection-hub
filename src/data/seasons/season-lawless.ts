import { type SeasonHub } from "@/data/seasons/types";

const byPool = (id: string, names: string[]) =>
  Object.fromEntries(names.map((name) => [name, id]));

/*
 * Season: Lawless (S28) ran with Renegades from Dec 2 2025. The manifest season (28) carries
 * two Rewards Passes: "Lawless" (until Jun 9 2026) and "Triumphant" (from Jun 9 2026, Turncoat),
 * whose sets and cosmetics live on the Monument of Triumph page.
 * Weapon sources aren't in the catalog ("Random Perks"): pools listed by the owner.
 */
const REWARDS_PASS_WEAPONS = ["Eighty-Six", "Monody-44", "Motif-41"];
// Hawthorne's Field-Forged Shotgun also drops in Arena Ops.
const FIRETEAM_OPS_WEAPONS = [
  "Evening SI4",
  "Hawthorne's Field-Forged Shotgun",
  "Nox Sidereal IV",
  "Psi Aeterna IV",
  "Something Something",
];
const PINNACLE_OPS_WEAPONS = ["A Good Shout", "Horror's Least", "Oxygen SR3", "Sarpedon-D"];
// Mos Athanor IV also drops in Featured Activities.
const CRUCIBLE_WEAPONS = ["Mos Athanor IV", "Peculiar Charm", "Qua Vinctus IV", "Riptide"];
const VANGUARD_OPS_WEAPONS = ["Duty Bound"];
const TRIALS_WEAPONS = ["Astral Horizon", "Cataphract GL3", "Corundum Hammer", "The Immortal", "The Martlet"];
const IRON_BANNER_WEAPONS = ["Reghusk's Pledge"];

/** Lawless Rewards Pass cosmetics (manifest season pass 3258768682). */
const LAWLESS_PASS_COSMETICS = [
  "Gloryseeker",
  "Prison of Crumbled Forms",
  "Visionary Shell",
  "Celebrant Projection",
  "Absinthium",
  "Worn Interference",
  "Fresh-Faced",
  "Rustworn",
  "Phalanx Entrance",
  "Wireframe Entrance",
  "Deadly Trap",
  "Behold!",
  "Dialed In",
];

/** Triumphant Rewards Pass cosmetics (season pass 3258768683): on the Monument of Triumph page. */
const TRIUMPHANT_PASS_COSMETICS = [
  "Pollinator Projection",
  "Moth Projection",
  "Buoy Buddy Ghost",
  "Chitinous Shell",
  "Peaceful Shell",
  "The Dignitary",
  "Impact Trajectory",
  "Bermuda Class Hover Ship",
  "Wistful Palindrome",
  "The Wavewarden",
  "Vermicular Mandible",
  "Lakeside",
  "Jelly Jelly",
  "Cheloniidae Charm",
  "Hero's Habiliments",
  "Cobwebbed",
  "Zebra Vivid",
  "Chromatophore",
  "Undersea Warning",
  "Deco Sweetie",
  "Midnight Crocodile",
  "Hive Swarm",
  "Dynamite Operation",
  "Tenacious Assailant",
  "Fluorescent Explorer",
  "Cleft in Twain",
  "Power Chord",
  "Lucent Flutter Entrance",
  "War Beast Entrance",
  "Loyalist",
  "Witch Queen's Crown",
];

export const SEASON_LAWLESS_HUB: SeasonHub = {
  slug: "s28-season-lawless",
  title: "Season: Lawless",
  seasonLabel: "S28 Season: Lawless",
  parentExpansionSlug: "renegades",
  seasonNumber: 28,
  titleIconPath:
    "/common/destiny2_content/icons/DestinySeasonPassDefinition_e26d26718aa8cdda042e116085bd3473.png",
  videos: [{ id: "trailer", label: "Season trailer", youtubeId: "esFPGaptCdg" }],
  // Rewards Pass sets (also Vanguard Ops / Crucible drops), the Vanguard set and the Trials set.
  armorSetNames: ["Ferropotent", "Wild Anthem", "Swordmaster's", "New Demotic"],
  ornamentSets: [{ setName: "Aedile's", armorSetName: "Ferropotent", position: "before" }],
  matchWeaponVersions: false,
  extraWeaponNames: [
    ...REWARDS_PASS_WEAPONS,
    ...FIRETEAM_OPS_WEAPONS,
    ...PINNACLE_OPS_WEAPONS,
    ...CRUCIBLE_WEAPONS,
    ...VANGUARD_OPS_WEAPONS,
    ...TRIALS_WEAPONS,
    ...IRON_BANNER_WEAPONS,
  ],
  excludedWeaponNames: [
    // Events: Guardian Games, The Dawning and other events.
    "Keraunios",
    "The Beacon",
    "Triple Laureate",
    "Fimbulwinter Stitch",
    "Mistral Lift",
    "Permafrost",
    "Action Item",
    "Gizmo Weft",
    "King Orfeo",
    "Micromort",
    "Submersion",
    "The Heron",
    // Triumphant Rewards Pass (Monument of Triumph page).
    "Turncoat",
  ],
  exoticItemNames: ["Service of Luzaku"],
  weaponPools: [
    { id: "rewards-pass", title: "Rewards Pass", sourcePattern: /(?!)/ },
    { id: "fireteam-ops", title: "Fireteam Ops", sourcePattern: /(?!)/ },
    { id: "pinnacle-ops", title: "Pinnacle Ops", sourcePattern: /(?!)/ },
    { id: "crucible", title: "Crucible", sourcePattern: /(?!)/ },
    { id: "vanguard-ops", title: "Vanguard Ops", sourcePattern: /(?!)/ },
    { id: "trials-of-osiris", title: "Trials of Osiris", sourcePattern: /(?!)/ },
    { id: "iron-banner", title: "Iron Banner", sourcePattern: /(?!)/ },
  ],
  weaponPoolByName: {
    ...byPool("rewards-pass", REWARDS_PASS_WEAPONS),
    ...byPool("fireteam-ops", FIRETEAM_OPS_WEAPONS),
    ...byPool("pinnacle-ops", PINNACLE_OPS_WEAPONS),
    ...byPool("crucible", CRUCIBLE_WEAPONS),
    ...byPool("vanguard-ops", VANGUARD_OPS_WEAPONS),
    ...byPool("trials-of-osiris", TRIALS_WEAPONS),
    ...byPool("iron-banner", IRON_BANNER_WEAPONS),
  },
  // Season: Lawless brought no activity of its own: it launched with Renegades.
  playableActivities: [],
  exoticPanelDescription: "Exotic weapon from the Season: Lawless Rewards Pass.",
  cosmeticPanelDescription: "Season: Lawless Rewards Pass cosmetics.",
  passName: "Rewards Pass",
  cosmeticRewards: LAWLESS_PASS_COSMETICS,
  showEververseCosmetics: true,
  // Rewards Pass cosmetics (both passes) are not Eververse items.
  excludedEververseNames: [...LAWLESS_PASS_COSMETICS, ...TRIUMPHANT_PASS_COSMETICS],
  // One set per class sold together (Hunter / Titan / Warlock names differ).
  eververseOrnamentSetGroups: [
    ["Singular Mercenary", "Devoted Warrior", "Noble Partisan"],
    ["Ripper", "Boogeyman", "Tattie-Bogle"],
    ["Mindsculptor", "Flamecaller", "Death's Majesty"],
    ["Synthetic Nihility", "Brutal Warweave", "Pattern Breaker"],
  ],
  // Marathon bundle ("Unlocked by a special offer"), shown with Eververse.
  extraEververseSetNames: ["Synthetic Nihility", "Brutal Warweave", "Pattern Breaker"],
  // Triumphant Rewards Pass ornament sets.
  excludedEververseSetNames: ["Lightguard", "Lucent", "Digital Devil"],
  available: true,
};
