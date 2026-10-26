import type { ActivityHubConfig } from "@/types/activity-hub";
import type { GuardianClass } from "@/types/armor-set";
import {
  VANGUARD_SET_DISPLAY_NAME,
  VANGUARD_SET_GROUP,
} from "@/lib/armor-sets/uniform-vanguard-sets";

/** Luminopotent — Vanguard Ops armor from Solo Ops and Fireteam Ops (Monument of Triumph). */
const LUMINOPOTENT_SET_HASH = "499993704";

/** Eutechnology — Vanguard Ops armor from Arena Ops and Pinnacle Ops (Monument of Triumph). */
const EUTECHNOLOGY_SET_HASH = "2461275960";

export const VANGUARD_OPS_CURRENT_ARMOR_SETS = [
  {
    hash: LUMINOPOTENT_SET_HASH,
    previewFile: "luminopotent.webp",
    /** Playlists it drops in (community guides; Bungie's source text doesn't say). */
    source: "Solo & Fireteam Ops",
  },
  {
    hash: EUTECHNOLOGY_SET_HASH,
    previewFile: "eutechnology.webp",
    source: "Arena & Pinnacle Ops",
  },
] as const;

/** Legacy Vanguard sets that share one armor bonus across classes. */
export const LEGACY_VANGUARD_CROSS_CLASS_SETS: Partial<
  Record<string, Partial<Record<GuardianClass, string>>>
> = {
  [VANGUARD_SET_DISPLAY_NAME]: Object.fromEntries(
    Object.entries(VANGUARD_SET_GROUP).map(([guardianClass, entry]) => [
      guardianClass,
      entry.setName,
    ]),
  ) as Partial<Record<GuardianClass, string>>,
};

export const LEGACY_VANGUARD_CLASS_ITEMS: Partial<
  Record<string, Partial<Record<GuardianClass, string>>>
> = {
  [VANGUARD_SET_DISPLAY_NAME]: Object.fromEntries(
    Object.entries(VANGUARD_SET_GROUP)
      .filter(([, entry]) => entry.classItem !== entry.setName)
      .map(([guardianClass, entry]) => [guardianClass, entry.classItem]),
  ) as Partial<Record<GuardianClass, string>>,
};

/** Triumph sections shown on the Vanguard Ops page (Legends > Strikes). */
/**
 * Weapon pools of the Vanguard Ops playlists in Monument of Triumph, shown as subgroups of the
 * Weapons block. Bungie's source text only names the playlist for a few new weapons, so the
 * pools are listed by hash (catalog entries; any owned version counts), from community loot
 * tables (blueberries.gg attunement, shatteredvault.com, Oct 2026). Pinnacle Ops = the pool
 * shared by every mission (mission-specific loot is not included). Threat Level, the 11th
 * Black Armory reissue, drops in the Pantheon instead of Arena Ops.
 */
export const VANGUARD_OPS_WEAPON_POOLS: { title: string; hashes: string[] }[] = [
  {
    title: "Solo Ops",
    hashes: [
      "4113452819", // Fair Judgment
      "1713388226", // Ascendancy
      "1716620044", // Chain of Command
      "938936806", // Chivalric Fire
      "768696858", // Cry Mutiny
      "1942143745", // Ecliptic Distaff
      "3708636616", // Last Rite
      "979721268", // Malediction
      "2191451996", // Perfect Pitch
      "3085559077", // Reckless Endangerment
      "3273807888", // Resounding
      "438540299", // Veles-X
    ],
  },
  {
    title: "Fireteam Ops",
    hashes: [
      "2271714488", // Convened Recurve
      "2511482352", // Cynosure
      "1066772626", // Prolonged Engagement
      "1479562935", // Aurora Dawn
      "2901221332", // Main Ingredient
      "3470514298", // Nameless Midnight
      "1559068369", // Nightshade
      "1832481283", // Positive Outlook
      "1409524486", // Punching Out
      "59060498", // Service Revolver
    ],
  },
  {
    title: "Arena Ops · Black Armory reissues",
    hashes: [
      "1889005379", // Bellowing Giant
      "2631356658", // Blast Furnace
      "850999853", // Hammerhead
      "334964261", // Kindled Orchid
      "2979764077", // No Feelings
      "4206550094", // The Ringing Nail
      "2158575991", // Stryker's Sure-Hand
      "3595694326", // Tatara Gaze
      "2925315757", // Tempered Dynamo
      "1704597062", // The Spiteful Fang
    ],
  },
  {
    title: "Pinnacle Ops · all missions",
    hashes: [
      "891765152", // Adored
      "2920548486", // D.F.A.
      "837298567", // Lotus-Eater
      "1715391576", // Mint Retrograde
      "3718184802", // Ouster Engine
      "2461640837", // Salvager's Salvo
      "3960301269", // The Hothead
      "3303271523", // The Palindrome
      "189854537", // The Slammer
      "149110926", // Whatchamacallit
      "3613444087", // Null Composure
    ],
  },
];

export const VANGUARD_OPS_TRIUMPH_GROUP = "legends" as const;

export const VANGUARD_OPS_TRIUMPH_COLUMNS = [
  {
    heading: "Legends // Strikes // Cosmodrome",
    sectionPath: ["Strikes", "Cosmodrome"],
  },
  {
    heading: "Legends // Strikes // Prison of Elders",
    sectionPath: ["Strikes", "Prison of Elders"],
  },
] as const;

export const VANGUARD_OPS_HUB: ActivityHubConfig = {
  slug: "vanguard-ops",
  title: "Vanguard Ops",
  titleSlug: "vanguard-ops",
  headerImageUrl: "/images/headers/vanguard-ops-header.webp",
  currentArmorSetHashes: VANGUARD_OPS_CURRENT_ARMOR_SETS.map((set) => set.hash),
  armorSetPreviewFiles: VANGUARD_OPS_CURRENT_ARMOR_SETS.map(
    (set) => set.previewFile,
  ),
  excludeLegacySetNames: [
    "Luminopotent",
    "Luminopotent Set",
    "Eutechnology",
    "Eutechnology Set",
    "The Shelter in Place",
    "The Took Offense",
    "Xenos Vale IV",
    "Mark of Shelter",
    "Xenos Vale Bond",
  ],
};
