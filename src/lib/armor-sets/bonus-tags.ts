import type { ArmorSetOriginGroup } from "@/lib/armor-sets/collection";
import type { ActivityArmorRow } from "@/types/activity-loot";
import type { ArmorSetBonus } from "@/types/armor-set-bonuses";
import type { GuardianClass } from "@/types/armor-set";

/** Effect tags derived from the bonus text (first match wins per tag). */
export const EFFECT_TAGS: [string, RegExp][] = [
  ["Weapons", /weapon|primary|special ammo|heavy ammo|reload|handling|precision|rifle|bow|sword|glaive|shotgun|sniper|launcher|submachine|pistol/i],
  ["Grenade", /grenade/i],
  ["Melee", /melee|finisher/i],
  ["Super", /\bsuper\b/i],
  ["Class ability", /class ability/i],
  ["Orbs", /orbs? of power/i],
  ["Survival", /health|shield|damage resistance|overshield|\bcure|restoration|heal|resist|revive/i],
  ["Movement", /sprint|slid(e|ing)|jump|speed|airborne/i],
  ["Elemental", /\b(solar|arc|void|stasis|strand|prismatic)\b|jolt|scorch|sever|volatile|weaken|freez|unravel|transcendence|amplified|radiant|elemental|ionic trace|tangle/i],
  ["Ammo", /\bammo\b/i],
];

export const BONUS_EFFECT_TAGS = EFFECT_TAGS.map(([tag]) => tag);

export type BonusGuideOrigin = { group: ArmorSetOriginGroup | "other"; label: string; href?: string };

export type BonusGuideSet = {
  hash: string;
  name: string;
  origin: BonusGuideOrigin;
  previewUrl?: string;
  twoPiece: ArmorSetBonus | null;
  fourPiece: ArmorSetBonus | null;
  tags: string[];
  /** Pieces came back with Monument of Triumph. */
  monumentReissue: boolean;
  rows: ActivityArmorRow[];
  /** Armor 3.0 item hashes per class and piece: only these give the set bonus. */
  wearHashes: Record<GuardianClass, string[][]>;
};
