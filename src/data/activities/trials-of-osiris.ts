import type { ActivityHubConfig } from "@/types/activity-hub";
import type { GuardianClass } from "@/types/armor-set";

/** Cruel Electrum — current Trials armor (Monument of Triumph). */
const CRUEL_ELECTRUM_SET_HASH = "742845781";

/** Weekly reset when Trials of Osiris returned after Monument of Triumph. */
export const TRIALS_BONUS_POOL_EPOCH_MS = Date.parse(
  "2026-06-12T17:00:00Z",
);

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Legacy Trials sets whose class items do not share the set name prefix
 * (e.g. older sets with mismatched class items in the manifest snapshot).
 */
export const LEGACY_TRIALS_CLASS_ITEMS: Partial<
  Record<string, Partial<Record<GuardianClass, string>>>
> = {};

/**
 * Legacy Trials challenge sets that use different names per class but share
 * one armor bonus. Keys are the display title shown in the legacy section.
 */
export const LEGACY_TRIALS_CROSS_CLASS_SETS: Partial<
  Record<string, Partial<Record<GuardianClass, string>>>
> = {
  "Episode: Heresy Set": {
    titan: "Jackal-Heart",
    hunter: "Cat-Eye",
    warlock: "Falcon-Wing",
  },
  "Season of the Witch Set": {
    titan: "Fused Aurum",
    hunter: "Photonic",
    warlock: "Skybreaker",
  },
};

/** Legacy Trials sets whose pieces all end with the same name suffix. */
export const LEGACY_TRIALS_NAME_SUFFIX_SETS: Record<string, string> = {
  "Exile Set": " of the Exile",
};

export const TRIALS_OF_OSIRIS_HUB: ActivityHubConfig = {
  slug: "trials-of-osiris",
  title: "Trials of Osiris",
  titleSlug: "flawless",
  headerImageUrl: "/images/headers/trials-of-osiris-header.webp",
  currentArmorSetHashes: [CRUEL_ELECTRUM_SET_HASH],
  armorSetPreviewFiles: ["cruel-electrum-set.webp"],
  excludeLegacySetNames: [
    "Cruel Electrum Set",
    "Cruel Electrum",
    "Jackal-Heart",
    "Fused Aurum",
    "Cat-Eye",
    "Falcon-Wing",
    "Photonic",
    "Skybreaker",
  ],
};

/** Bonus focus pools rotate every three weekends (Monument of Triumph). */
export const TRIALS_WEAPON_POOLS = [
  {
    id: "pool-1",
    label: "Bonus Pool 1",
    weaponNames: [
      "The Scholar",
      "Exile's Curse",
      "Sola's Scar",
      "Forgiveness",
      "Aisha's Embrace",
      "Corundum Hammer",
      "Astral Horizon",
    ],
  },
  {
    id: "pool-2",
    label: "Bonus Pool 2",
    weaponNames: [
      "Aisha's Care",
      "Keen Thistle",
      "Willful Hamartia",
      "The Immortal",
      "Burden of Guilt",
      "Unwavering Duty",
      "Cataphract GL3",
    ],
  },
  {
    id: "pool-3",
    label: "Bonus Pool 3",
    weaponNames: [
      "Exalted Truth",
      "Eye of Sol",
      "Tomorrow's Answer",
      "Everburning Glitz",
      "Auric Disabler",
      "Aureus Neutralizer",
      "The Martlet",
    ],
  },
  {
    id: "lighthouse",
    label: "Lighthouse",
    weaponNames: [
      "Igneous Hammer",
      "The Messenger",
      "Shayura's Wrath",
      "The Summoner",
      "The Inquisitor",
    ],
  },
] as const;

export function getActiveTrialsBonusPoolId(
  nowMs = Date.now(),
): (typeof TRIALS_WEAPON_POOLS)[number]["id"] {
  const weeksSinceEpoch = Math.max(
    0,
    Math.floor((nowMs - TRIALS_BONUS_POOL_EPOCH_MS) / MS_PER_WEEK),
  );
  const poolIndex = (weeksSinceEpoch % 3) + 1;
  return `pool-${poolIndex}` as (typeof TRIALS_WEAPON_POOLS)[number]["id"];
}
