"use client";

import { useState } from "react";
import { ActivitySectionHeader } from "@/components/activity-section-header";
import { InteractiveBannerLink } from "@/components/interactive-banner-link";
import { EXPANSION_INDEX_ENTRIES } from "@/data/expansions";
import { SEASONS_BY_EXPANSION_SLUG } from "@/data/seasons";
import type { ExpansionIndexEntry } from "@/data/expansions/types";
import type { SeasonIndexEntry } from "@/data/seasons";

/** Same height as RAD Loot activity banners — also the season 2×2 quad height. */
const BANNER_HEIGHT_CLASS = "h-[140px]";

const EXPANSION_IMAGE_BASE = "/images/expansions/activities";
const SEASON_IMAGE_BASE = "/images/seasons/activities";
const RAD_FALLBACK_BASE = "/images/rad-loot/activities";

type IndexBannerEntry = {
  slug: string;
  title: string;
  available: boolean;
  imageFile: string;
  fallbackImageFile?: string;
  href?: string;
};

type ExpansionSeasonRow = {
  expansion: ExpansionIndexEntry;
  seasons: readonly SeasonIndexEntry[];
};

const EXPANSION_SEASON_ROWS: ExpansionSeasonRow[] = EXPANSION_INDEX_ENTRIES.map(
  (expansion) => ({
    expansion,
    seasons: SEASONS_BY_EXPANSION_SLUG[expansion.slug] ?? [],
  }),
);

function IndexBanner({
  entry,
  imageBase,
  fallbackBase = RAD_FALLBACK_BASE,
  compact = false,
}: {
  entry: IndexBannerEntry;
  imageBase: string;
  fallbackBase?: string;
  /** Smaller type for season cells inside the 2×2 quad. */
  compact?: boolean;
}) {
  const primaryUrl = `${imageBase}/${entry.imageFile}`;
  const fallbackUrl = entry.fallbackImageFile
    ? `${fallbackBase}/${entry.fallbackImageFile}`
    : null;
  const [src, setSrc] = useState(primaryUrl);
  const [failed, setFailed] = useState(false);

  const bannerClass = compact
    ? "group relative block h-full min-h-0 overflow-hidden rounded-xl border border-zinc-800 transition hover:border-zinc-600"
    : `group relative block ${BANNER_HEIGHT_CLASS} overflow-hidden rounded-xl border border-zinc-800 transition hover:border-zinc-600`;

  const content = (
    <div className="relative h-full min-h-0 overflow-hidden bg-zinc-900">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-left transition duration-300 group-hover:scale-[1.01]"
          onError={() => {
            if (fallbackUrl && src !== fallbackUrl) {
              setSrc(fallbackUrl);
              return;
            }
            setFailed(true);
          }}
        />
      ) : null}
      <div
        className={`absolute inset-0 flex items-center ${
          compact ? "gap-1.5 px-2.5 py-1.5" : "px-5 py-4"
        }`}
      >
        <span
          className={`font-bold text-zinc-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
            compact ? "text-xs leading-tight sm:text-sm" : "text-lg"
          }`}
        >
          {entry.title}
        </span>
        {!entry.available ? (
          <span
            className={`ml-auto shrink-0 uppercase tracking-wide text-zinc-500 ${
              compact ? "text-[9px] leading-none" : "text-xs"
            }`}
          >
            Coming soon
          </span>
        ) : null}
      </div>
    </div>
  );

  if (entry.href && entry.available) {
    return (
      <InteractiveBannerLink href={entry.href} className={bannerClass}>
        {content}
      </InteractiveBannerLink>
    );
  }

  return (
    <div
      className={
        compact
          ? "group h-full min-h-0 overflow-hidden rounded-xl border border-zinc-800/80 opacity-60"
          : `group ${BANNER_HEIGHT_CLASS} overflow-hidden rounded-xl border border-zinc-800/80 opacity-60`
      }
    >
      {content}
    </div>
  );
}

function SeasonQuad({ seasons }: { seasons: readonly SeasonIndexEntry[] }) {
  if (seasons.length === 0) {
    return <div className={`hidden ${BANNER_HEIGHT_CLASS} md:block`} aria-hidden />;
  }

  const cells: Array<SeasonIndexEntry | null> = [...seasons];
  while (cells.length < 4) cells.push(null);

  return (
    <div className={`grid ${BANNER_HEIGHT_CLASS} grid-cols-2 grid-rows-2 gap-1`}>
      {cells.map((entry, index) =>
        entry ? (
          <IndexBanner
            key={entry.slug}
            entry={entry}
            imageBase={SEASON_IMAGE_BASE}
            compact
          />
        ) : (
          <div key={`empty-${index}`} aria-hidden />
        ),
      )}
    </div>
  );
}

export function ExpansionsIndexContent() {
  return (
    <div className="space-y-3">
      <div className="hidden gap-8 md:grid md:grid-cols-2">
        <ActivitySectionHeader>Expansions</ActivitySectionHeader>
        <ActivitySectionHeader>Seasons</ActivitySectionHeader>
      </div>

      {/* Desktop: expansion | season quad per row */}
      <div className="hidden gap-x-8 gap-y-2 md:grid md:grid-cols-2">
        {EXPANSION_SEASON_ROWS.map(({ expansion, seasons }) => (
          <div key={expansion.slug} className="contents">
            <IndexBanner entry={expansion} imageBase={EXPANSION_IMAGE_BASE} />
            <SeasonQuad seasons={seasons} />
          </div>
        ))}
      </div>

      {/* Mobile: expansion then its seasons, newest → oldest */}
      <div className="space-y-2 md:hidden">
        {EXPANSION_SEASON_ROWS.map(({ expansion, seasons }) => (
          <div key={expansion.slug} className="space-y-2">
            <IndexBanner entry={expansion} imageBase={EXPANSION_IMAGE_BASE} />
            {seasons.length > 0 ? <SeasonQuad seasons={seasons} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
