"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import Link from "next/link";
import { useState } from "react";
import type { SeasonPlayableActivity } from "@/data/seasons/types";
import { bungieIconUrl } from "@/lib/bungie-icon";

type SeasonPlayableActivitiesProps = {
  activities: readonly SeasonPlayableActivity[];
};

function ActivityBannerCard({ activity }: { activity: SeasonPlayableActivity }) {
  const imageUrl = bungieIconUrl(activity.pgcrImagePath);
  const [failed, setFailed] = useState(false);

  const content = (
    <div className="relative aspect-video w-full overflow-hidden border border-hairline bg-panel">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : null}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
      <span className="absolute right-2 top-2 border border-white/20 bg-black/70 px-2 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-bone">
        {activity.location}
      </span>
      <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-12">
        <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-[0.06em] text-bone">
          {activity.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-zinc-300">
          {activity.description}
        </p>
      </div>
    </div>
  );

  if (activity.href) {
    return (
      <Link
        href={activity.href}
        className="group block border border-transparent transition hover:border-bone"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function SeasonPlayableActivities({
  activities,
}: SeasonPlayableActivitiesProps) {
  if (activities.length === 0) return null;

  return (
    <section className="min-w-0 space-y-3">
      <div>
        <SectionHeading title="Playable activities" />
        <p className="text-sm text-zinc-400">Season content that is still available in the Director today.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {activities.map((activity) => (
          <ActivityBannerCard key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}
