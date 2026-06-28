export type WeaponGodRollEntry = {
  pve?: string[];
  pvp?: string[];
};

export type WeaponGodRollIndex = {
  generatedAt: string;
  source: string;
  itemCount: number;
  withPve: number;
  withPvp: number;
  rolls: Record<string, WeaponGodRollEntry>;
};

export type WeaponGodRollMode = "pve" | "pvp";

export type PerkHighlightMode = WeaponGodRollMode | "roll" | "match" | null;

export type ResolvedWeaponGodRoll = {
  pve?: string[];
  pvp?: string[];
};
