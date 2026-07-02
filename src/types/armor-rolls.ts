export type ArmorRollLocation = "vault" | "inventory" | "equipped";

export type ArmorRollInstance = {
  itemInstanceId: string;
  itemHash: string;
  location: ArmorRollLocation;
  characterId?: string;
  version: {
    itemHash: string;
    iconPath: string;
    seasonIconPath?: string;
    seasonDisplayIconPath?: string;
    seasonDisplayIconWatermark?: boolean;
    seasonLabel: string;
    seasonNumber: number;
    eventLabel?: string;
  };
  tier: number | null;
  defense: number | null;
  totalStats: number;
  archetype: string | null;
  archetypeIconPath?: string | null;
  stats: Array<{ name: string; value: number; max: number }>;
  isBest: boolean;
  isShardCandidate: boolean;
};
