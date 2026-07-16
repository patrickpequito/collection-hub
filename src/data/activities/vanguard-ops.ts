import type { ActivityHubConfig } from "@/types/activity-hub";
import type { GuardianClass } from "@/types/armor-set";
import {
  VANGUARD_SET_DISPLAY_NAME,
  VANGUARD_SET_GROUP,
} from "@/lib/armor-sets/uniform-vanguard-sets";

/** Luminopotent — current Vanguard Ops armor rotation (Monument of Triumph). */
const LUMINOPOTENT_SET_HASH = "499993704";

/** Eutechnology — prior Vanguard Ops armor rotation (Monument of Triumph). */
const EUTECHNOLOGY_SET_HASH = "2461275960";

export const VANGUARD_OPS_CURRENT_ARMOR_SETS = [
  {
    hash: LUMINOPOTENT_SET_HASH,
    previewFile: "luminopotent.webp",
  },
  {
    hash: EUTECHNOLOGY_SET_HASH,
    previewFile: "eutechnology.webp",
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
