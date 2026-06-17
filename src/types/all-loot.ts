export type AllLootFacets = {
  types: string[];
  seasons: string[];
  rarities: string[];
  classes: string[];
  weaponTypes: string[];
  damageTypes: string[];
  weaponSlots: string[];
  gearSlots: string[];
};

export type AllLootItemVersion = {
  itemHash: string;
  name: string;
  iconPath: string;
  seasonIconPath?: string;
  seasonLabel: string;
  seasonNumber: number;
};

export type AllLootItem = {
  itemHash: string;
  alternateItemHashes?: string[];
  versions?: AllLootItemVersion[];
  name: string;
  iconPath: string;
  seasonIconPath?: string;
  seasonLabel: string;
  seasonNumber: number;
  type: string;
  rarity: string;
  classOrWeaponType: string | null;
  damageType: string | null;
  slot: string | null;
  ammoType: string | null;
  source: string;
  obtainable: boolean;
  searchText: string;
};

export type AllLootCatalog = {
  generatedAt: string;
  itemCount: number;
  facets: AllLootFacets;
  items: AllLootItem[];
};

export type AllLootSearchFilters = {
  query: string;
  types: string[];
  seasons: string[];
  rarities: string[];
  classes: string[];
  weaponTypes: string[];
  damageTypes: string[];
  weaponSlots: string[];
  gearSlots: string[];
  obtainable: "all" | "yes" | "no";
  collected: "all" | "yes" | "no";
};

export type AllLootSearchResult = {
  items: AllLootItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
