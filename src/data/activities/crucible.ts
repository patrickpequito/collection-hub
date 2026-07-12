import type { ActivityHubConfig } from "@/types/activity-hub";
import type { GuardianClass } from "@/types/armor-set";
import { BINARY_PHOENIX_CRUCIBLE_GROUP } from "@/lib/armor-sets/uniform-crucible-sets";

/** Per Audacia — current Crucible armor (Monument of Triumph). */
const PER_AUDACIA_SET_HASH = "2618364783";

/** Triumphal Anthem — prior Crucible armor rotation (Monument of Triumph). */
const TRIUMPHAL_ANTHEM_SET_HASH = "50540439";

export const CRUCIBLE_CURRENT_ARMOR_SETS = [
  {
    hash: TRIUMPHAL_ANTHEM_SET_HASH,
    previewFile: "triumphal-anthem.webp",
  },
  {
    hash: PER_AUDACIA_SET_HASH,
    previewFile: "per-audacia-set.webp",
  },
] as const;

/** Legacy Crucible sets that share one armor bonus across classes. */
export const LEGACY_CRUCIBLE_CROSS_CLASS_SETS: Partial<
  Record<string, Partial<Record<GuardianClass, string>>>
> = {
  "Binary Phoenix Set": {
    warlock: "Ankaa Seeker IV",
    titan: "Phoenix Strife Type 0",
    hunter: "Swordflight 4.1",
  },
  "Wing Set": {
    hunter: "Wing Contender",
    titan: "Wing Discipline",
    warlock: "Wing Theorem",
  },
};

export const LEGACY_CRUCIBLE_CLASS_ITEMS: Partial<
  Record<string, Partial<Record<GuardianClass, string>>>
> = {
  "Binary Phoenix Set": Object.fromEntries(
    Object.entries(BINARY_PHOENIX_CRUCIBLE_GROUP).map(
      ([guardianClass, entry]) => [guardianClass, entry.classItem],
    ),
  ) as Partial<Record<GuardianClass, string>>,
};

export const CRUCIBLE_HUB: ActivityHubConfig = {
  slug: "crucible",
  title: "Crucible",
  titleSlug: "crucible",
  headerImageUrl: "/images/headers/crucible-header.webp",
  currentArmorSetHashes: CRUCIBLE_CURRENT_ARMOR_SETS.map((set) => set.hash),
  armorSetPreviewFiles: CRUCIBLE_CURRENT_ARMOR_SETS.map((set) => set.previewFile),
  excludeLegacySetNames: [
    "Per Audacia Set",
    "Per Audacia",
    "Triumphal Anthem",
    "Triumphal Anthem Set",
    "Ankaa Seeker IV",
    "Phoenix Strife Type 0",
    "Swordflight 4.1",
    "Wing Contender",
    "Wing Discipline",
    "Wing Theorem",
    "Binary Phoenix Bond",
    "Binary Phoenix Mark",
    "Binary Phoenix Cloak",
  ],
};
