"use client";

import Link from "next/link";
import { useHomeSummary } from "@/components/home/home-summary-provider";
import { PinIcon } from "@/components/pin-icon";
import { usePinnedTitles } from "@/lib/use-pinned-titles";

export type ExploreMetaKey = "loot" | "exotics" | "shaders" | "badges" | "seals";

/** Your progress next to an Explore link (static fallback when signed out). */
export function ExploreMeta({ metaKey, fallback }: { metaKey: ExploreMetaKey; fallback: string }) {
  const { summary } = useHomeSummary();
  if (!summary) return <>{fallback}</>;
  const pair = {
    loot: null,
    exotics: summary.exotics,
    shaders: summary.shaders,
    badges: { owned: summary.badges.completed, total: summary.badges.total },
    seals: summary.titles,
  }[metaKey];
  if (metaKey === "loot") {
    const { owned, total } = summary.collection;
    return <>{total > 0 ? `${Math.round((owned / total) * 100)}%` : fallback}</>;
  }
  return <>{pair ? `${pair.owned.toLocaleString("en-US")} / ${pair.total.toLocaleString("en-US")}` : fallback}</>;
}

const ROW = "flex items-center justify-between gap-3 border-b border-white/[0.07] py-2 text-sm last:border-b-0";

/** The three closest titles in the Triumphs column (signed in), each marked with a small diamond. */
export function ExploreClosestTitles({ placeholders }: { placeholders: { label: string; href: string; meta: string }[] }) {
  const { summary } = useHomeSummary();
  const { pins } = usePinnedTitles();
  // Pinned titles first (kept even when complete), then the closest ones fill the rest.
  const progressBySlug = new Map((summary?.titleProgress ?? []).map((entry) => [entry.slug, entry]));
  const titles = summary
    ? [
        ...pins
          .map((slug) => progressBySlug.get(slug))
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .map((entry) => ({ ...entry, pinned: true })),
        ...summary.closestTitles.filter((entry) => !pins.includes(entry.slug)).map((entry) => ({ ...entry, pinned: false })),
      ].slice(0, 3)
    : undefined;
  if (!titles?.length) {
    return (
      <>
        {placeholders.map((row) => (
          <Link key={row.label} href={row.href} className={`${ROW} text-bone/85 transition hover:text-white`}>
            <span>{row.label}</span>
            <span className="text-[12.5px] text-ash">{row.meta}</span>
          </Link>
        ))}
      </>
    );
  }
  return (
    <>
      {titles.map((title) => (
        <Link key={title.slug} href={`/triumphs/title/${title.slug}`} className={`${ROW} text-bone/85 transition hover:text-white`}>
          <span className="flex min-w-0 items-center gap-2">
            {title.pinned ? (
              <PinIcon className="size-3 shrink-0 text-[#c7cad0]" />
            ) : (
              <span aria-hidden className="mx-0.5 size-1.5 shrink-0 rotate-45 border border-[#c7cad0]" />
            )}
            <span className="truncate">
              {title.pinned ? "" : "Closest: "}
              {title.name}
            </span>
          </span>
          <span className="shrink-0 text-[12.5px] tabular-nums text-ash">
            {title.completed} / {title.total}
          </span>
        </Link>
      ))}
    </>
  );
}
