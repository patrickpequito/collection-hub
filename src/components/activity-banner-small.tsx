"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ActivityEntry } from "@/types/activity-loot";
import { getActivityHref } from "@/data/rad-loot/activities";
import { bungieIconUrl } from "@/lib/bungie-icon";

/** Banner height — change here to tweak all activity banners. */
const BANNER_HEIGHT_CLASS = "h-[140px]";

type ActivityBannerSmallProps = {
  entry: ActivityEntry;
  iconPath?: string | null;
  /** null = signed out or no title seal — show icon at full opacity. */
  titleEarned?: boolean | null;
  /** null = signed out — hide completion count. */
  totalCompletions?: number | null;
};

export function ActivityBannerSmall({
  entry,
  iconPath = null,
  titleEarned = null,
  totalCompletions = null,
}: ActivityBannerSmallProps) {
  const href = getActivityHref(entry);
  const imageUrl = entry.imageFile
    ? `/images/rad-loot/activities/${entry.imageFile}`
    : null;
  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;
  const sealIconUrl = iconPath ? bungieIconUrl(iconPath) : "";
  const iconOpacity =
    titleEarned === false ? "opacity-50" : "opacity-100";
  const showCompletions = totalCompletions !== null;

  const content = (
    <div className={`relative ${BANNER_HEIGHT_CLASS} overflow-hidden bg-zinc-900`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-left transition duration-300 group-hover:scale-[1.01]"
          onError={() => setImageError(true)}
        />
      ) : null}
      {sealIconUrl ? (
        <div className="absolute right-0 top-0 z-10 flex items-center gap-2.5 p-3">
          <Image
            src={sealIconUrl}
            alt=""
            width={30}
            height={30}
            className={`h-[30px] w-[30px] object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] ${iconOpacity}`}
            unoptimized
          />
          {showCompletions ? (
            <>
              <span className="h-8 w-px shrink-0 bg-zinc-400/70" aria-hidden />
              <span className="text-lg font-bold text-white tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
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

  if (!href) {
    return (
      <div className="group overflow-hidden rounded-xl border border-zinc-800/80 opacity-60">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl border border-zinc-800 transition hover:border-zinc-600"
    >
      {content}
    </Link>
  );
}
