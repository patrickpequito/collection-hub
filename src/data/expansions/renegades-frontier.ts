/**
 * Renegades page: Lawless Frontier, Clans and Collectibles.
 * Everything is a lasting goal (title / triumph objectives, Syndicate ranks, purchased
 * ability upgrades) — never the rotating Contracts, which the game shows anyway.
 */

/** One bar tile: a triumph objective with a fixed goal. */
export type FrontierGoal = {
  label: string;
  /** Words on the first line; the rest shares the second line with the count. */
  breakAfter?: number;
  recordHash: string;
  /** Objective on the record; the first one when omitted. */
  objectiveHash?: string;
  total: number;
  /** Show the count in thousands ("126.4K / 200K"). */
  compact?: boolean;
};

export type FrontierBanner = {
  id: "tharsis-outpost" | "invasion";
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  /** Accent colour (hex) and its RGB triple for translucent borders / glows. */
  accent: string;
  accentRgb: string;
  goals: FrontierGoal[];
};

const PGCR = "https://www.bungie.net/img/destiny_content/pgcr";

export const RENEGADES_FRONTIER_BANNERS: FrontierBanner[] = [
  {
    id: "tharsis-outpost",
    eyebrow: "Social space",
    title: "Tharsis Outpost",
    subtitle: "Spider's Lounge",
    imageUrl: `${PGCR}/lawless_frontier_mars.jpg`,
    accent: "#e0a060",
    accentRgb: "224,160,96",
    goals: [
      // "Make a Killing"
      { label: "Credits earned", recordHash: "3740247985", objectiveHash: "1505092518", total: 200000, compact: true },
      // "Gun for Hire"
      { label: "Contracts completed", recordHash: "138558716", total: 21 },
      // "A Dishonest Living"
      { label: "Bounty, smuggle & sabotage objectives", breakAfter: 3, recordHash: "3692514386", total: 21 },
      // "Salaried Mercenary"
      { label: "Weekly Shipments", recordHash: "4091377593", total: 3 },
    ],
  },
  {
    id: "invasion",
    eyebrow: "Guardian vs. Guardian",
    title: "Invasion",
    subtitle: "Hunt other Guardians on the Lawless Frontier",
    imageUrl: `${PGCR}/lawless_frontier_europa.jpg`,
    accent: "#e0584e",
    accentRgb: "224,88,78",
    goals: [
      // "Ruthless Pursuit"
      { label: "Guardians defeated", recordHash: "4204991388", total: 50 },
      // "Full Pockets"
      { label: "Invasion points", recordHash: "1758080484", total: 100 },
      // "Resourceful Renegade"
      { label: "Renegade Ability final blows", breakAfter: 2, recordHash: "685804907", total: 30 },
      // "Invader Repellent"
      { label: "Invaders defeated", recordHash: "3882321975", total: 10 },
    ],
  },
];

/**
 * A Renegade Ability. Bungie exposes no upgrade level (the ability vendors don't answer
 * through the API), only "acquired" — one objective per ability on the clan's triumph.
 */
export type RenegadeAbility = {
  name: string;
  iconPath: string;
  recordHash: string;
  objectiveHash: string;
};

export type RenegadeAbilityGroup = {
  id: "pikers" | "tharsis-reformation" | "totality-division" | "spider";
  name: string;
  /** Syndicate reputation (none for Spider's base abilities). */
  progressionHash?: string;
  iconPath?: string;
  ranks?: string[];
  abilities: RenegadeAbility[];
};

const ICONS = "/common/destiny2_content/icons";

/** "Royal Flush": every ability fully upgraded — the only upgrade level Bungie exposes. */
export const RENEGADE_ABILITIES_MAXED_RECORD = { recordHash: "867842624", objectiveHash: "2892115053" };

export const RENEGADE_ABILITY_GROUPS: RenegadeAbilityGroup[] = [
  {
    id: "pikers",
    name: "The Pikers",
    progressionHash: "639915560",
    iconPath: `${ICONS}/afb566e38e416b96bb802af6043ef9bd.png`,
    ranks: ["Nobody", "Acquaintance", "Friend", "Confidant", "Family"],
    abilities: [
      {
        name: "Piker Mortar",
        iconPath: `${ICONS}/aab2efa54c97fbc900f3290d29185ddd.png`,
        recordHash: "1964116222",
        objectiveHash: "1324324063",
      },
      {
        name: "Falcon",
        iconPath: `${ICONS}/08c3543f9e4a10ac6cc415632c6c2ea1.png`,
        recordHash: "1964116222",
        objectiveHash: "1324324062",
      },
    ],
  },
  {
    id: "tharsis-reformation",
    name: "Tharsis Reformation",
    progressionHash: "2339655916",
    iconPath: `${ICONS}/3e39bbc0f988fab47b91619d018ee4d6.png`,
    ranks: ["Null Data", "Open Connection", "Reliable Backup", "Authorized User", "Trusted System"],
    abilities: [
      {
        name: "Vex Deflector",
        iconPath: `${ICONS}/55221dbd7f5194cdf44c44cf92afb0c0.png`,
        recordHash: "208891670",
        objectiveHash: "3601721031",
      },
      {
        name: "Vex Stun Field",
        iconPath: `${ICONS}/6ae2fc3ff65f6eba2b168dff6ab5288c.png`,
        recordHash: "208891670",
        objectiveHash: "3601721030",
      },
    ],
  },
  {
    id: "totality-division",
    name: "Totality Division",
    progressionHash: "2136678968",
    iconPath: `${ICONS}/2bb4a4b42d92bc7187598f84426880b9.png`,
    ranks: ["Nothing", "Known Entity", "Implicit Ally", "Honored Asset", "Esteemed Operator"],
    abilities: [
      {
        name: "Imperium Drop Pod",
        iconPath: `${ICONS}/26a8f266a4088984dce948020b451a5a.png`,
        recordHash: "1234501850",
        objectiveHash: "1934634947",
      },
      {
        name: "Imperium Behemoth",
        iconPath: `${ICONS}/67b78695e301a8f62a243bd5319ad162.png`,
        recordHash: "1234501850",
        objectiveHash: "1934634946",
      },
    ],
  },
  {
    id: "spider",
    name: "Spider",
    abilities: [
      {
        name: "Strafing Run",
        iconPath: `${ICONS}/2301febd95badd3dfb5441990ceaf838.png`,
        recordHash: "3247637802",
        objectiveHash: "2488405841",
      },
      {
        name: "Revitalize",
        iconPath: `${ICONS}/b43b08f88f0de3602fcc8a966ba16065.png`,
        recordHash: "3247637802",
        objectiveHash: "2488405843",
      },
      {
        name: "Recon Shank",
        iconPath: `${ICONS}/b8a2d260eff0a3881a4b0133de67519d.png`,
        recordHash: "3247637802",
        objectiveHash: "2488405842",
      },
    ],
  },
];

/** Collectibles: notch counts from triumph objectives. */
export type CollectibleGoal = {
  label: string;
  recordHash: string;
  objectiveHash?: string;
  total: number;
};

// "Wasteland Salvager"
export const RENEGADES_FRONTIER_GOODS: CollectibleGoal[] = [
  { label: "Chests opened", recordHash: "3046325659", objectiveHash: "890550752", total: 21 },
  { label: "Vessel valuables", recordHash: "3046325659", objectiveHash: "890550753", total: 21 },
  { label: "Destination materials", recordHash: "3046325659", objectiveHash: "890550754", total: 21 },
];
export const RENEGADES_SECRETS: CollectibleGoal[] = [
  // "Listen In"
  { label: "Tapes", recordHash: "352520803", total: 14 },
  // "Cherished Constellation"
  { label: "Ghosts", recordHash: "3667438640", total: 18 },
];
/** "See New Places": one objective per planet. */
export const RENEGADES_INVASION_PLANETS = {
  recordHash: "1180686146",
  planets: [
    { name: "Mars", objectiveHash: "333314586" },
    { name: "Venus", objectiveHash: "333314585" },
    { name: "Europa", objectiveHash: "333314587" },
  ],
};

/**
 * Praxic Blade: unlockable crystals, Blade Focus mods, Power Cores, catalysts and forms — the
 * sword's reusable plug sets. Unlocked plugs come through profile plug sets (ownership).
 * Empty sockets are left out. Tiered mods (II, III) also unlock the tiers below.
 */
export type PraxicBladeGroup = {
  title: string;
  ownedBorder?: "gold" | "green";
  items: { itemHash: string; name: string; iconPath: string; ownershipHashes?: string[] }[];
};

/** The sword's reusable plug sets: crystals, Blade Focus, Power Core, catalyst, form. */
export const PRAXIC_BLADE_PLUG_SETS = ["834611546", "3509696948", "3381784778", "1144056881", "2133628599"];

export const PRAXIC_BLADE_GROUPS: PraxicBladeGroup[] = [
  {
    title: "Crystals",
    // Yellow crystals: a green owned border reads better than gold (as on exotics).
    ownedBorder: "green",
    items: [
      { itemHash: "1773007622", name: "Dark Matter Crystal: Red", iconPath: "/common/destiny2_content/icons/ede163e34314c2c31977be04a59f3713.jpg" },
      { itemHash: "1773007623", name: "Dark Matter Crystal: Orange", iconPath: "/common/destiny2_content/icons/f7a906a5f36dada5f52cfd519a87a623.jpg" },
      { itemHash: "1773007620", name: "Dark Matter Crystal: Green", iconPath: "/common/destiny2_content/icons/034d343460a0a07547d4de89ab0cd002.jpg" },
      { itemHash: "1773007621", name: "Dark Matter Crystal: Cyan", iconPath: "/common/destiny2_content/icons/31ccf5711352173ed52665a2c9559dc2.jpg" },
      { itemHash: "1773007618", name: "Dark Matter Crystal: Blue", iconPath: "/common/destiny2_content/icons/5e80efe498d2bab5668263383f7b10dd.jpg" },
      { itemHash: "1773007619", name: "Dark Matter Crystal: Indigo", iconPath: "/common/destiny2_content/icons/7c48ac8b3f46d74e130a9f3e1648c4c6.jpg" },
      { itemHash: "1773007616", name: "Dark Matter Crystal: Magenta", iconPath: "/common/destiny2_content/icons/f02b9700b8bc46a371e4914131e30f62.jpg" },
      { itemHash: "1773007617", name: "Dark Matter Crystal: Taken", iconPath: "/common/destiny2_content/icons/70d0f7f1f67e5c345f5700d4bcdab9f8.jpg" },
      { itemHash: "1773007630", name: "Dark Matter Crystal: Yellow", iconPath: "/common/destiny2_content/icons/2f481d42d61e85f3cbe7b2b174838e9a.jpg" },
      { itemHash: "898360257", name: "Dark Matter Crystal: White", iconPath: "/common/destiny2_content/icons/cf8bd84b44fd25aad61bc96883270ac1.jpg" },
      { itemHash: "898360256", name: "Dark Matter Crystal: Gradient", iconPath: "/common/destiny2_content/icons/176a9aaab02fc9a6be3ad52454e1e9e5.jpg" },
      { itemHash: "898360259", name: "Dark Matter Crystal: Purple", iconPath: "/common/destiny2_content/icons/641b3207ad4494386b8f91309bb8f0b1.jpg" },
      { itemHash: "1530603180", name: "Dark Matter Crystal: Warmind", iconPath: "/common/destiny2_content/icons/8dc8de015f921001279af2515f56b8be.jpg" },
      { itemHash: "1530603181", name: "Dark Matter Crystal: Vex", iconPath: "/common/destiny2_content/icons/f8ab9ceef67c74db49320125f1ed0823.jpg" },
      { itemHash: "1530603182", name: "Dark Matter Crystal: Prismatic", iconPath: "/common/destiny2_content/icons/b52d397e47349046f456ed0161dd10f9.jpg" },
    ],
  },
  {
    title: "Blade Focus",
    items: [
      { itemHash: "749248213", name: "Crystal Strength", iconPath: "/common/destiny2_content/icons/980412963c201cb5ef8c5f0d8ef4b895.png", ownershipHashes: ["749248213", "749248212", "749248215"] },
      { itemHash: "749248212", name: "Crystal Strength II", iconPath: "/common/destiny2_content/icons/980412963c201cb5ef8c5f0d8ef4b895.png", ownershipHashes: ["749248212", "749248215"] },
      { itemHash: "749248215", name: "Crystal Strength III", iconPath: "/common/destiny2_content/icons/980412963c201cb5ef8c5f0d8ef4b895.png" },
      { itemHash: "1596190499", name: "Grip", iconPath: "/common/destiny2_content/icons/4ac2eac943273ae9fefbb4a06fd485ae.png", ownershipHashes: ["1596190499", "1596190498", "1596190497"] },
      { itemHash: "1596190498", name: "Grip II", iconPath: "/common/destiny2_content/icons/4ac2eac943273ae9fefbb4a06fd485ae.png", ownershipHashes: ["1596190498", "1596190497"] },
      { itemHash: "1596190497", name: "Grip III", iconPath: "/common/destiny2_content/icons/4ac2eac943273ae9fefbb4a06fd485ae.png" },
      { itemHash: "2100631068", name: "Blade Ammo", iconPath: "/common/destiny2_content/icons/4cd98c06c2b4fdae2fe2aeac636527d0.png" },
      { itemHash: "3320668100", name: "Invigorating Blade", iconPath: "/common/destiny2_content/icons/c5d569e6d4a139590506347c8bfd27f0.png" },
      { itemHash: "3846969568", name: "Forceful Blade", iconPath: "/common/destiny2_content/icons/f9bb7d6f66e0d5236a12165fdf815871.png", ownershipHashes: ["3846969568", "3846969569", "3846969570"] },
      { itemHash: "3846969569", name: "Forceful Blade II", iconPath: "/common/destiny2_content/icons/f9bb7d6f66e0d5236a12165fdf815871.png", ownershipHashes: ["3846969569", "3846969570"] },
      { itemHash: "3846969570", name: "Forceful Blade III", iconPath: "/common/destiny2_content/icons/f9bb7d6f66e0d5236a12165fdf815871.png" },
    ],
  },
  {
    title: "Forms",
    items: [
      { itemHash: "1742690744", name: "Balanced Form", iconPath: "/common/destiny2_content/icons/e392a8a6cbab09d325975eedc8b1146c.png" },
      { itemHash: "3017226694", name: "Defensive Form", iconPath: "/common/destiny2_content/icons/4c974cb5a7bfa19a184c3ee965167758.png" },
      { itemHash: "3297559996", name: "Offensive Form", iconPath: "/common/destiny2_content/icons/db351fc86b151713e9f2eaff80f237cb.png" },
    ],
  },
  {
    title: "Power Cores",
    items: [
      { itemHash: "3268768926", name: "Impact Core", iconPath: "/common/destiny2_content/icons/b620bf71907abfed007939c36f5654fd.png" },
      { itemHash: "3268768927", name: "Refraction Core", iconPath: "/common/destiny2_content/icons/9abd9c24562c55cc0c9f8d876866c4ba.png" },
      { itemHash: "3268768924", name: "Gyro Core", iconPath: "/common/destiny2_content/icons/b7af43b9d740e8f8f198adc036cd6237.png" },
    ],
  },
  {
    title: "Catalysts",
    items: [
      { itemHash: "1808259049", name: "Echoing Blade", iconPath: "/common/destiny2_content/icons/2c4f6466ba7de74ec14e68395b71f2b3.jpg" },
      { itemHash: "1808259048", name: "Upper Hand", iconPath: "/common/destiny2_content/icons/2d94925245da8f58386d855fd7dc727f.jpg" },
      { itemHash: "1808259051", name: "Hyperblade", iconPath: "/common/destiny2_content/icons/8709d34751bad6a2093a397ba32dceef.jpg" },
      { itemHash: "1808259050", name: "Energy Conduit", iconPath: "/common/destiny2_content/icons/1e5fd633e76a0acbc81fa789766ff8d1.jpg" },
    ],
  },
];
