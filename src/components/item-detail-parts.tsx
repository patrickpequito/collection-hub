"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import Link from "@/components/app-link";
import type { ReactNode } from "react";
import { bungieIconUrl } from "@/lib/bungie-icon";

/** Rarity band colours, same palette as the item tooltip. */
const RARITY_BAND: Record<string, { band: string; title: string; subtitle: string; dark: boolean }> = {
  exotic: {
    band: "bg-[linear-gradient(90deg,#8a7322,#ceae33_45%,#6d5a19)]",
    title: "text-[#1c1600]",
    subtitle: "text-[#4a3d05]",
    dark: true,
  },
  legendary: {
    band: "bg-[linear-gradient(90deg,#3a2148,#522f65_45%,#2a1b33)]",
    title: "text-bone",
    subtitle: "text-[#d9c8e6]",
    dark: false,
  },
  rare: {
    band: "bg-[linear-gradient(90deg,#2d4560,#5076a3_45%,#253a52)]",
    title: "text-white",
    subtitle: "text-[#dbe6f3]",
    dark: false,
  },
};
const NEUTRAL_BAND = { band: "bg-panel", title: "text-bone", subtitle: "text-ash", dark: false };

export type ItemTag = { label: string; tone?: "gold" | "green" | "plain" };

/**
 * Coloured item header: icon, name, type line, tags and an optional right slot (versions).
 * Phones get a compact band (icon, name, one meta line) with tags and versions in a darker
 * footer strip; from sm up it is the wide header.
 */
export function ItemHeader({
  name,
  iconPath,
  rarity,
  typeLine,
  mobileTypeLine,
  tags,
  right,
}: {
  name: string;
  iconPath: string;
  rarity?: string | null;
  /** Rendered with `dark` = true on light (exotic) bands, so icons can flip. */
  typeLine: ReactNode | ((dark: boolean) => ReactNode);
  /** Single-line meta for phones; falls back to `typeLine`. */
  mobileTypeLine?: ReactNode | ((dark: boolean) => ReactNode);
  tags: ItemTag[];
  right?: ReactNode;
}) {
  const style = (rarity && RARITY_BAND[rarity.toLowerCase()]) || NEUTRAL_BAND;
  const tagClass = (tone: ItemTag["tone"]) => {
    if (style.dark) return "border-black/40 text-[#1c1600]";
    if (tone === "gold") return "border-owned text-owned";
    if (tone === "green") return "border-emerald-400/50 text-emerald-200";
    return "border-white/40 text-bone";
  };
  const render = (line: ReactNode | ((dark: boolean) => ReactNode)) =>
    typeof line === "function" ? line(style.dark) : line;
  const icon = (sizeClass: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={bungieIconUrl(iconPath)}
      alt=""
      width={96}
      height={96}
      className={`${sizeClass} shrink-0 border-2 border-white/50`}
    />
  );
  const tagList = (className: string) =>
    tags.length > 0 ? (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {tags.map((tag) => (
          <span
            key={tag.label}
            className={`border px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.14em] ${tagClass(tag.tone)}`}
          >
            {tag.label}
          </span>
        ))}
      </div>
    ) : null;

  return (
    <section className={`border border-hairline ${style.band}`}>
      <div className="sm:hidden">
        <div className="flex items-center gap-3.5 p-4">
          {icon("size-[60px]")}
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className={`font-display text-2xl font-semibold uppercase leading-none tracking-[0.05em] ${style.title}`}>
              {name}
            </h1>
            <div
              className={`flex min-w-0 flex-wrap items-center gap-2 font-display text-[13px] uppercase tracking-[0.12em] ${style.subtitle}`}
            >
              {render(mobileTypeLine ?? typeLine)}
            </div>
          </div>
        </div>
        {tags.length > 0 || right ? (
          <div
            className={`flex items-center justify-between gap-2 border-t px-4 py-2.5 ${
              style.dark ? "border-black/15 bg-black/10" : "border-white/[0.12] bg-void/45"
            }`}
          >
            {tagList("min-w-0")}
            {right ? <div className="shrink-0 [&_.size-10]:size-8">{right}</div> : null}
          </div>
        ) : null}
      </div>

      <div className="hidden flex-wrap items-center gap-5 px-7 py-6 sm:flex">
        {icon("size-24")}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1
            className={`font-display text-[42px] font-semibold uppercase leading-none tracking-[0.05em] ${style.title}`}
          >
            {name}
          </h1>
          <div
            className={`flex flex-wrap items-center gap-2 font-display text-sm uppercase tracking-[0.14em] ${style.subtitle}`}
          >
            {render(typeLine)}
          </div>
          {tagList("")}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </section>
  );
}

/** Label / value rows for "Where to get it". */
export function WhereToGetIt({
  rows,
}: {
  rows: { label: string; value: ReactNode; href?: string }[];
}) {
  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Where to get it" />
      <div className="ui-panel divide-y divide-white/[0.08] px-4">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
            <span className="ui-label">{row.label}</span>
            {row.href ? (
              <Link href={row.href} className="text-right text-sm text-bone underline-offset-2 hover:underline">
                {row.value}
              </Link>
            ) : (
              <span className="text-right text-sm text-bone/85">{row.value}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
