"use client";

import Link from "@/components/app-link";
import { ProgressBar } from "@/components/home/progress-bar";
import {
  DESTINY_1_TIMELINE,
  formatTimelineMonth,
  HOME_TIMELINE,
  type TimelineEntry,
} from "@/lib/home/timeline";
import type {
  ExpansionOverallProgress,
  ExpansionProgressInputs,
} from "@/lib/expansions/expansion-progress";
import { useExpansionProfileProgress } from "@/lib/expansions/use-expansion-profile-progress";
import type { SeasonProgressInputs } from "@/lib/seasons/season-progress";
import { useSeasonProfileProgress } from "@/lib/seasons/use-season-profile-progress";

const HATCH =
  "bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_14px)]";

/** One line of the timeline: expansion on the left, season on the right. */
type TimelineRow = { left?: TimelineEntry; right?: TimelineEntry };

/** Newest first; an expansion and a season released the same month share a row. */
function buildRows(entries: readonly TimelineEntry[]): TimelineRow[] {
  const rows: TimelineRow[] = [];
  for (const entry of [...entries].reverse()) {
    const side = entry.kind === "expansion" ? "left" : "right";
    const previous = rows.at(-1);
    const other = previous?.[side === "left" ? "right" : "left"];
    if (previous && !previous[side] && other?.date === entry.date) {
      previous[side] = entry;
    } else {
      rows.push({ [side]: entry });
    }
  }
  return rows;
}

const YEARS = [...HOME_TIMELINE].reverse().map((year) => ({
  ...year,
  id: year.label.toLowerCase().replace(/\s+/g, "-"),
  rows: buildRows(year.entries),
}));
const LATEST_SLUG = YEARS[0]?.rows[0]?.left?.slug ?? YEARS[0]?.rows[0]?.right?.slug;

const CHIP_CLASS =
  "inline-flex h-10 items-center border border-white/[0.22] px-3.5 font-display text-sm uppercase tracking-[0.12em] text-bone/80 transition hover:border-bone hover:text-white";

export function TimelineEntryCard({
  entry,
  progress,
  compact = false,
  showLatest = true,
}: {
  entry: TimelineEntry;
  progress: ExpansionOverallProgress | undefined;
  /** Short card for side columns (expansion page overview). */
  compact?: boolean;
  showLatest?: boolean;
}) {
  const isExpansion = entry.kind === "expansion" && !compact;
  const percent = entry.href ? progress?.percent : null;
  const className = `group relative flex flex-col justify-end overflow-hidden border border-white/[0.18] bg-panel ${HATCH} ${
    isExpansion
      ? "h-[150px] px-[18px] py-4"
      : compact
        ? "min-h-[72px] flex-1 px-3.5 py-2"
        : "h-[108px] px-3.5 py-3"
  } ${entry.href ? "transition hover:border-bone" : "opacity-70"}`;

  const body = (
    <>
      {entry.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : null}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 via-60% to-transparent"
      />
      {showLatest && entry.slug === LATEST_SLUG ? (
        <span className="absolute left-3 top-2.5 bg-bone px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.16em] text-void">
          Latest
        </span>
      ) : null}
      <span className={`relative flex flex-col ${compact ? "gap-0.5" : "gap-1.5"}`}>
        <span className={`ui-label text-on-art text-bone/80! ${compact ? "text-[11px]!" : ""}`}>
          {entry.tag} · {formatTimelineMonth(entry.date)}
        </span>
        <span
          className={`text-on-art font-display font-semibold uppercase leading-[1.05] tracking-[0.06em] text-bone ${
            isExpansion ? "text-[26px]" : compact ? "text-base" : "text-[19px]"
          }`}
        >
          {entry.fullTitle}
        </span>
        {!entry.href ? (
          <span className="text-on-art text-[13px] text-ash">Hub coming soon</span>
        ) : percent != null ? (
          <span className={`flex items-center gap-2.5 ${compact ? "mt-1.5" : ""}`}>
            <ProgressBar owned={percent} total={100} className="flex-1" />
            <span className="text-[13px] tabular-nums text-owned">{percent}%</span>
          </span>
        ) : null}
      </span>
    </>
  );

  return entry.href ? (
    <Link href={entry.href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Row grid: line at the left on phones, centred from md up. */
const ROW_CLASS =
  "grid grid-cols-[28px_minmax(0,1fr)] gap-y-3 md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] md:items-center md:gap-y-0";
const LEFT_CELL = "col-start-2 md:col-start-1 md:row-start-1";
const MID_CELL =
  "relative col-start-1 row-start-1 flex items-center justify-center md:col-start-2 md:row-span-1 md:h-full";
const RIGHT_CELL = "col-start-2 md:col-start-3 md:row-start-1";

function Connectors({ left, right, dashed = false }: { left: boolean; right: boolean; dashed?: boolean }) {
  const line = dashed ? "border-t border-dashed border-white/20" : "h-px bg-white/[0.22]";
  return (
    <>
      {left ? (
        <span aria-hidden className={`absolute left-0 right-1/2 top-1/2 hidden md:block ${line}`} />
      ) : null}
      <span
        aria-hidden
        className={`absolute left-1/2 right-0 top-1/2 ${right ? "" : "md:hidden"} ${line}`}
      />
    </>
  );
}

function YearMarker({ id, label, span, dashed = false }: { id: string; label: string; span: string; dashed?: boolean }) {
  return (
    <div
      id={id}
      className="relative flex scroll-mt-20 justify-start pb-3 pt-6 md:justify-center"
    >
      <span
        className={`relative bg-void px-4 py-2 font-display text-lg font-semibold uppercase tracking-[0.14em] ${
          dashed ? "border border-dashed border-white/35 text-bone/80" : "border border-white/35 text-bone"
        }`}
      >
        {label}
        <span className="ml-2.5 text-ash">{span}</span>
      </span>
    </div>
  );
}

type SeasonsTimelineProps = {
  progressInputs: ExpansionProgressInputs[];
  seasonProgressInputs: SeasonProgressInputs[];
};

/** Expansions & Seasons as one vertical timeline, newest at the top. */
export function SeasonsTimeline({ progressInputs, seasonProgressInputs }: SeasonsTimelineProps) {
  const expansionProgress = useExpansionProfileProgress(progressInputs);
  const seasonProgress = useSeasonProfileProgress(seasonProgressInputs);
  const progressFor = (entry: TimelineEntry) =>
    entry.kind === "expansion"
      ? expansionProgress.get(entry.slug)
      : seasonProgress.get(entry.slug);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Jump to year" className="flex flex-wrap gap-2">
          {YEARS.map((year) => (
            <a key={year.id} href={`#${year.id}`} className={CHIP_CLASS}>
              {year.label}
            </a>
          ))}
          <a href="#destiny" className={`${CHIP_CLASS} border-dashed text-ash`}>
            Destiny
          </a>
        </nav>
        <div className="flex items-center gap-[18px]">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="size-[11px] rotate-45 border-2 border-bone" />
            <span className="ui-label">Expansions</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="size-[9px] bg-ash" />
            <span className="ui-label">Seasons &amp; episodes</span>
          </span>
        </div>
      </div>

      <div className="hidden pt-2 md:grid md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]">
        <span className="ui-label text-right">Expansions</span>
        <span />
        <span className="ui-label">Seasons</span>
      </div>

      <div className="relative flex flex-col gap-3.5">
        <span
          aria-hidden
          className="absolute bottom-0 left-[14px] top-0 w-px bg-white/[0.22] md:left-1/2"
        />
        {/* Neither an expansion nor a season: sits on the line itself. */}
        <div className="relative pl-7 md:flex md:justify-center md:pl-0">
          <Link
            href="/activities/monument-of-triumph"
            className="group relative flex h-[150px] w-full flex-col justify-end overflow-hidden border border-white/[0.18] bg-panel px-[18px] py-4 transition hover:border-bone md:w-[480px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/banners/monument-of-triumph.webp"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 via-60% to-transparent"
            />
            <span className="relative flex flex-col gap-1.5">
              <span className="ui-label text-on-art text-bone/80!">Now · Update</span>
              <span className="text-on-art font-display text-[26px] font-semibold uppercase leading-[1.05] tracking-[0.06em] text-bone">
                Monument of Triumph
              </span>
            </span>
          </Link>
        </div>

        {YEARS.map((year) => (
          <div key={year.id} className="contents">
            <YearMarker id={year.id} label={year.label} span={year.span} />
            {year.rows.map((row) => (
              <div key={(row.left ?? row.right)!.slug} className={ROW_CLASS}>
                {row.left ? (
                  <div className={LEFT_CELL}>
                    <TimelineEntryCard entry={row.left} progress={progressFor(row.left)} />
                  </div>
                ) : (
                  <span aria-hidden className="hidden md:col-start-1 md:row-start-1 md:block" />
                )}
                <div className={`${MID_CELL} ${row.left && row.right ? "row-span-2" : ""}`}>
                  <Connectors left={Boolean(row.left)} right={Boolean(row.right)} />
                  {row.left ? (
                    <span aria-hidden className="relative size-3.5 rotate-45 border-2 border-bone bg-void" />
                  ) : (
                    <span aria-hidden className="relative size-[9px] bg-ash" />
                  )}
                </div>
                {row.right ? (
                  <div className={RIGHT_CELL}>
                    <TimelineEntryCard entry={row.right} progress={progressFor(row.right)} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}

        <YearMarker id="destiny" label="Destiny" span="2014–17" dashed />
        {DESTINY_1_TIMELINE.map((entry) => (
          <div key={entry.title} className={ROW_CLASS}>
            <div className={LEFT_CELL}>
              <div className="flex h-[150px] flex-col justify-end gap-1.5 border border-dashed border-white/20 px-[18px] py-4">
                <span className="ui-label">
                  {entry.tag} · {formatTimelineMonth(entry.date)}
                </span>
                <span className="font-display text-[26px] font-semibold uppercase leading-[1.05] tracking-[0.06em] text-ash">
                  {entry.title}
                </span>
              </div>
            </div>
            <div className={MID_CELL}>
              <Connectors left right={false} dashed />
              <span aria-hidden className="relative size-3 rotate-45 border border-dashed border-ash bg-void" />
            </div>
          </div>
        ))}

        <div className="flex justify-start pt-2.5 md:justify-center">
          <span className="ui-label relative bg-void px-2.5 py-1">Destiny launch · Sep 2014</span>
        </div>
      </div>
    </div>
  );
}
