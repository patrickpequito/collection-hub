const BUNGIE_BASE = "https://www.bungie.net";

/** Official client overlays for ornament inventory tiles (DestinyInventoryItemConstantsDefinition). */
const ORNAMENT_OVERLAY_PATHS = {
  default: "/img/destiny_content/items/ornament-overlay-layer.png",
  legendary: "/img/destiny_content/items/ornament-overlay-layer-legendary.png",
  exotic: "/img/destiny_content/items/ornament-overlay-layer-exotic.png",
} as const;

export type OrnamentOverlayTier = keyof typeof ORNAMENT_OVERLAY_PATHS;

export function bungieIconUrl(iconPath: string): string {
  if (!iconPath) return "";
  if (iconPath.startsWith("http")) return iconPath;
  if (iconPath.startsWith("/images/")) return iconPath;
  return `${BUNGIE_BASE}${iconPath}`;
}

export function bungieOrnamentOverlayUrl(
  tier: OrnamentOverlayTier = "default",
): string {
  return `${BUNGIE_BASE}${ORNAMENT_OVERLAY_PATHS[tier]}`;
}

/** Resolve overlay tier from catalog rarity for Ornament items. */
export function ornamentOverlayTierForRarity(
  rarity: string | null | undefined,
): OrnamentOverlayTier {
  if (rarity === "Exotic") return "exotic";
  if (rarity === "Legendary") return "legendary";
  return "default";
}
