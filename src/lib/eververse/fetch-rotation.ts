import type { BungieUserSession } from "@/lib/bungie";
import {
  isDestinyAccountNotFoundError,
  listValidDestinyMemberships,
  type DestinyMembership,
} from "@/lib/destiny-membership";
import { getBungieApiKey } from "@/lib/env";
import {
  BRIGHT_DUST_CATEGORY_LABELS,
  BRIGHT_DUST_CATEGORY_ORDER,
  BRIGHT_DUST_DAILY_TAB_INDICES,
  BRIGHT_DUST_ITEM_HASHES,
  EVERVERSE_DAILY_API_NOTICE,
  EVERVERSE_VENDOR_HASH,
  EXPECTED_MIN_DAILY_BRIGHT_DUST_ITEMS,
  FEATURED_BRIGHT_DUST_COST_MIN,
  SILVER_DISPLAY_TAB_INDICES,
  SILVER_ITEM_HASH,
  VENDOR_SALE_AUGMENT_DAILY_OFFER,
} from "@/lib/eververse/constants";
import { resolveEververseDisplayItems } from "@/lib/eververse/manifest-item";
import {
  buildManifestItemMap,
  fetchEververseVendorDefinition,
  type VendorCurrency,
} from "@/lib/eververse/vendor-definition";
import type {
  EververseCategory,
  EververseRotation,
  EververseSaleItem,
} from "@/types/eververse";

const BUNGIE_ORIGIN = "https://www.bungie.net";
const VENDOR_KEY = String(EVERVERSE_VENDOR_HASH);
const VENDOR_COMPONENTS = "400,401,402";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type VendorSaleItem = {
  vendorItemIndex: number;
  itemHash: number;
  quantity: number;
  costs: VendorCurrency[];
  failureIndexes?: number[];
  augments?: number;
  overrideNextRefreshDate?: string;
};

type VendorCategory = {
  displayCategoryIndex: number;
  itemIndexes: number[];
};

type VendorResponse = {
  vendor?: {
    data?: {
      vendorHash: number;
      nextRefreshDate?: string;
    };
  };
  vendors?: {
    data?: Record<
      string,
      {
        vendorHash: number;
        nextRefreshDate?: string;
      }
    >;
  };
  categories?: {
    data?: Record<string, unknown> & {
      categories?: VendorCategory[];
    };
  };
  sales?: {
    data?: Record<
      string,
      | VendorSaleItem
      | {
          saleItems?: Record<string, VendorSaleItem>;
        }
    >;
  };
};

type CharacterData = {
  dateLastPlayed?: string;
};

type ProfileCharactersResponse = {
  characters?: { data?: Record<string, CharacterData> };
};

type SaleCandidate = {
  sale: VendorSaleItem;
  displayCategoryIndex: number;
};

type NormalizedEververseVendor = {
  nextRefreshDate?: string;
  categories: VendorCategory[];
  saleItems: Record<string, VendorSaleItem>;
};

function bungieHeaders(accessToken: string) {
  return {
    "X-API-Key": getBungieApiKey(),
    Authorization: `Bearer ${accessToken}`,
  };
}

async function bungieGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${BUNGIE_ORIGIN}${path}`, {
    headers: bungieHeaders(accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bungie API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as BungieResponse<T>;
  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || "Unexpected Bungie API response");
  }

  return data.Response;
}

function orderCharacterIds(
  characters: Record<string, CharacterData>,
): string[] {
  return Object.entries(characters)
    .sort(
      ([, a], [, b]) =>
        Date.parse(b.dateLastPlayed ?? "0") -
        Date.parse(a.dateLastPlayed ?? "0"),
    )
    .map(([id]) => id);
}

function isVendorSaleItem(value: unknown): value is VendorSaleItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "vendorItemIndex" in value &&
    "itemHash" in value
  );
}

function extractPluralCategories(response: VendorResponse): VendorCategory[] {
  const entry = response.categories?.data?.[VENDOR_KEY] as
    | { categories?: VendorCategory[] }
    | undefined;
  return entry?.categories ?? [];
}

function extractSingularCategories(response: VendorResponse): VendorCategory[] {
  const categoryData = response.categories?.data;
  return Array.isArray(categoryData?.categories)
    ? categoryData.categories
    : [];
}

function extractPluralSaleItems(
  response: VendorResponse,
): Record<string, VendorSaleItem> {
  const sales = response.sales?.data?.[VENDOR_KEY];
  if (sales && "saleItems" in sales && sales.saleItems) {
    return sales.saleItems;
  }
  return {};
}

function extractSingularSaleItems(
  response: VendorResponse,
): Record<string, VendorSaleItem> {
  const saleItems: Record<string, VendorSaleItem> = {};

  for (const [key, value] of Object.entries(response.sales?.data ?? {})) {
    if (isVendorSaleItem(value)) {
      saleItems[key] = value;
    }
  }

  return saleItems;
}

function mergeVendorCategories(
  pluralCategories: VendorCategory[],
  singularCategories: VendorCategory[],
): VendorCategory[] {
  const itemIndexesByTab = new Map<number, Set<number>>();

  const addCategories = (categories: VendorCategory[]) => {
    for (const category of categories) {
      const indexes =
        itemIndexesByTab.get(category.displayCategoryIndex) ?? new Set<number>();
      for (const itemIndex of category.itemIndexes) {
        indexes.add(itemIndex);
      }
      itemIndexesByTab.set(category.displayCategoryIndex, indexes);
    }
  };

  addCategories(pluralCategories);
  addCategories(singularCategories);

  return [...itemIndexesByTab.entries()].map(
    ([displayCategoryIndex, itemIndexes]) => ({
      displayCategoryIndex,
      itemIndexes: [...itemIndexes],
    }),
  );
}

function pickBetterSale(
  existing: VendorSaleItem,
  candidate: VendorSaleItem,
): VendorSaleItem {
  const existingHasBrightDust =
    brightDustCost(existing.costs ?? []) !== null;
  const candidateHasBrightDust =
    brightDustCost(candidate.costs ?? []) !== null;

  if (candidateHasBrightDust && !existingHasBrightDust) return candidate;
  if (existingHasBrightDust && !candidateHasBrightDust) return existing;
  if ((candidate.costs?.length ?? 0) > (existing.costs?.length ?? 0)) {
    return candidate;
  }
  return existing;
}

function normalizeVendorSaleItem(
  sale: VendorSaleItem,
  key: string,
): VendorSaleItem | null {
  const vendorItemIndex = sale.vendorItemIndex ?? Number(key);
  if (!Number.isInteger(vendorItemIndex)) return null;

  return {
    ...sale,
    vendorItemIndex,
    costs: sale.costs ?? [],
  };
}

function mergeVendorSaleItems(
  singularSaleItems: Record<string, VendorSaleItem>,
  pluralSaleItems: Record<string, VendorSaleItem>,
): Record<string, VendorSaleItem> {
  const saleByIndex = new Map<number, VendorSaleItem>();

  const upsert = (rawSale: VendorSaleItem, key: string) => {
    const sale = normalizeVendorSaleItem(rawSale, key);
    if (!sale) return;

    const existing = saleByIndex.get(sale.vendorItemIndex);
    saleByIndex.set(
      sale.vendorItemIndex,
      existing ? pickBetterSale(existing, sale) : sale,
    );
  };

  for (const [key, sale] of Object.entries(singularSaleItems)) {
    upsert(sale, key);
  }
  for (const [key, sale] of Object.entries(pluralSaleItems)) {
    upsert(sale, key);
  }

  const merged: Record<string, VendorSaleItem> = {};
  for (const sale of saleByIndex.values()) {
    merged[String(sale.vendorItemIndex)] = sale;
  }
  return merged;
}

/**
 * GetVendor nests sales/categories directly on `data`.
 * GetVendors nests them under the vendor hash — merge both shapes.
 */
function normalizeEververseVendorResponse(
  response: VendorResponse,
): NormalizedEververseVendor {
  const pluralCategories = extractPluralCategories(response);
  const singularCategories = extractSingularCategories(response);

  return {
    nextRefreshDate:
      response.vendor?.data?.nextRefreshDate ??
      response.vendors?.data?.[VENDOR_KEY]?.nextRefreshDate,
    categories: mergeVendorCategories(pluralCategories, singularCategories),
    saleItems: mergeVendorSaleItems(
      extractSingularSaleItems(response),
      extractPluralSaleItems(response),
    ),
  };
}

function buildSaleByVendorItemIndex(
  saleItems: Record<string, VendorSaleItem>,
): Map<number, VendorSaleItem> {
  const map = new Map<number, VendorSaleItem>();

  for (const [key, sale] of Object.entries(saleItems)) {
    const normalized = normalizeVendorSaleItem(sale, key);
    if (!normalized) continue;
    map.set(normalized.vendorItemIndex, normalized);
  }

  return map;
}

function isDailyOffer(sale: VendorSaleItem): boolean {
  return ((sale.augments ?? 0) & VENDOR_SALE_AUGMENT_DAILY_OFFER) !== 0;
}

function manifestBrightDustCosts(
  sale: VendorSaleItem,
  manifestItems: Map<number, { currencies?: VendorCurrency[] }>,
): VendorCurrency[] {
  const manifestCosts =
    manifestItems.get(sale.vendorItemIndex)?.currencies ?? [];
  return manifestCosts.filter((cost) =>
    BRIGHT_DUST_ITEM_HASHES.has(String(cost.itemHash)),
  );
}

function resolveManifestBrightDustCostByItemHash(
  itemHash: number,
  manifestItems: Map<number, { itemHash: number; currencies?: VendorCurrency[] }>,
): number | null {
  for (const manifestItem of manifestItems.values()) {
    if (manifestItem.itemHash !== itemHash) continue;
    const cost = brightDustCost(manifestItem.currencies ?? []);
    if (cost !== null && cost > 0) return cost;
  }
  return null;
}

function resolveBrightDustCostForSale(
  sale: VendorSaleItem,
  manifestItems: ReturnType<typeof buildManifestItemMap>,
): number | null {
  const liveCost = brightDustCost(sale.costs ?? []);
  if (liveCost !== null && liveCost > 0) return liveCost;

  const manifestCost = brightDustCost(
    manifestBrightDustCosts(sale, manifestItems),
  );
  if (manifestCost !== null && manifestCost > 0) return manifestCost;

  return resolveManifestBrightDustCostByItemHash(sale.itemHash, manifestItems);
}

function resolveSaleCosts(
  sale: VendorSaleItem,
  manifestItems: Map<number, { currencies?: VendorCurrency[] }>,
): VendorCurrency[] {
  const liveBrightDust = (sale.costs ?? []).filter((cost) =>
    BRIGHT_DUST_ITEM_HASHES.has(String(cost.itemHash)),
  );
  if (liveBrightDust.length > 0) return liveBrightDust;

  return manifestBrightDustCosts(sale, manifestItems);
}

function brightDustCost(costs: VendorCurrency[]): number | null {
  for (const cost of costs) {
    if (BRIGHT_DUST_ITEM_HASHES.has(String(cost.itemHash))) {
      return cost.quantity;
    }
  }
  return null;
}

function hasSilverCost(costs: VendorCurrency[]): boolean {
  return costs.some(
    (cost) => String(cost.itemHash) === SILVER_ITEM_HASH && cost.quantity > 0,
  );
}

function isSilverOnlySale(costs: VendorCurrency[]): boolean {
  return hasSilverCost(costs) && brightDustCost(costs) === null;
}

function resolveDisplayGroup(
  displayCategoryIndex: number,
  brightDustPrice: number,
): {
  id: string;
  label: string;
} {
  if (
    displayCategoryIndex === 1 ||
    brightDustPrice >= FEATURED_BRIGHT_DUST_COST_MIN
  ) {
    return {
      id: "categories.featured.bright_dust",
      label: BRIGHT_DUST_CATEGORY_LABELS["categories.featured.bright_dust"],
    };
  }

  return {
    id: "categories.bright_dust.items",
    label: BRIGHT_DUST_CATEGORY_LABELS["categories.bright_dust.items"],
  };
}

function isSilverDailyOffer(
  sale: VendorSaleItem,
  manifestItems: ReturnType<typeof buildManifestItemMap>,
): boolean {
  const liveCosts = sale.costs ?? [];
  if (!hasSilverCost(liveCosts)) return false;
  return resolveBrightDustCostForSale(sale, manifestItems) === null;
}

function tryAddBrightDustSale(
  sale: VendorSaleItem,
  displayCategoryIndex: number,
  manifestItems: ReturnType<typeof buildManifestItemMap>,
  seen: Set<number>,
  candidates: SaleCandidate[],
) {
  if (seen.has(sale.vendorItemIndex)) return;
  if (isSilverDisplayTab(displayCategoryIndex)) return;

  const cost = resolveBrightDustCostForSale(sale, manifestItems);
  if (cost === null) return;

  if (isDailyOffer(sale)) {
    if (isSilverDailyOffer(sale, manifestItems)) return;
  } else {
    const liveCosts = sale.costs ?? [];
    if (isSilverOnlySale(liveCosts)) return;
    if (brightDustCost(liveCosts) === null) return;
  }

  seen.add(sale.vendorItemIndex);
  candidates.push({ sale, displayCategoryIndex });
}

function scoreVendorResponse(
  response: VendorResponse,
  manifestItems: ReturnType<typeof buildManifestItemMap>,
): number {
  const normalized = normalizeEververseVendorResponse(response);
  const saleByIndex = buildSaleByVendorItemIndex(normalized.saleItems);
  let dailyBrightDustOffers = 0;

  for (const sale of saleByIndex.values()) {
    if (!isDailyOffer(sale)) continue;
    if (isSilverDailyOffer(sale, manifestItems)) continue;
    if (resolveBrightDustCostForSale(sale, manifestItems) !== null) {
      dailyBrightDustOffers += 1;
    }
  }

  return dailyBrightDustOffers * 1000 + saleByIndex.size;
}

function isSilverDisplayTab(displayCategoryIndex: number): boolean {
  return SILVER_DISPLAY_TAB_INDICES.has(displayCategoryIndex);
}

function buildSaleByItemHash(
  saleByVendorItemIndex: Map<number, VendorSaleItem>,
): Map<number, VendorSaleItem> {
  const map = new Map<number, VendorSaleItem>();
  for (const sale of saleByVendorItemIndex.values()) {
    map.set(sale.itemHash, sale);
  }
  return map;
}

function resolveSaleForItemIndex(
  itemIndex: number,
  saleItems: Record<string, VendorSaleItem>,
  saleByVendorItemIndex: Map<number, VendorSaleItem>,
  saleByItemHash: Map<number, VendorSaleItem>,
  manifestItems: ReturnType<typeof buildManifestItemMap>,
): VendorSaleItem | null {
  const direct =
    saleByVendorItemIndex.get(itemIndex) ?? saleItems[String(itemIndex)];
  if (direct) return direct;

  const manifestItem = manifestItems.get(itemIndex);
  if (!manifestItem) return null;

  return saleByItemHash.get(manifestItem.itemHash) ?? null;
}

function collectSaleCandidates(
  normalized: NormalizedEververseVendor,
  manifestItems: ReturnType<typeof buildManifestItemMap>,
): SaleCandidate[] {
  const { saleItems, categories: vendorCategories } = normalized;
  const saleByVendorItemIndex = buildSaleByVendorItemIndex(saleItems);
  const saleByItemHash = buildSaleByItemHash(saleByVendorItemIndex);
  const itemIndexToCategoryIndex = new Map<number, number>();

  for (const category of vendorCategories) {
    for (const itemIndex of category.itemIndexes) {
      itemIndexToCategoryIndex.set(itemIndex, category.displayCategoryIndex);
    }
  }

  const candidates: SaleCandidate[] = [];
  const seen = new Set<number>();

  const addSale = (sale: VendorSaleItem, displayCategoryIndex: number) => {
    tryAddBrightDustSale(
      sale,
      displayCategoryIndex,
      manifestItems,
      seen,
      candidates,
    );
  };

  for (const sale of saleByVendorItemIndex.values()) {
    if (!isDailyOffer(sale)) continue;

    const displayCategoryIndex =
      itemIndexToCategoryIndex.get(sale.vendorItemIndex) ?? 6;
    addSale(sale, displayCategoryIndex);
  }

  for (const category of vendorCategories) {
    if (
      isSilverDisplayTab(category.displayCategoryIndex) ||
      !BRIGHT_DUST_DAILY_TAB_INDICES.has(category.displayCategoryIndex)
    ) {
      continue;
    }

    for (const itemIndex of category.itemIndexes) {
      if (seen.has(itemIndex)) continue;

      const sale = resolveSaleForItemIndex(
        itemIndex,
        saleItems,
        saleByVendorItemIndex,
        saleByItemHash,
        manifestItems,
      );
      if (!sale) continue;
      addSale(sale, category.displayCategoryIndex);
    }
  }

  for (const sale of saleByVendorItemIndex.values()) {
    if (seen.has(sale.vendorItemIndex)) continue;

    const displayCategoryIndex =
      itemIndexToCategoryIndex.get(sale.vendorItemIndex) ?? 6;
    addSale(sale, displayCategoryIndex);
  }

  return candidates;
}

function sortCategories(categories: EververseCategory[]): EververseCategory[] {
  const order = new Map<string, number>(
    BRIGHT_DUST_CATEGORY_ORDER.map((id, index) => [id, index]),
  );

  return [...categories].sort((a, b) => {
    const aOrder = order.get(a.id) ?? 100;
    const bOrder = order.get(b.id) ?? 100;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.label.localeCompare(b.label);
  });
}

async function buildRotationFromVendor(
  vendorResponse: VendorResponse,
  vendorDefinition: Awaited<ReturnType<typeof fetchEververseVendorDefinition>>,
): Promise<EververseRotation> {
  const normalized = normalizeEververseVendorResponse(vendorResponse);
  const manifestItems = buildManifestItemMap(vendorDefinition);
  const candidates = collectSaleCandidates(normalized, manifestItems);
  const groupedItems = new Map<string, EververseCategory>();

  const resolvedCandidates = await Promise.all(
    candidates.map(async (candidate) => {
      const { sale, displayCategoryIndex } = candidate;
      const cost = resolveBrightDustCostForSale(sale, manifestItems);
      if (cost === null) return null;

      const displayItems = await resolveEververseDisplayItems(
        String(sale.itemHash),
      );

      return {
        displayCategoryIndex,
        cost,
        displayItems,
      };
    }),
  );

  for (const resolved of resolvedCandidates) {
    if (!resolved) continue;

    const { displayCategoryIndex, cost, displayItems } = resolved;
    const { id: groupId, label: groupLabel } = resolveDisplayGroup(
      displayCategoryIndex,
      cost,
    );

    let category = groupedItems.get(groupId);
    if (!category) {
      category = { id: groupId, label: groupLabel, items: [] };
      groupedItems.set(groupId, category);
    }

    for (const displayItem of displayItems) {
      const saleItem: EververseSaleItem = {
        itemHash: displayItem.itemHash,
        name: displayItem.name,
        iconPath: displayItem.iconPath,
        itemType: displayItem.itemType,
        brightDustCost: cost,
      };

      const duplicate = category.items.some(
        (existing) =>
          existing.itemHash === saleItem.itemHash &&
          existing.brightDustCost === saleItem.brightDustCost,
      );
      if (!duplicate) {
        category.items.push(saleItem);
      }
    }
  }

  const categories = sortCategories(
    [...groupedItems.values()].filter((category) => category.items.length > 0),
  );

  const totalItems = categories.reduce(
    (sum, category) => sum + category.items.length,
    0,
  );

  if (totalItems === 0) {
    const saleCount = Object.keys(normalized.saleItems).length;
    const tabItemCount = normalized.categories
      .filter((category) =>
        BRIGHT_DUST_DAILY_TAB_INDICES.has(category.displayCategoryIndex),
      )
      .reduce((sum, category) => sum + category.itemIndexes.length, 0);

    throw new Error(
      saleCount === 0
        ? "Bungie did not return Eververse vendor data for this account."
        : EVERVERSE_DAILY_API_NOTICE,
    );
  }

  const diagnostics = diagnoseEververseVendor(vendorResponse, manifestItems);

  return {
    vendorHash: EVERVERSE_VENDOR_HASH,
    nextRefreshDate:
      normalized.nextRefreshDate ?? new Date().toISOString(),
    categories,
    fetchedAt: Date.now(),
    apiIncomplete: isEververseApiDataIncomplete(diagnostics, totalItems),
  };
}

function countDailyTabItems(categories: VendorCategory[]): number {
  return categories
    .filter((category) =>
      BRIGHT_DUST_DAILY_TAB_INDICES.has(category.displayCategoryIndex),
    )
    .reduce((sum, category) => sum + category.itemIndexes.length, 0);
}

function mergeEververseVendorResponses(
  singular: VendorResponse,
  plural: VendorResponse,
): VendorResponse {
  const categories = mergeVendorCategories(
    extractPluralCategories(plural),
    extractSingularCategories(singular),
  );
  const saleItems = mergeVendorSaleItems(
    extractSingularSaleItems(singular),
    extractPluralSaleItems(plural),
  );

  return {
    vendor:
      singular.vendor ??
      (plural.vendors?.data?.[VENDOR_KEY]
        ? { data: plural.vendors.data[VENDOR_KEY] }
        : undefined),
    categories: { data: { categories } },
    sales: { data: saleItems },
  };
}

async function fetchVendorResponseForCharacter(
  membership: DestinyMembership,
  characterId: string,
  accessToken: string,
): Promise<VendorResponse> {
  const basePath = `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/Character/${characterId}`;

  const [singularResponse, pluralResponse] = await Promise.all([
    bungieGet<VendorResponse>(
      `${basePath}/Vendors/${EVERVERSE_VENDOR_HASH}/?components=${VENDOR_COMPONENTS}`,
      accessToken,
    ),
    bungieGet<VendorResponse>(
      `${basePath}/Vendors/?components=${VENDOR_COMPONENTS}`,
      accessToken,
    ),
  ]);

  return mergeEververseVendorResponses(singularResponse, pluralResponse);
}

export type EververseVendorDiagnostics = {
  saleCount: number;
  brightDustSaleCount: number;
  dailyOfferCount: number;
  dailyOfferBrightDustCount: number;
  dailyTabItemCount: number;
  candidateCount: number;
};

export function isEververseApiDataIncomplete(
  diagnostics: EververseVendorDiagnostics,
  itemCount: number,
): boolean {
  if (diagnostics.saleCount === 0) return false;

  return (
    itemCount < EXPECTED_MIN_DAILY_BRIGHT_DUST_ITEMS &&
    diagnostics.dailyTabItemCount === 0 &&
    diagnostics.dailyOfferCount === 0 &&
    diagnostics.brightDustSaleCount < EXPECTED_MIN_DAILY_BRIGHT_DUST_ITEMS
  );
}

export function diagnoseEververseVendor(
  vendorResponse: VendorResponse,
  manifestItems: ReturnType<typeof buildManifestItemMap>,
): EververseVendorDiagnostics {
  const normalized = normalizeEververseVendorResponse(vendorResponse);
  const candidates = collectSaleCandidates(normalized, manifestItems);
  const saleByIndex = buildSaleByVendorItemIndex(normalized.saleItems);
  let brightDustSaleCount = 0;
  let dailyOfferCount = 0;
  let dailyOfferBrightDustCount = 0;

  for (const sale of saleByIndex.values()) {
    if (brightDustCost(sale.costs ?? []) !== null) {
      brightDustSaleCount += 1;
    }
    if (!isDailyOffer(sale)) continue;
    dailyOfferCount += 1;
    if (
      !isSilverDailyOffer(sale, manifestItems) &&
      resolveBrightDustCostForSale(sale, manifestItems) !== null
    ) {
      dailyOfferBrightDustCount += 1;
    }
  }

  return {
    saleCount: saleByIndex.size,
    brightDustSaleCount,
    dailyOfferCount,
    dailyOfferBrightDustCount,
    dailyTabItemCount: countDailyTabItems(normalized.categories),
    candidateCount: candidates.length,
  };
}

function rotationItemCount(rotation: EververseRotation): number {
  return rotation.categories.reduce(
    (sum, category) => sum + category.items.length,
    0,
  );
}

async function fetchVendorResponsesForMembership(
  membership: DestinyMembership,
  accessToken: string,
): Promise<VendorResponse[]> {
  try {
    const profile = await bungieGet<ProfileCharactersResponse>(
      `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=200`,
      accessToken,
    );

    const characterIds = orderCharacterIds(profile.characters?.data ?? {});
    const responses: VendorResponse[] = [];

    for (const characterId of characterIds) {
      responses.push(
        await fetchVendorResponseForCharacter(
          membership,
          characterId,
          accessToken,
        ),
      );
    }

    return responses;
  } catch (error) {
    if (isDestinyAccountNotFoundError(error)) return [];
    throw error;
  }
}

export async function fetchEververseRotation(
  session: BungieUserSession,
  options?: { includeDebug?: boolean },
): Promise<{
  rotation: EververseRotation;
  debug?: EververseVendorDiagnostics;
}> {
  const memberships = await listValidDestinyMemberships(session);
  if (!memberships.length) {
    throw new Error(
      "No Destiny 2 profile found for this Bungie account. Make sure you have played Destiny 2 on at least one linked platform.",
    );
  }

  const vendorDefinition = await fetchEververseVendorDefinition();
  const manifestItems = buildManifestItemMap(vendorDefinition);

  let bestRotation: EververseRotation | null = null;
  let bestItemCount = 0;
  let bestVendorResponse: VendorResponse | null = null;
  let bestResponse: VendorResponse | null = null;
  let bestScore = -1;
  let lastBuildError: Error | null = null;

  for (const membership of memberships) {
    const vendorResponses = await fetchVendorResponsesForMembership(
      membership,
      session.accessToken,
    );

    for (const vendorResponse of vendorResponses) {
      const score = scoreVendorResponse(vendorResponse, manifestItems);
      if (score > bestScore) {
        bestScore = score;
        bestResponse = vendorResponse;
      }

      try {
        const rotation = await buildRotationFromVendor(
          vendorResponse,
          vendorDefinition,
        );
        const itemCount = rotationItemCount(rotation);
        if (itemCount > bestItemCount) {
          bestItemCount = itemCount;
          bestRotation = rotation;
          bestVendorResponse = vendorResponse;
        }
      } catch (error) {
        lastBuildError =
          error instanceof Error ? error : new Error(String(error));
      }
    }
  }

  const debugSource = bestVendorResponse ?? bestResponse;
  const debug =
    options?.includeDebug && debugSource
      ? diagnoseEververseVendor(debugSource, manifestItems)
      : undefined;

  if (bestRotation && bestItemCount > 0) {
    return { rotation: bestRotation, ...(debug ? { debug } : {}) };
  }

  if (!bestResponse) {
    throw new Error("No Destiny character found on this account.");
  }

  try {
    const rotation = await buildRotationFromVendor(
      bestResponse,
      vendorDefinition,
    );
    return {
      rotation,
      ...(options?.includeDebug
        ? { debug: diagnoseEververseVendor(bestResponse, manifestItems) }
        : {}),
    };
  } catch (error) {
    throw lastBuildError ?? error;
  }
}
