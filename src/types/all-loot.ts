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

export type WeaponStat = {
  name: string;
  value: number;
  max: number;
};

export type ExoticArmorPerk = {
  name: string;
  description: string;
  iconPath?: string;
};

export type PlugInvestmentStat = {
  statHash: string;
  value: number;
};

export type WeaponPlugDefinition = {
  name: string;
  description: string;
  iconPath: string;
  investmentStats?: PlugInvestmentStat[];
  plugCategoryIdentifier?: string;
};

export type WeaponPerkColumn = {
  type: "masterwork" | "perk";
  plugHashes: string[];
  /** Bungie item socket index for this column (perk columns only). */
  socketIndex?: number;
};

export type ResolvedWeaponPerk = WeaponPlugDefinition & {
  plugHash: string;
};

export type ResolvedWeaponPerkColumn = {
  type: "masterwork" | "perk";
  perks: ResolvedWeaponPerk[];
};

export type AllLootItemVersion = {
  itemHash: string;
  name: string;
  iconPath: string;
  seasonIconPath?: string;
  seasonDisplayIconPath?: string;
  seasonDisplayIconWatermark?: boolean;
  seasonLabel: string;
  seasonNumber: number;
  eventLabel?: string;
  perkColumns?: WeaponPerkColumn[];
  stats?: WeaponStat[];
  exoticPerk?: ExoticArmorPerk;
  screenshotPath?: string;
};

export type AllLootItem = {
  itemHash: string;
  alternateItemHashes?: string[];
  /** Manifest hashes merged into the canonical catalog row (same perks/stats). */
  mergedVersionHashes?: string[];
  versions?: AllLootItemVersion[];
  name: string;
  iconPath: string;
  seasonIconPath?: string;
  seasonDisplayIconPath?: string;
  seasonDisplayIconWatermark?: boolean;
  seasonLabel: string;
  seasonNumber: number;
  eventLabel?: string;
  type: string;
  rarity: string;
  classOrWeaponType: string | null;
  damageType: string | null;
  slot: string | null;
  ammoType: string | null;
  source: string;
  obtainable: boolean;
  searchText: string;
  slug?: string;
  description?: string;
  screenshotPath?: string;
  stats?: WeaponStat[];
  exoticPerk?: ExoticArmorPerk;
  perkColumns?: WeaponPerkColumn[];
  /** Perk pools keyed by manifest item hash (alternates / merged versions). */
  perkColumnsByItemHash?: Record<string, WeaponPerkColumn[]>;
  statsByItemHash?: Record<string, WeaponStat[]>;
  screenshotPathByItemHash?: Record<string, string>;
  /** DestinyEquipableItemSetDefinition hash for legendary armor set bonuses. */
  equipableItemSetHash?: string;
  /** Armor 3.0 pieces expose gear tier and archetype stat rolls. */
  isArmor30?: boolean;
  isArmor30ByItemHash?: Record<string, boolean>;
  manifestInvestmentStats?: PlugInvestmentStat[];
  manifestInvestmentByItemHash?: Record<string, PlugInvestmentStat[]>;
  exoticPerkByItemHash?: Record<string, ExoticArmorPerk>;
};

export type AllLootCatalog = {
  generatedAt: string;
  itemCount: number;
  facets: AllLootFacets;
  plugIndex?: Record<string, WeaponPlugDefinition>;
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
