import { getBungieApiKey } from "@/lib/env";
import {
  BRIGHT_DUST_CATEGORY_LABELS,
  EVERVERSE_VENDOR_HASH,
} from "@/lib/eververse/constants";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

export type VendorCurrency = {
  itemHash: number;
  quantity: number;
};

export type VendorManifestItem = {
  vendorItemIndex: number;
  itemHash: number;
  displayCategoryIndex?: number;
  currencies?: VendorCurrency[];
};

export type EververseVendorDefinition = {
  displayCategories?: Array<{
    identifier?: string;
    categoryLabel?: string;
    displayProperties?: {
      name?: string;
    };
  }>;
  itemList?: VendorManifestItem[];
};

let vendorDefinitionCache: EververseVendorDefinition | null = null;

export async function fetchEververseVendorDefinition(): Promise<EververseVendorDefinition> {
  if (vendorDefinitionCache) return vendorDefinitionCache;

  const response = await fetch(
    `${BUNGIE_ORIGIN}/Platform/Destiny2/Manifest/DestinyVendorDefinition/${EVERVERSE_VENDOR_HASH}/`,
    {
      headers: { "X-API-Key": getBungieApiKey() },
      next: { revalidate: 60 * 60 * 6 },
    },
  );

  if (!response.ok) {
    throw new Error(`Vendor manifest request failed (${response.status})`);
  }

  const data = (await response.json()) as BungieResponse<EververseVendorDefinition>;
  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || "Unexpected vendor manifest response");
  }

  vendorDefinitionCache = data.Response;
  return vendorDefinitionCache;
}

export function buildManifestItemMap(
  vendorDefinition: EververseVendorDefinition,
): Map<number, VendorManifestItem> {
  const map = new Map<number, VendorManifestItem>();
  for (const item of vendorDefinition.itemList ?? []) {
    map.set(item.vendorItemIndex, item);
  }
  return map;
}

export function categoryLabelForIndex(
  vendorDefinition: EververseVendorDefinition,
  displayCategoryIndex: number,
): { id: string; label: string } {
  const category = vendorDefinition.displayCategories?.[displayCategoryIndex];
  const id = category?.identifier ?? `category-${displayCategoryIndex}`;
  const label =
    BRIGHT_DUST_CATEGORY_LABELS[id] ??
    category?.displayProperties?.name ??
    category?.categoryLabel ??
    (id.startsWith("categories.bright_dust.")
      ? id.replace("categories.bright_dust.", "").replace(/^\w/, (c) => c.toUpperCase())
      : id.replace(/^categories\./, "").replace(/\./g, " "));

  return { id, label };
}
