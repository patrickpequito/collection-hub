"use client";

import Image from "next/image";
import { useState } from "react";
import { InteractiveBannerLink } from "@/components/interactive-banner-link";
import type { ActivityEntry } from "@/types/activity-loot";
import { getActivityHref as getRadLootActivityHref } from "@/data/rad-loot/activities";
import { bungieIconUrl } from "@/lib/bungie-icon";

/** Banner height — change here to tweak all activity banners. */
const BANNER_HEIGHT_CLASS = "h-[140px]";

const BANNER_ICON_SIZE_PX = 30;
const FEATURED_ICON_SIZE_PX = 18;
const LEVIATHAN_BANNER_ICON_SIZE_PX = 38;

const LEVIATHAN_FAMILY_SLUGS = new Set([
  "leviathan",
  "eater-of-worlds",
  "spire-of-stars",
]);

type ActivityBannerSmallProps = {
  entry: ActivityEntry;
  /** Defaults to RAD Loot `/images/rad-loot/activities`. */
  imageBasePath?: string;
  /** Defaults to RAD Loot href resolver. */
  getHref?: (entry: ActivityEntry) => string | null;
  iconPath?: string | null;
  /** null = signed out or no title seal — show icon at full opacity. */
  titleEarned?: boolean | null;
  /** null = signed out — hide completion count. */
  totalCompletions?: number | null;
  /** Weekly Tier 5 rotator highlight. */
  featured?: boolean;
  featuredIconPath?: string;
};

export function ActivityBannerSmall({
  entry,
  imageBasePath = "/images/rad-loot/activities",
  getHref = getRadLootActivityHref,
  iconPath = null,
  titleEarned = null,
  totalCompletions = null,
  featured = false,
  featuredIconPath = "/images/rad-loot/featured.png",
}: ActivityBannerSmallProps) {
  const href = getHref(entry);
  const mobileImageUrl = entry.imageFile
    ? `${imageBasePath}/${entry.imageFile}`
    : null;
  const wideImageUrl = entry.wideImageFile
    ? `${imageBasePath}/${entry.wideImageFile}`
    : null;
  const [imageError, setImageError] = useState(false);
  const showImage = mobileImageUrl && !imageError;
  const sealIconUrl = iconPath ? bungieIconUrl(iconPath) : "";
  const isLeviathanFamily = LEVIATHAN_FAMILY_SLUGS.has(entry.slug);
  const iconSizePx = isLeviathanFamily
    ? LEVIATHAN_BANNER_ICON_SIZE_PX
    : BANNER_ICON_SIZE_PX;
  const iconOpacity =
    titleEarned === false ? "opacity-50" : "opacity-100";
  const showCompletions = totalCompletions !== null;

  const content = (
    <div className={`relative ${BANNER_HEIGHT_CLASS} overflow-hidden bg-zinc-900`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <picture className="absolute inset-0 block h-full w-full">
          {wideImageUrl ? (
            <source media="(min-width: 768px)" srcSet={wideImageUrl} />
          ) : null}
          <img
            src={mobileImageUrl}
            alt=""
            className="h-full w-full object-cover object-left transition duration-300 group-hover:scale-[1.01]"
            onError={() => setImageError(true)}
          />
        </picture>
      ) : null}
      {featured ? (
        <div className="absolute left-0 top-0 z-10 p-3">
          <Image
            src={featuredIconPath}
            alt=""
            width={FEATURED_ICON_SIZE_PX}
            height={FEATURED_ICON_SIZE_PX}
            className="object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]"
            style={{ width: FEATURED_ICON_SIZE_PX, height: FEATURED_ICON_SIZE_PX }}
            unoptimized
          />
        </div>
      ) : null}
      {sealIconUrl ? (
        <div className="absolute right-0 top-0 z-10 flex items-center p-3">
          <Image
            src={sealIconUrl}
            alt=""
            width={iconSizePx}
            height={iconSizePx}
            className={`object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] ${iconOpacity} ${
              showCompletions
                ? isLeviathanFamily
                  ? "mr-1"
                  : "mr-2.5"
                : ""
            }`}
            style={{ width: iconSizePx, height: iconSizePx }}
            unoptimized
          />
          {showCompletions ? (
            <>
              <span className="h-8 w-px shrink-0 bg-zinc-400/70" aria-hidden />
              <span className="ml-2.5 text-lg font-bold text-white tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {totalCompletions}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
      <div className="absolute inset-0 flex items-center px-5 py-4">
        <span className="text-lg font-bold text-zinc-100">{entry.title}</span>
        {!entry.available ? (
          <span className="ml-auto text-xs uppercase tracking-wide text-zinc-500">
            Coming soon
          </span>
        ) : null}
      </div>
    </div>
  );

  const borderClass = featured
    ? "border-[1.5px] border-[#24b4b3] hover:border-[#24b4b3]"
    : "border border-zinc-800 hover:border-zinc-600";
  const bannerClass = `group relative block overflow-hidden rounded-xl transition ${borderClass}`;

  if (!href && entry.placeholder) {
    return (
      <InteractiveBannerLink className={bannerClass}>{content}</InteractiveBannerLink>
    );
  }

  if (!href) {
    return (
      <div
        className={`group overflow-hidden rounded-xl opacity-60 ${featured ? "border-[1.5px] border-[#24b4b3]" : "border border-zinc-800/80"}`}
      >
        {content}
      </div>
    );
  }

  return (
    <InteractiveBannerLink href={href} className={bannerClass}>
      {content}
    </InteractiveBannerLink>
  );
}
