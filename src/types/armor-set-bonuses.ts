export type ArmorSetBonus = {
  requiredCount: number;
  name: string;
  description: string;
  iconPath: string;
};

export type ArmorSetBonusEntry = {
  setName: string;
  bonuses: ArmorSetBonus[];
};

export type ArmorSetBonusCatalog = {
  generatedAt: string;
  setCount: number;
  itemHashToSetHash?: Record<string, string>;
  sets: Record<string, ArmorSetBonusEntry>;
};
