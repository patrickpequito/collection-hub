"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import { TimelineEntryCard } from "@/components/expansions/seasons-timeline";
import { YouTubeEmbed } from "@/components/seasons/youtube-embed";
import type { TimelineEntry } from "@/lib/home/timeline";
import type { SeasonProgressInputs } from "@/lib/seasons/season-progress";
import { useSeasonProfileProgress } from "@/lib/seasons/use-season-profile-progress";

type ExpansionTrailerSectionProps = {
  youtubeId?: string;
  /** Seasons released during this expansion's year, oldest first. */
  seasons: readonly TimelineEntry[];
  seasonProgressInputs: SeasonProgressInputs[];
  heading?: string;
};

/** Overview: launch trailer with the year's seasons beside it. */
export function ExpansionTrailerSection({
  youtubeId,
  seasons,
  seasonProgressInputs,
  heading = "Overview",
}: ExpansionTrailerSectionProps) {
  const seasonProgress = useSeasonProfileProgress(seasonProgressInputs);
  if (!youtubeId && seasons.length === 0) return null;

  return (
    <section className="min-w-0 space-y-3">
      {/* Heading row shares the columns so the season cards start level with the video. */}
      <SectionHeading title={heading} note={seasons.length > 0 ? "Seasons this year" : undefined} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        {youtubeId ? (
          <div className="min-w-0">
            <YouTubeEmbed youtubeId={youtubeId} title={`${heading} trailer`} />
          </div>
        ) : null}
        {seasons.length > 0 ? (
          // Stretches to the video's height; the cards share it equally.
          <div className="flex min-w-0 flex-col gap-2">
            <span className="ui-label md:hidden">Seasons this year</span>
            {seasons.map((season) => (
              <TimelineEntryCard
                key={season.slug}
                entry={season}
                progress={seasonProgress.get(season.slug)}
                compact
                showLatest={false}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
