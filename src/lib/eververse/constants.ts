/** Tess Everis — Eververse Trading Co. */
export const EVERVERSE_VENDOR_HASH = 3361454721;

/** Silver — exclude from Bright Dust rotation. */
export const SILVER_ITEM_HASH = "3147280338";

/**
 * DestinyVendorItemAugment.DailyOffer — daily Eververse rotation items.
 * @see https://bungie-net.github.io/multi/schema_Destiny-VendorItemAugment.html
 */
export const VENDOR_SALE_AUGMENT_DAILY_OFFER = 4096;

/** Heuristic: featured daily offers are usually emotes/ships (≥2000 BD). */
export const FEATURED_BRIGHT_DUST_COST_MIN = 2000;

/** Bright Dust currency item hashes (manifest duplicates). */
export const BRIGHT_DUST_ITEM_HASHES = new Set([
  "1065442101",
  "1484957587",
  "2125251645",
  "2642369485",
  "2817410917",
  "3168101969",
  "4030348888",
  "4152364891",
]);

/**
 * Daily Bright Dust sections in Tess Everis ("Ofertas Diarias").
 * Featured = 1 (main offers). Items / Flair / Consumables = other offers.
 */
export const BRIGHT_DUST_DAILY_TAB_INDICES = new Set([1, 6, 7, 8]);

/** Silver Eververse display tab indices in the vendor manifest. */
export const SILVER_DISPLAY_TAB_INDICES = new Set([13, 14, 15]);

/** Merge Flair + Consumables into the "other offers" group in the UI. */
export const BRIGHT_DUST_GROUP_CATEGORY_IDS: Record<string, string> = {
  "categories.bright_dust.flair": "categories.bright_dust.items",
  "categories.bright_dust.consumables": "categories.bright_dust.items",
};

/** @deprecated Use BRIGHT_DUST_DAILY_TAB_INDICES — kept for broader vendor scans. */
export const BRIGHT_DUST_TAB_INDICES = BRIGHT_DUST_DAILY_TAB_INDICES;

/** Silver-only Eververse tabs — never shown on this page. */
export const EXCLUDED_EVERVERSE_CATEGORY_IDS = new Set([
  "categories.silver.engrams",
  "categories.silver.bundles",
  "categories.silver.bundles.persistent",
  "categories.campaigns",
  "categories.featured.carousel",
  "categories.recommended",
  "categories.recommended.multipurchase",
  "categories.engrams.multipurchase",
  "categories.focused",
  "categories.anniversary",
  "category_nexus",
]);

export const BRIGHT_DUST_CATEGORY_LABELS: Record<string, string> = {
  "categories.featured.bright_dust": "Featured Bright Dust Offers",
  "categories.bright_dust.items": "Other Bright Dust Offers",
};

export const BRIGHT_DUST_CATEGORY_ORDER = [
  "categories.featured.bright_dust",
  "categories.bright_dust.items",
] as const;

/** Minimum BD items expected when the daily Eververse API response is complete. */
export const EXPECTED_MIN_DAILY_BRIGHT_DUST_ITEMS = 6;

/**
 * Shown when Bungie's API returns vendor sales but not the daily BD rotation
 * (known limitation since Destiny 2 update 9.7.0, June 2026).
 */
export const EVERVERSE_DAILY_API_NOTICE =
  "Bungie's API no longer exposes the full daily Bright Dust shop since update 9.7.0. Only partial data may appear here — open Eververse in-game or use the Destiny Companion App for today's complete daily offers.";
