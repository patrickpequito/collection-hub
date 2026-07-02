export type WeaponRollLocation = "vault" | "inventory" | "equipped";

export type WeaponVersionDisplay = {
  itemHash: string;
  iconPath: string;
  seasonIconPath?: string;
  seasonDisplayIconPath?: string;
  seasonDisplayIconWatermark?: boolean;
  seasonLabel: string;
  seasonNumber: number;
  eventLabel?: string;
};

export type WeaponRollScores = {
  pvePercent: number | null;
  pvpPercent: number | null;
};

export type WeaponRollAegisScore = {
  overallPercent: number | null;
  perkColumnsHit: number;
  perkColumnsTotal: number;
  traitComboMatch: boolean;
};

export type WeaponRollInstance = {
  itemInstanceId: string;
  itemHash: string;
  location: WeaponRollLocation;
  characterId?: string;
  isMasterwork: boolean;
  equippedPlugHashes: string[];
  /** Equipped plugs filtered to this weapon's perk/masterwork pools. */
  equippedWeaponPerkHashes: string[];
  socketPlugHashesByIndex: (string | undefined)[];
  version: WeaponVersionDisplay;
  /** Bungie gear tier (1–5) for Edge of Fate / Renegades / Monument weapons. */
  gearTier: number | null;
  /** Aegis community tier label. */
  tier: string | null;
  aegis: WeaponRollAegisScore;
  scores: WeaponRollScores;
  isBest: boolean;
  isShardCandidate: boolean;
};
