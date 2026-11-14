"use client";

import Link from "@/components/app-link";
import { useMemo } from "react";
import {
  useProfileChecklists,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import type { BannerTheme } from "@/lib/destinations/banner-themes";
import {
  allBlocks,
  blockMarks,
  type DestinationActivities,
} from "@/lib/destinations/activities";
import { useSignedIn } from "@/lib/use-signed-in";

/**
 * Expansion page · Campaign & Quests: the destination's Activities progress,
 * linking to the Activities section of the destination page.
 */

export type DestinationActivitiesBannerProps = {
  slug: string;
  name: string;
  /** Explore (patrol) art, different from the destination header. */
  imageUrl: string;
  theme: BannerTheme;
  activities: DestinationActivities;
};

function fade(color: string, amount: number) {
  return `color-mix(in srgb, ${color} ${amount}%, transparent)`;
}

function Count({ done, total, signedIn }: { done: number; total: number; signedIn: boolean }) {
  if (!signedIn) return <span className="ui-label shrink-0 whitespace-nowrap text-[#e9e7e2]!">{total}</span>;
  return (
    <span className={`ui-label shrink-0 whitespace-nowrap ${done === total ? "text-owned!" : "text-[#e9e7e2]!"}`}>
      {`${done} / ${total}`}
    </span>
  );
}

function Bar({ done, total, color }: { done: number; total: number; color: string }) {
  return (
    <span className="block h-1 bg-white/[0.12]">
      <span className="block h-1" style={{ width: `${total ? (done / total) * 100 : 0}%`, background: color }} />
    </span>
  );
}

export function DestinationActivitiesBanner({
  slug,
  name,
  imageUrl,
  theme,
  activities,
  wide = false,
  tileColumns = 3,
}: DestinationActivitiesBannerProps & {
  /** Full width (expansions without campaign missions). */
  wide?: boolean;
  /** Tiles per row on large screens in the stacked layout (4 when the banner spans the page). */
  tileColumns?: 3 | 4;
}) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const checklists = useProfileChecklists(signedIn);

  const tiles = useMemo(() => {
    const sources = { signedIn, instances, checklists };
    // Cards only count when they carry marks (The Sieve bosses); the tier ladder has none.
    return allBlocks(activities)
      .map((block) => {
        const marks = blockMarks(block, sources);
        return { title: block.title, done: marks.filter((mark) => mark === true).length, total: marks.length };
      })
      .filter((tile) => tile.total > 0);
  }, [activities, signedIn, instances, checklists]);

  const done = tiles.reduce((sum, tile) => sum + tile.done, 0);
  const total = tiles.reduce((sum, tile) => sum + tile.total, 0);

  const head = (
    <div className="min-w-0">
      <div className="font-display text-[11px] uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
        Destination activities
      </div>
      <div
        className="mt-1 font-display text-[30px] leading-none font-semibold uppercase tracking-[0.04em] text-white sm:text-[38px]"
        style={{ textShadow: theme.nameGlow }}
      >
        {name}
      </div>
      {signedIn ? (
        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-xs uppercase tracking-[0.16em] text-[#c7cad0]">Activities</span>
          <span className="block min-w-[60px] max-w-[200px] flex-1">
            <Bar done={done} total={total} color={theme.accent} />
          </span>
          <Count done={done} total={total} signedIn />
        </div>
      ) : null}
    </div>
  );

  const button = (
    <span
      className="inline-block shrink-0 border bg-void/50 px-2.5 py-1.5 font-display text-xs uppercase tracking-[0.18em] whitespace-nowrap text-white transition group-hover:bg-void/80"
      style={{ borderColor: fade(theme.accent, 50) }}
    >
      View activities →
    </span>
  );

  const grid = (
    <div className={`relative grid grid-cols-2 gap-2 ${wide || tileColumns === 4 ? "lg:grid-cols-4" : "sm:grid-cols-3"}`}>
      {tiles.map((tile) => {
        const complete = signedIn && tile.done === tile.total;
        return (
          <div
            key={tile.title}
            className="flex flex-col justify-between gap-2 border-l-2 bg-void/60 px-3 py-2.5"
            style={{ borderColor: complete ? theme.accent : fade(theme.accent, 45) }}
          >
            <div className="flex justify-between gap-2.5">
              <span className="font-display text-[15px] leading-tight font-semibold uppercase tracking-[0.04em] text-white">
                {tile.title}
              </span>
              <Count done={tile.done} total={tile.total} signedIn={signedIn} />
            </div>
            {signedIn ? <Bar done={tile.done} total={tile.total} color={complete ? "var(--color-owned)" : theme.accent} /> : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <Link
      href={`/activities/destinations/${slug}#activities`}
      className={`group relative block h-full overflow-hidden border px-4 py-4 sm:px-[22px] sm:py-[18px] ${
        wide ? "lg:grid lg:grid-cols-[calc((100%+34px)/3-27px)_1fr] lg:items-center lg:gap-[26px]" : "flex flex-col justify-between gap-[18px]"
      }`}
      style={{ borderColor: theme.border, boxShadow: theme.glow }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[50%_35%] transition duration-300 group-hover:scale-[1.02]"
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,13,16,.88) 0%, rgba(11,13,16,.45) 50%, rgba(11,13,16,.68) 100%)",
        }}
      />
      {wide ? (
        <div className="relative mb-4 flex flex-col items-start gap-4 lg:mb-0">
          {head}
          {button}
        </div>
      ) : (
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          {head}
          {button}
        </div>
      )}
      {grid}
    </Link>
  );
}
