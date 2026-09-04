"use client";

import { useState } from "react";
import { InteractiveBannerLink } from "@/components/interactive-banner-link";
import { YouTubeEmbed } from "@/components/seasons/youtube-embed";
import type { SeasonIndexEntry } from "@/data/seasons";
import { localSeasonIconPathFromSlug } from "@/lib/all-loot/season-icon-path";

const SEASON_IMAGE_BASE = "/images/seasons/activities";

type ExpansionTrailerSectionProps = {
  youtubeId: string;
  seasons: readonly SeasonIndexEntry[];
  heading?: string;
};

function SeasonBannerThumb({ season }: { season: SeasonIndexEntry }) {
  const [src, setSrc] = useState(`${SEASON_IMAGE_BASE}/${season.imageFile}`);
  const [failed, setFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);

  const content = (
    <div className="relative h-full min-h-0 overflow-hidden bg-zinc-900">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-left transition duration-300 group-hover:scale-[1.01]"
          onError={() => {
            setFailed(true);
            setSrc("");
          }}
        />
      ) : null}
      {!iconFailed ? (
        <div className="absolute right-0 top-0 z-10 p-1.5 sm:p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={localSeasonIconPathFromSlug(season.slug)}
            alt=""
            className="size-4 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] sm:size-5"
            onError={() => setIconFailed(true)}
          />
        </div>
      ) : null}
      <div className="absolute inset-x-0 top-0 flex items-center px-3 py-2 pr-8 sm:px-4 sm:pr-10">
        <div className="min-w-0">
          <span className="block text-sm font-bold text-zinc-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-base">
            {season.title}
          </span>
          {!season.available ? (
            <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-zinc-500">
              Coming soon
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );

  const shellClass =
    "group relative block h-full min-h-0 overflow-hidden rounded-xl border border-zinc-800 transition hover:border-zinc-600";

  if (season.href && season.available) {
    return (
      <InteractiveBannerLink href={season.href} className={shellClass}>
        {content}
      </InteractiveBannerLink>
    );
  }

  return (
    <div className="group h-full min-h-0 overflow-hidden rounded-xl border border-zinc-800/80 opacity-60">
      {content}
    </div>
  );
}

function SeasonBannerStack({
  seasons,
}: {
  seasons: readonly SeasonIndexEntry[];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5">
      {seasons.map((season) => (
        <div key={season.slug} className="min-h-[3.25rem] flex-1">
          <SeasonBannerThumb season={season} />
        </div>
      ))}
    </div>
  );
}

export function ExpansionTrailerSection({
  youtubeId,
  seasons,
  heading = "Expansion trailer",
}: ExpansionTrailerSectionProps) {
  return (
    <section className="min-w-0 space-y-3">
      <h2 className="text-lg font-semibold text-zinc-100">{heading}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,36rem)_1fr] sm:items-stretch sm:gap-6">
        <div className="min-w-0 w-full">
          <YouTubeEmbed youtubeId={youtubeId} title={heading} />
        </div>
        <div className="min-w-0 w-full sm:min-h-full">
          <SeasonBannerStack seasons={seasons} />
        </div>
      </div>
    </section>
  );
}
