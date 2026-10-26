/** Sparrow Racing League — returned with Monument of Triumph. */
export const SPARROW_RACING_LEAGUE_HUB = {
  slug: "sparrow-racing-league",
  title: "Sparrow Racing League",
  headerImageUrl: "/images/headers/sparrow-racing-league-header.webp",
  /** Circuit set (SRL armor, Monument of Triumph). */
  armorSetName: "Circuit",
  /** Promo art: Circuit and its classic SRL ornament sets together. */
  armorSetPreviewFiles: ["circuit.webp"],
  /** Ornament set shown as its own block with its preview. */
  gridSetName: "Back on the Grid",
  gridSetPreviewFile: "back-on-the-grid.webp",
  /** Triumphs live in the Monument of Triumph group. */
  triumphGroup: "monument-of-triumph",
  triumphSectionPath: ["Competitions", "Sparrow Racing League"],
} as const;

/**
 * Ornament sets unlocked by SRL triumphs (Destiny 1 SRL gear). Matched by piece
 * name; helmets differ per class. "Back on the Grid" is a different set per class.
 */
export const SRL_ORNAMENT_SETS = [
  { name: "Velocity", triumph: "Podium Placement", pattern: /^Velocity Helmet$/ },
  { name: "Bright", triumph: "Don't Mess With The Honk", pattern: /^Bright (Gauntlets|Armor|Sheath|Shield|Ward|Guard)$/ },
  { name: "Jade Rabbit", triumph: "SRL Tricky", pattern: / of the Jade Rabbit$/ },
  { name: "Momentum", triumph: "Furiously Fast", pattern: /^Momentum (Gloves|Defense|Boots|Helmet|Shield|Guard)$/ },
  { name: "Racing", triumph: "Light Speed", pattern: /^(Racing (Gloves|Suit|Legs|Helmet|Wings)|Crash Helmet)$/ },
  { name: "Back on the Grid", triumph: "Competitions: SRL", pattern: /^(Ultrasonic|Hot-Blooded|Lightspeed) / },
] as const;
