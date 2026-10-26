/** Monument of Triumph (Renegades year) — reissued gear, ornament sets and the Immortal seal. */
export const MONUMENT_OF_TRIUMPH_HUB = {
  slug: "monument-of-triumph",
  title: "Monument of Triumph",
  headerImageUrl: "/images/banners/monument-of-triumph.webp",
  triumphGroup: "monument-of-triumph",
  titleSlug: "monument-of-triumph",
} as const;

/** Where an ornament set comes from (matched on the catalog "Source" text). */
const MONUMENT_SOURCE = /monument of triumph/i;
const REWARDS_PASS_SOURCE = /rewards pass/i;

/**
 * Ornament sets unlocked at the Monument (Sparrow Racing League sets live on the SRL page).
 * Matched by piece name; `source` defaults to the Monument.
 */
export type MonumentOrnamentSetConfig = {
  name: string;
  pattern: RegExp;
  source?: RegExp;
  /** One set with a different name per class (shown with the class toggle). */
  classNames?: Record<"hunter" | "titan" | "warlock", string>;
};

export const MONUMENT_ORNAMENT_SETS: MonumentOrnamentSetConfig[] = [
  { name: "Entheogenic Parasite", pattern: /^Entheogenic Parasite / },
  { name: "Immortal Legend", pattern: /^Immortal Legend / },
  { name: "Neotenic Starfarer", pattern: /^Neotenic Starfarer / },
  { name: "Frontline", pattern: /^Frontline / },
  { name: "Autonomous Flayer", pattern: /^Autonomous Flayer / },
  { name: "Houseless", pattern: / of the Houseless$/ },
  { name: "Dionaea", pattern: /^Dionaea / },
  { name: "Ever Sunrise", pattern: /^Ever Sunrise / },
  { name: "New Pilgrim Guard", pattern: / of the New Pilgrim Guard$/ },
  { name: "Outlaw Rider", pattern: /^Outlaw Rider / },
  // Special offer: one set (one preview) named differently per class.
  {
    name: "Pattern Breaker",
    pattern: /^(Pattern Breaker|Synthetic Nihility|Brutal Warweave) /,
    source: /special offer/i,
    classNames: { hunter: "Synthetic Nihility", titan: "Brutal Warweave", warlock: "Pattern Breaker" },
  },
];

/**
 * Ornaments that are not part of a set: Monument helmets, exotic Eververse ornaments
 * (one per class) and the Rewards Pass helmet.
 */
export const MONUMENT_SINGLE_ORNAMENTS: { pattern: RegExp; source: RegExp }[] = [
  { pattern: /^(Infectious Diadem|Honored Guard's Visor|Einherjar Coronet)$/, source: MONUMENT_SOURCE },
  { pattern: /^(Predestination|Blazing Hearth|Gaze beyond Worlds)$/, source: /eververse/i },
  { pattern: /^Witch Queen's Crown$/, source: REWARDS_PASS_SOURCE },
];

/** Rewards Pass ornament sets and helmet (the Lucent name is shared with an older Eververse set). */
export const MONUMENT_REWARDS_PASS_SETS: MonumentOrnamentSetConfig[] = [
  { name: "Digital Devil", pattern: /^Digital Devil /, source: REWARDS_PASS_SOURCE },
  { name: "Lightguard", pattern: /^Lightguard /, source: REWARDS_PASS_SOURCE },
  { name: "Lucent", pattern: /^Lucent /, source: REWARDS_PASS_SOURCE },
];

/**
 * Rewards Pass ("Triumphant" pass) rewards besides the ornament sets, from the manifest's
 * season pass progression. Bungie tags them with the Season: Lawless watermark, so they are
 * listed by item hash.
 */
export const MONUMENT_REWARDS_PASS_ITEM_HASHES = new Set([
  "825804466", // Buoy Buddy Ghost
  "2706914450", // The Dignitary
  "1319047143", // Jelly Jelly
  "3628750608", // Wistful Palindrome
  "1319047142", // Cheloniidae Charm
  "253843484", // Turncoat
  "3211533163", // Hive Swarm
  "1510229956", // Dynamite Operation
  "1066982989", // Hero's Habiliments
  "367044134", // The Wavewarden
  "2553840522", // Cleft in Twain
  "1294121820", // Lucent Flutter Entrance
  "3765227746", // Impact Trajectory
  "1507928796", // Cobwebbed
  "1319047141", // Zebra Vivid
  "3859356488", // Tenacious Assailant
  "3298047565", // Chitinous Shell
  "1319047140", // Chromatophore
  "95483422", // Peaceful Shell
  "323063799", // Power Chord
  "2638027803", // Vermicular Mandible
  "1319047139", // Undersea Warning
  "291453145", // Bermuda Class Hover Ship
  "4081746321", // Lakeside
  "3857323125", // Fluorescent Explorer
  "1621116596", // Loyalist
  "1507928797", // Deco Sweetie
  "3335945268", // Moth Projection
  "1294121821", // War Beast Entrance
  "1507928798", // Midnight Crocodile
]);

/**
 * Other Monument rewards the catalog files under Eververse or an older season
 * (Monument cosmetics, plus older gear the Monument also hands out).
 */
export const MONUMENT_EXTRA_REWARD_HASHES = new Set([
  "1227566395", // Arc-Core Shell
  "1227566398", // Cosmo Scout Shell
  "1227566393", // Wingèd Shell
  "1227566392", // Wee-Woo Shell
  "3883446118", // Biplane Shell
  "2640516753", // Conductive Cruiser-RR
  "2640516756", // The Scrapper
  "2640516755", // Swift Messenger
  "2640516754", // Firster Aid
  "1251002686", // The Bullet
  "1251002683", // Electron Flit
  "1251002681", // Windswift
  "1251002680", // The Cardiac Arrester
  "3470260969", // Chatterwhite
  "2653012761", // Superblack
  "4079130216", // Nephilim Toaster
  "4079130221", // Unwilling Revolt 00-Z
  "329884213", // Toy Space Wizards
  "2894282039", // Allstar Vector
  "4019038402", // Gryphon
  "2084878005", // Heir Apparent
]);

/** Rewards missing from the catalog (no Collections entry): drawn from the manifest. */
export const MONUMENT_EXTRA_ITEMS = [
  {
    itemHash: "3970456737",
    name: "Pollinator Projection",
    iconPath: "/common/destiny2_content/icons/a74763986f319c0d91d19565b502cc9e.jpg",
    seasonIconPath: "/common/destiny2_content/icons/4376a7d734583ae347acf9732aa3bb43.png",
    source: "Source: Rewards Pass",
    itemType: "Ghost Projection",
    rarity: "Legendary",
  },
  {
    itemHash: "3603445771",
    name: "Flutterby Entrance",
    iconPath: "/common/destiny2_content/icons/ea91a80e91cdd63ba419fe8671ad63a0.jpg",
    seasonIconPath: "/common/destiny2_content/icons/e78fd9419f99464816ac8f628bc3c4af.png",
    source: "Source: Monument of Triumph",
    itemType: "Transmat Effect",
    rarity: "Legendary",
  },
  {
    itemHash: "3775812469",
    name: "Iris Pulsator Shell",
    iconPath: "/common/destiny2_content/icons/a0536b6d75ae39634f533ded9fa53e2c.jpg",
    seasonIconPath: "/common/destiny2_content/icons/da5f961ef97b78293cc498978c10e178.png",
    source: "Source: Monument of Triumph",
    itemType: "Ghost Shell",
    rarity: "Exotic",
  },
  {
    itemHash: "1621116597",
    name: "Of Two Minds",
    iconPath: "/common/destiny2_content/icons/4d0ff9d5f219499dd91cbca22f86c71b.jpg",
    seasonIconPath: "/common/destiny2_content/icons/4376a7d734583ae347acf9732aa3bb43.png",
    source: "Source: Monument of Triumph",
    itemType: "Ornament",
    rarity: "Exotic",
  },
];

export { MONUMENT_SOURCE, REWARDS_PASS_SOURCE };

/** Monument cosmetics in display order (finishers and combat flair are catalog "Emote"s). */
export const MONUMENT_COSMETIC_TYPES: { title: string; type: string; emoteKind?: string | null; alsoKind?: string }[] = [
  { type: "Emblem", title: "Emblems" },
  { type: "Shader", title: "Shaders" },
  { type: "Ship", title: "Ships" },
  { type: "Sparrow", title: "Sparrows" },
  { type: "Ghost Shell", title: "Ghost Shells" },
  { type: "Emote", emoteKind: null, title: "Emotes" },
  { type: "Emote", emoteKind: "Finisher", title: "Finishers" },
  // Weapon ornaments and combat flair (weapon kill effects) share a block.
  { type: "Ornament", alsoKind: "Combat Flair", title: "Weapon Ornaments" },
  { type: "Transmat Effect", title: "Transmat Effects" },
  { type: "Ghost Projection", title: "Ghost Projections" },
];

/** Armor sets added to the playlists with Monument of Triumph (same previews as the playlist pages). */
export const MONUMENT_ARMOR_SETS = [
  { hash: "499993704", playlist: "Vanguard Ops", href: "/activities/vanguard-ops", previewFile: "luminopotent.webp" },
  { hash: "2461275960", playlist: "Vanguard Ops", href: "/activities/vanguard-ops", previewFile: "eutechnology.webp" },
  { hash: "2618364783", playlist: "Crucible", href: "/activities/crucible", previewFile: "per-audacia-set.webp" },
  { hash: "50540439", playlist: "Crucible", href: "/activities/crucible", previewFile: "triumphal-anthem.webp" },
  { hash: "1790308978", playlist: "Gambit", href: "/activities/gambit", previewFile: "cyberserpent-null.webp" },
  { hash: "1777208707", playlist: "Iron Banner", href: "/activities/iron-banner", previewFile: "iron-battalion-set.webp" },
  {
    hash: "742845781",
    playlist: "Trials of Osiris",
    href: "/activities/trials-of-osiris",
    previewFile: "cruel-electrum-set.webp",
  },
] as const;
