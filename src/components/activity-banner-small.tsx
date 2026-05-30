"use client";

import Link from "next/link";
import { useState } from "react";
import type { ActivityEntry } from "@/types/activity-loot";
import { getActivityHref } from "@/data/rad-loot/activities";

/** Banner height — change here to tweak all activity banners. */
const BANNER_HEIGHT_CLASS = "h-[140px]";

type ActivityBannerSmallProps = {
  entry: ActivityEntry;
};

export function ActivityBannerSmall({ entry }: ActivityBannerSmallProps) {
  const href = getActivityHref(entry);
  const imageUrl = entry.imageFile
    ? `/images/rad-loot/activities/${entry.imageFile}`
    : null;
  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;

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
