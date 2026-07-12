import {
  ALL_LOOT_COLLECTION_BANNERS,
  type AllLootCollectionBanner,
} from "@/data/all-loot/collection-banners";

export const LOOT_COLLECTOR_HREF = "/all-loot";

export const LOOT_SEARCH_NAV_ITEM = {
  title: "Search loot",
  href: LOOT_COLLECTOR_HREF,
} as const;

export function isLootSearchNavActive(pathname: string): boolean {
  return pathname === LOOT_COLLECTOR_HREF;
}

export function isLootCollectionBannerAvailable(
  banner: AllLootCollectionBanner,
): boolean {
  return Boolean(banner.href) && !banner.comingSoon;
}

export function isLootCollectionBannerActive(
  pathname: string,
  banner: AllLootCollectionBanner,
): boolean {
  if (!banner.href) return false;

  if (pathname === banner.href || pathname.startsWith(`${banner.href}/`)) {
    return true;
  }

  if (banner.href === "/pvp-activities") {
    return (
      pathname.startsWith("/activities/crucible") ||
      pathname.startsWith("/activities/iron-banner") ||
      pathname.startsWith("/activities/trials-of-osiris")
    );
  }

  return false;
}

export function isLootNavActive(pathname: string): boolean {
  if (isLootSearchNavActive(pathname)) {
    return true;
  }

  if (pathname.startsWith("/activities/")) {
    return true;
  }

  return ALL_LOOT_COLLECTION_BANNERS.some((banner) => {
    if (!isLootCollectionBannerAvailable(banner) || !banner.href) return false;
    return (
      pathname === banner.href || pathname.startsWith(`${banner.href}/`)
    );
  });
}

export { ALL_LOOT_COLLECTION_BANNERS };
