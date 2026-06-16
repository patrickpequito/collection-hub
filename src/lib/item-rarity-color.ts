const RARITY_COLORS: Record<string, string> = {
  Exotic: "#ceaf33",
  Legendary: "#c4a0e8",
  Rare: "#8bb8e8",
  Uncommon: "#72b880",
  Common: "#ffffff",
};

export function itemRarityColor(rarity: string | null | undefined): string {
  if (!rarity) return "#d4d4d8";
  return RARITY_COLORS[rarity] ?? "#d4d4d8";
}
