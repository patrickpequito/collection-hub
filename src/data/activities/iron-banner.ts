import type { ActivityHubConfig } from "@/types/activity-hub";

/** Iron Battalion — current Iron Banner armor (Monument of Triumph). */
const IRON_BATTALION_SET_HASH = "1777208707";

export {
  LEGACY_IRON_BANNER_CLASS_ITEMS,
} from "@/lib/armor-sets/legacy-iron-banner-class-items";

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

/**
 * Saladin's "Focused Decoding → Weapons → Vendor Exclusive Gear" (manifest vendor 3013461870):
 * weapons only he sells. Finite Impactor and Reghusk's Pledge are left out (already in a pool).
 */
export const IRON_BANNER_VENDOR_EXCLUSIVE_WEAPONS = [
  "Allied Demand",
  "Archon's Thunder",
  "Bite of the Fox",
  "Claws of the Wolf",
  "Frontier's Cry",
  "Jorum's Claw",
  "Peacebond",
  "Riiswalker",
  "The Hero's Burden",
  "Tinasha's Mastery",
  "Tusk of the Boar",
] as const;

/** Saladin's "Legacy Gear → Weapons" entries without an Iron Banner source in the catalog. */
export const IRON_BANNER_EXTRA_LEGACY_WEAPONS = ["Warlord's Spear"] as const;
