export type EververseSaleItem = {
  itemHash: string;
  name: string;
  iconPath: string;
  itemType: string;
  brightDustCost: number;
};

export type EververseCategory = {
  id: string;
  label: string;
  items: EververseSaleItem[];
};

export type EververseRotation = {
  vendorHash: number;
  nextRefreshDate: string;
  categories: EververseCategory[];
  fetchedAt: number;
  /** True when Bungie's API did not return the full daily Bright Dust shop. */
  apiIncomplete?: boolean;
};
