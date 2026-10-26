/** Seal blocks on the Triumphs hub, in display order. */
export const SEAL_CATEGORIES = ["Expansions", "Raids", "Dungeons", "Activities", "Events"] as const;

export type SealCategory = (typeof SEAL_CATEGORIES)[number];

/**
 * Current seals by block. Event seals are detected automatically ("progress
 * resets at the end of the event"); new seals not listed here fall back to
 * Activities until they are added.
 */
export const SEAL_CATEGORY_BY_SLUG: Record<string, SealCategory> = {
  "monument-of-triumph": "Expansions",
  renegades: "Expansions",
  "the-edge-of-fate": "Expansions",
  "the-final-shape": "Expansions",
  lightfall: "Expansions",
  "the-witch-queen": "Expansions",
  "beyond-light": "Expansions",
  shadowkeep: "Expansions",
  "the-dreaming-city": "Expansions",
  "30th-anniversary": "Expansions",
  "the-desert-perpetual": "Raids",
  "salvations-edge": "Raids",
  "crotas-end": "Raids",
  "root-of-nightmares": "Raids",
  "kings-fall": "Raids",
  "vow-of-the-disciple": "Raids",
  "vault-of-glass": "Raids",
  "deep-stone-crypt": "Raids",
  "garden-of-salvation": "Raids",
  "last-wish": "Raids",
  "the-pantheon": "Raids",
  equilibrium: "Dungeons",
  "sundered-doctrine": "Dungeons",
  "vespers-host": "Dungeons",
  "warlords-ruin": "Dungeons",
  "ghosts-of-the-deep": "Dungeons",
  "spire-of-the-watcher": "Dungeons",
  duality: "Dungeons",
  undertaker: "Activities",
  crucible: "Activities",
  "iron-banner": "Activities",
  flawless: "Activities",
  conqueror: "Activities",
  gambit: "Activities",
  deadeye: "Activities",
};

/** Triumph categories in the hub's left column. */
export const TRIUMPH_GROUP_BANDS = ["Current", "Account", "Destinations"] as const;

export type TriumphGroupBand = (typeof TRIUMPH_GROUP_BANDS)[number];

const ACCOUNT_GROUPS = new Set(["lifetime", "legends"]);
const DESTINATION_GROUPS = new Set([
  "the-pale-heart",
  "neomuna",
  "throne-world",
  "europa",
  "the-moon",
  "dreaming-city",
  "nessus",
  "european-dead-zone",
]);

/** New expansion categories land in Current automatically. */
export function triumphGroupBand(slug: string): TriumphGroupBand {
  if (ACCOUNT_GROUPS.has(slug)) return "Account";
  if (DESTINATION_GROUPS.has(slug)) return "Destinations";
  return "Current";
}
