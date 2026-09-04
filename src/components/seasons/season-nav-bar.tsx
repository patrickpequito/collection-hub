"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { SeasonIndexEntry } from "@/data/seasons";
import { MANIFEST_CHAPTER_LABEL } from "@/lib/all-loot/season-icon-label";
import { localSeasonFilterIconPath } from "@/lib/all-loot/season-icon-path";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { SeasonNavGroup, SeasonNavLink } from "@/lib/seasons/season-nav";

type SeasonNavBarProps = {
  currentSlug: string;
  currentTitle: string;
  previous: SeasonNavLink | null;
  next: SeasonNavLink | null;
  groups: readonly SeasonNavGroup[];
};

const NAV_LINK_CLASS =
  "inline-flex max-w-[11rem] items-center gap-1.5 truncate rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100 sm:max-w-[14rem]";

const NAV_LINK_DISABLED_CLASS =
  "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium text-zinc-700";

/** Catalog season label used by All Loot filter icons (`S15 Season of the Lost`, etc.). */
function seasonFilterLabel(slug: string, title: string): string {
  const match = /^s(\d+)-/i.exec(slug);
  if (match) {
    const chapter = Number(match[1]);
    return MANIFEST_CHAPTER_LABEL[chapter] ?? title;
  }
  return title;
}

function SeasonFilterIcon({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return (
    <Image
      src={bungieIconUrl(
        localSeasonFilterIconPath(seasonFilterLabel(slug, title)),
      )}
      alt=""
      width={14}
      height={14}
      className="h-[1em] w-[1em] shrink-0 object-contain"
      aria-hidden
      unoptimized
    />
  );
}

function SeasonPickerItem({
  season,
  currentSlug,
  onNavigate,
}: {
  season: SeasonIndexEntry;
  currentSlug: string;
  onNavigate: () => void;
}) {
  const isCurrent = season.slug === currentSlug;
  const label = (
    <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
      <SeasonFilterIcon slug={season.slug} title={season.title} />
      <span className="truncate">{season.title}</span>
    </span>
  );

  if (!season.available || !season.href) {
    return (
      <span
        className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-zinc-600"
        aria-disabled="true"
      >
        {label}
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-700">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={season.href}
      onClick={onNavigate}
      aria-current={isCurrent ? "page" : undefined}
      className={`flex items-center justify-between gap-3 px-3 py-2 text-sm transition ${
        isCurrent
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-100"
      }`}
    >
      {label}
      {isCurrent ? (
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-500">
          Current
        </span>
      ) : null}
    </Link>
  );
}

export function SeasonNavBar({
  currentSlug,
  currentTitle,
  previous,
  next,
  groups,
}: SeasonNavBarProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <nav
      aria-label="Season navigation"
      className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-4"
    >
      <div className="min-w-0 shrink-0 basis-[calc(50%-2.5rem)] sm:basis-auto">
        {previous ? (
          <Link
            href={previous.href}
            className={NAV_LINK_CLASS}
            title={`Previous: ${previous.title}`}
          >
            <span aria-hidden="true">←</span>
            <span className="truncate">{previous.title}</span>
          </Link>
        ) : (
          <span className={NAV_LINK_DISABLED_CLASS} aria-hidden="true">
            ←
          </span>
        )}
      </div>

      <div ref={rootRef} className="relative shrink-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-label={`All seasons, current: ${currentTitle}`}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex max-w-[14rem] items-center gap-1.5 px-1 py-1.5 text-xs font-medium text-zinc-100 transition hover:text-white sm:max-w-[18rem]"
        >
          <span className="truncate">{currentTitle}</span>
          <span
            aria-hidden="true"
            className={`text-[10px] text-zinc-400 transition ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label="All seasons"
            className="absolute left-1/2 z-30 mt-2 max-h-[min(28rem,70dvh)] w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/95 py-2 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            {groups.map((group, groupIndex) => (
              <div key={group.expansionSlug}>
                {groupIndex > 0 ? (
                  <div
                    className="my-1.5 border-t border-zinc-800/80"
                    aria-hidden
                  />
                ) : null}
                <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {group.expansionTitle}
                </p>
                <ul>
                  {group.seasons.map((season) => (
                    <li key={season.slug} role="option">
                      <SeasonPickerItem
                        season={season}
                        currentSlug={currentSlug}
                        onNavigate={() => setOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 shrink-0 basis-[calc(50%-2.5rem)] justify-end sm:basis-auto">
        {next ? (
          <Link
            href={next.href}
            className={NAV_LINK_CLASS}
            title={`Next: ${next.title}`}
          >
            <span className="truncate">{next.title}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className={NAV_LINK_DISABLED_CLASS} aria-hidden="true">
            →
          </span>
        )}
      </div>
    </nav>
  );
}
