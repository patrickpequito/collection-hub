"use client";

import { type ReactNode, useState } from "react";
import { ActivitySectionHeader } from "@/components/activity-section-header";
import { InteractiveBannerLink } from "@/components/interactive-banner-link";
import { EXPANSION_INDEX_ENTRIES } from "@/data/expansions";
import { SEASONS_BY_EXPANSION_SLUG } from "@/data/seasons";
import type {
  ExpansionOverallProgress,
  ExpansionProgressInputs,
} from "@/lib/expansions/expansion-progress";
import { useExpansionProfileProgress } from "@/lib/expansions/use-expansion-profile-progress";
import type { SeasonProgressInputs } from "@/lib/seasons/season-progress";
import { useSeasonProfileProgress } from "@/lib/seasons/use-season-profile-progress";
import { localSeasonIconPathFromSlug } from "@/lib/all-loot/season-icon-path";
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
    seasons: [...(SEASONS_BY_EXPANSION_SLUG[expansion.slug] ?? [])].reverse(),
  }),
);

function formatSeasonIndexTitle(title: string): ReactNode {
  const match = /^Season of (.+)$/.exec(title);
  if (!match) return title;
  return (
    <>
      Season of
      <br />
      {match[1]}
    </>
  );
}

function IndexBannerIcon({
  slug,
  compact,
}: {
  slug: string;
  compact: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const sizeClass = compact ? "size-4 sm:size-5" : "size-6 sm:size-7";

  return (
    <div className={`absolute right-0 top-0 z-10 ${compact ? "p-1.5" : "p-2.5"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={localSeasonIconPathFromSlug(slug)}
        alt=""
        className={`${sizeClass} object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function ThinBannerProgressBar({
  percent,
  label,
}: {
  percent: number | null | undefined;
  label: string;
}) {
  if (percent == null) return null;

  const widthPercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="absolute inset-x-0 bottom-0 px-2 pb-1.5">
      <div
        className="h-0.5 w-full overflow-hidden rounded-full bg-zinc-800/90"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full bg-[#c9a227] transition-[width] duration-300 ease-out"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}

function BannerProgressBar({
  progress,
}: {
  progress: ExpansionOverallProgress | undefined;
}) {
  if (progress?.progress == null || progress.percent == null) return null;

  const widthPercent = Math.max(0, Math.min(100, progress.percent));

  return (
    <div className="absolute inset-x-0 bottom-0">
      <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-2.5 pt-8">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            Total completion
          </span>
          <span className="text-xs font-semibold tabular-nums text-[#c9a227]">
            {progress.percent}%
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/90"
          role="progressbar"
          aria-label="Total expansion completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
        >
          <div
            className="h-full rounded-full bg-[#c9a227] transition-[width] duration-300 ease-out"
            style={{ width: `${widthPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function IndexBanner({
  entry,
  imageBase,
  fallbackBase = RAD_FALLBACK_BASE,
  compact = false,
  progress,
  progressStyle = "labeled",
}: {
  entry: IndexBannerEntry;
  imageBase: string;
  fallbackBase?: string;
  /** Smaller type for season cells inside the 2×2 quad. */
  compact?: boolean;
  progress?: ExpansionOverallProgress;
  /** Season banners use a thin bar without labels. */
  progressStyle?: "labeled" | "minimal";
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

  const hasProgress = entry.available && progress?.progress != null;
  const titlePaddingClass = hasProgress
    ? compact
      ? progressStyle === "minimal"
        ? "pb-4"
        : "pb-12"
      : "pb-12"
    : "";

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
      <IndexBannerIcon slug={entry.slug} compact={compact} />
      <div
        className={`absolute inset-x-0 top-0 flex ${
          compact ? "items-start" : "items-center"
        } ${compact ? "gap-1.5 px-2.5 py-1.5" : "px-5 py-4"} ${titlePaddingClass} ${
          compact ? "pr-6 sm:pr-7" : "pr-11"
        }`}
      >
        <div className="min-w-0">
          <span
            className={`block font-bold text-zinc-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
              compact ? "text-xs leading-tight sm:text-sm" : "text-lg"
            }`}
          >
            {compact ? formatSeasonIndexTitle(entry.title) : entry.title}
          </span>
          {!entry.available ? (
            <span
              className={`mt-0.5 block uppercase tracking-wide text-zinc-500 ${
                compact ? "text-[9px] leading-none" : "text-xs"
              }`}
            >
              Coming soon
            </span>
          ) : null}
        </div>
      </div>
      {entry.available && progressStyle === "labeled" ? (
        <BannerProgressBar progress={progress} />
      ) : null}
      {entry.available && progressStyle === "minimal" ? (
        <ThinBannerProgressBar
          percent={progress?.percent}
          label={`${entry.title} collection progress`}
        />
      ) : null}
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

function SeasonQuad({
  seasons,
  progressBySlug,
}: {
  seasons: readonly SeasonIndexEntry[];
  progressBySlug: Map<string, ExpansionOverallProgress>;
}) {
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
            progress={progressBySlug.get(entry.slug)}
            progressStyle="minimal"
          />
        ) : (
          <div key={`empty-${index}`} aria-hidden />
        ),
      )}
    </div>
  );
}

type ExpansionsIndexContentProps = {
  progressInputs: ExpansionProgressInputs[];
  seasonProgressInputs: SeasonProgressInputs[];
};

export function ExpansionsIndexContent({
  progressInputs,
  seasonProgressInputs,
}: ExpansionsIndexContentProps) {
  const progressBySlug = useExpansionProfileProgress(progressInputs);
  const seasonProgressBySlug = useSeasonProfileProgress(seasonProgressInputs);

  const seasonProgressForBanner = new Map<string, ExpansionOverallProgress>();
  for (const [slug, progress] of seasonProgressBySlug) {
    seasonProgressForBanner.set(slug, progress);
  }

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
            <IndexBanner
              entry={expansion}
              imageBase={EXPANSION_IMAGE_BASE}
              progress={progressBySlug.get(expansion.slug)}
            />
            <SeasonQuad
              seasons={seasons}
              progressBySlug={seasonProgressForBanner}
            />
          </div>
        ))}
      </div>

      {/* Mobile: expansion then its seasons, newest → oldest */}
      <div className="space-y-2 md:hidden">
        {EXPANSION_SEASON_ROWS.map(({ expansion, seasons }) => (
          <div key={expansion.slug} className="space-y-2">
            <IndexBanner
              entry={expansion}
              imageBase={EXPANSION_IMAGE_BASE}
              progress={progressBySlug.get(expansion.slug)}
            />
            {seasons.length > 0 ? (
              <SeasonQuad
                seasons={seasons}
                progressBySlug={seasonProgressForBanner}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
