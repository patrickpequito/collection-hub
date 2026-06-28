export type WeaponAegisWeaponEntry = {
  archetypeTier?: string;
  lines: string[][];
};

export type WeaponAegisRollIndex = {
  generatedAt: string;
  source: string;
  itemCount: number;
  lineCount: number;
  weapons: Record<string, WeaponAegisWeaponEntry>;
};
