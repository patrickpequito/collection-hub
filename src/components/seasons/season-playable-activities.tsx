"use client";

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
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
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
      <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-12">
        <h3 className="text-base font-bold text-zinc-100">{activity.title}</h3>
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
        className="group block transition hover:brightness-110"
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
        <h2 className="text-lg font-semibold text-zinc-100">
          Playable activities
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Season content that is still available in the Director today.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {activities.map((activity) => (
          <ActivityBannerCard key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}
