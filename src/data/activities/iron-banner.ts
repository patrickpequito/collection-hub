import type { ActivityHubConfig } from "@/types/activity-hub";
import type { GuardianClass } from "@/types/armor-set";

/** Iron Battalion — current Iron Banner armor (Monument of Triumph). */
const IRON_BATTALION_SET_HASH = "1777208707";

/**
 * Legacy Iron Banner sets whose class items do not share the set name prefix
 * (e.g. Iron Truage uses Radegast's Iron Sash, not "Iron Truage Mark").
 */
export const LEGACY_IRON_BANNER_CLASS_ITEMS: Partial<
  Record<string, Record<GuardianClass, string>>
> = {
  "Iron Remembrance": {
    hunter: "Cloak of Remembrance",
    titan: "Mark of Remembrance",
    warlock: "Bond of Remembrance",
  },
  "Iron Truage": {
    hunter: "Mantle of Efrideet",
    titan: "Radegast's Iron Sash",
    warlock: "Timur's Iron Bond",
  },
  "Iron Companion": {
    hunter: "Wolfswood Cloak",
    titan: "Wolfswood Mark",
    warlock: "Wolfswood Bond",
  },
};

export const IRON_BANNER_HUB: ActivityHubConfig = {
  slug: "iron-banner",
  title: "Iron Banner",
  titleSlug: "iron-banner",
  headerImageUrl: "/images/headers/iron-banner-header.webp",
  currentArmorSetHashes: [IRON_BATTALION_SET_HASH],
  armorSetPreviewFiles: ["iron-battalion-set.webp"],
  excludeLegacySetNames: ["Iron Battalion Set", "Iron Battalion"],
};

/** Rotating Iron Banner weapon focus pools (Saladin vendor). */
export const IRON_BANNER_WEAPON_POOLS = [
  {
    id: "pool-1",
    label: "Pool 1",
    weaponNames: [
      "The Forward Path",
      "The Time-Worn Spire",
      "The Wizened Rebuke",
      "Crimil's Dagger",
      "Gunnora's Axe",
      "Felwinter's Lie",
      "Reghusk's Pledge",
    ],
  },
  {
    id: "pool-2",
    label: "Pool 2",
    weaponNames: [
      "Multimach CCX",
      "Finite Impactor",
      "Occluded Finality",
      "Lethal Abundance",
      "Pressurized Precision",
      "Point of the Stag",
      "Roar of the Bear",
    ],
  },
] as const;

export const IRON_BANNER_ACTIVE_WEAPON_POOL_ID = "pool-1";
