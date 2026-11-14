"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { BoxHeading, SectionHeading } from "@/components/detail-page-parts";
import { Notch, NotchRow } from "@/components/expansions/completion-mark";
import {
  useProfileActivityCompletions,
  useProfileChecklists,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import {
  activitiesTally,
  activityHistoryHashes,
  blockMarks,
  blockSetSource,
  checkDone,
  counterValue,
  setMarks,
  tierActivityHashes,
  type ActivityBlock,
  type ActivityCardBlock,
  type ActivityRow,
  type ActivitySetTableBlock,
  type ActivityTableBlock,
  type ActivityTiersBlock,
  type ActivityTilesBlock,
  type DestinationActivities,
  type ProgressSources,
} from "@/lib/destinations/activities";
import { useSignedIn } from "@/lib/use-signed-in";

/** Repeatable-activity card colours, matching each destination's This week cards. */
type CardTheme = { background: string; border: string; shadow: string; accent: string; glow: string; icon: ReactNode };

const CARD_THEMES: Record<string, CardTheme> = {
  // Paranormal Activity: Witness / Dread violet.
  "the-pale-heart": {
    background: "radial-gradient(circle at 85% 15%, rgba(160,128,230,.2), transparent 50%), linear-gradient(160deg, #130f1c, #0b0a10)",
    border: "rgba(160,128,230,.7)",
    shadow: "0 0 16px rgba(160,128,230,.2)",
    accent: "#c8b4f5",
    glow: "0 0 12px rgba(160,128,230,.6)",
    icon: (
      <>
        <path d="M22 6l7 10-7 22-7-22z" fill="none" stroke="#c8b4f5" strokeWidth="1.2" />
        <circle cx="22" cy="17" r="3" fill="#a080e6" />
      </>
    ),
  },
  neomuna: {
    background:
      "linear-gradient(rgba(61,240,255,.07) 1px, transparent 1px) 0 0/100% 14px, linear-gradient(90deg, rgba(255,61,242,.06) 1px, transparent 1px) 0 0/14px 100%, linear-gradient(135deg, #0b0620, #071422)",
    border: "#ff3df2",
    shadow: "0 0 14px rgba(255,61,242,.3), inset 0 0 18px rgba(61,240,255,.12)",
    accent: "#ff7bf5",
    glow: "0 0 10px #3df0ff",
    icon: (
      <>
        <rect x="8" y="8" width="28" height="28" fill="none" stroke="#ff7bf5" strokeWidth="1.3" />
        <path d="M14 22h16M22 14v16" stroke="#3df0ff" strokeWidth="1.3" />
      </>
    ),
  },
  "throne-world": {
    background: "radial-gradient(circle at 85% 15%, rgba(184,224,74,.14), transparent 50%), linear-gradient(160deg, #121a10, #0b0f0a)",
    border: "#b8e04a",
    shadow: "0 0 14px rgba(184,224,74,.22)",
    accent: "#b8e04a",
    glow: "0 0 12px rgba(184,224,74,.55)",
    icon: (
      <>
        <path d="M22 6c8 6 12 12 12 18a12 12 0 0 1-24 0c0-6 4-12 12-18z" fill="none" stroke="#b8e04a" strokeWidth="1.3" />
        <circle cx="22" cy="26" r="4" fill="#b8e04a" />
      </>
    ),
  },
  europa: {
    background: "radial-gradient(circle at 85% 15%, rgba(143,196,255,.16), transparent 50%), linear-gradient(160deg, #0e1622, #0a0f17)",
    border: "rgba(210,230,255,.85)",
    shadow: "inset 0 0 18px rgba(143,196,255,.22)",
    accent: "#8fc4ff",
    glow: "0 0 12px rgba(143,196,255,.7)",
    icon: (
      <>
        <path d="M22 4v36M6 13l32 18M6 31l32-18" stroke="#8fc4ff" strokeWidth="1.3" />
        <circle cx="22" cy="22" r="4" fill="none" stroke="#d2e6ff" strokeWidth="1.3" />
      </>
    ),
  },
  "the-moon": {
    background: "radial-gradient(circle at 85% 15%, rgba(200,16,46,.22), transparent 50%), linear-gradient(160deg, #170a0c, #0d0507)",
    border: "rgba(255,59,59,.85)",
    shadow: "0 0 16px rgba(200,16,46,.3)",
    accent: "#ff6a5f",
    glow: "0 0 12px rgba(255,40,40,.7)",
    icon: (
      <>
        <path d="M22 5l15 26H7z" fill="none" stroke="#ff3b3b" strokeWidth="1.3" />
        <circle cx="22" cy="23" r="4" fill="#ff3b3b" />
      </>
    ),
  },
  // The Sieve: Kepler's pale turquoise highlights.
  kepler: {
    background: "radial-gradient(circle at 85% 15%, rgba(143,227,214,.2), transparent 50%), linear-gradient(160deg, #0c1716, #080d0e)",
    border: "rgba(143,227,214,.7)",
    shadow: "0 0 16px rgba(143,227,214,.18)",
    accent: "#8fe3d6",
    glow: "0 0 12px rgba(143,227,214,.5)",
    icon: (
      <>
        <circle cx="22" cy="22" r="16" fill="none" stroke="#8fe3d6" strokeWidth="1.2" />
        <path d="M10 22h24M22 10v24M13 13l18 18M31 13L13 31" stroke="#8fe3d6" strokeWidth=".7" opacity=".7" />
        <circle cx="22" cy="22" r="3.5" fill="#8fe3d6" />
      </>
    ),
  },
  "dreaming-city": {
    background: "radial-gradient(circle at 85% 15%, rgba(190,235,255,.16), transparent 50%), linear-gradient(160deg, #0f1420, #0a0d14)",
    border: "rgba(200,240,255,.6)",
    shadow: "inset 0 0 18px rgba(190,235,255,.18)",
    accent: "#bfeaff",
    glow: "0 0 12px rgba(190,235,255,.7)",
    icon: (
      <>
        <circle cx="22" cy="22" r="16" fill="none" stroke="#bfeaff" strokeWidth="1.3" />
        <circle cx="22" cy="22" r="8" fill="none" stroke="#bfeaff" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="22" cy="22" r="3" fill="#e6f7ff" />
      </>
    ),
  },
};

function useProgressSources(activities: DestinationActivities): ProgressSources & { completions: Record<string, number> } {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const checklists = useProfileChecklists(signedIn);
  const historyHashes = useMemo(() => activityHistoryHashes(activities), [activities]);
  const completions = useProfileActivityCompletions(historyHashes);
  return { signedIn, instances, checklists, completions };
}

/** Done / total over every mark in the section (for the stat block and heading). */
export function useActivitiesTally(activities: DestinationActivities | null) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const checklists = useProfileChecklists(Boolean(activities) && signedIn);
  return useMemo(
    () => (activities ? activitiesTally(activities, { signedIn, instances, checklists }) : null),
    [activities, signedIn, instances, checklists],
  );
}

function countNote(marks: (boolean | null)[]) {
  const signedIn = marks.some((mark) => mark !== null);
  const done = marks.filter((mark) => mark === true).length;
  if (!signedIn) return String(marks.length);
  return <span className={done === marks.length ? "text-owned" : undefined}>{`${done} / ${marks.length}`}</span>;
}

function Panel({ title, note, grow, children }: { title: string; note?: ReactNode; grow?: boolean; children: ReactNode }) {
  return (
    <div className={`ui-panel space-y-3 p-3 sm:p-4 ${grow ? "flex-1" : ""}`}>
      <BoxHeading title={title} note={note} />
      {children}
    </div>
  );
}

function TableBlock({ block, sources, grow }: { block: ActivityTableBlock; sources: ProgressSources; grow?: boolean }) {
  const marks = blockMarks(block, sources);
  const gridStyle = { gridTemplateColumns: `minmax(0,1fr) repeat(${block.columns.length}, var(--col))` };
  return (
    <Panel title={block.title} note={countNote(marks)} grow={grow}>
      <div className="grid items-center [--col:3.4rem] sm:[--col:4.75rem]" style={gridStyle}>
        <span />
        {block.columns.map((column) => (
          <span key={column} className="pb-1.5 text-center text-[10px] leading-tight font-medium uppercase tracking-[0.12em] text-zinc-500 sm:text-[11px]">
            {column}
          </span>
        ))}
        {block.rows.map((row) => (
          <div key={row.name} className="contents">
            <span className="min-w-0 border-t border-white/[0.07] py-2.5 pr-2 text-sm text-zinc-100">
              {row.name}
              {row.sub ? <span className="block text-xs text-zinc-500">{row.sub}</span> : null}
            </span>
            {row.cells.map((cell, index) => (
              <span key={index} className="flex h-full items-center justify-center border-t border-white/[0.07]">
                {cell ? (
                  <span role="img" aria-label={`${row.name} · ${block.columns[index]}: ${statusText(checkDone(cell, sources))}`}>
                    <Notch complete={checkDone(cell, sources)} />
                  </span>
                ) : (
                  <span className="text-sm text-zinc-600" aria-label={`${block.columns[index]}: not available`}>—</span>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function statusText(done: boolean | null) {
  return done === null ? "not tracked" : done ? "complete" : "incomplete";
}

function TilesBlock({ block, sources }: { block: ActivityTilesBlock; sources: ProgressSources }) {
  const marks = blockMarks(block, sources);
  const columns = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" }[block.columns] ?? "lg:grid-cols-4";
  return (
    <Panel title={block.title} note={countNote(marks)}>
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${columns}`}>
        {block.tiles.map((tile) => {
          const tileMarks = tile.rows
            ? tile.rows.map((row) => checkDone(row.check, sources))
            : tile.set
              ? setMarks(tile.set, sources)
              : [];
          const complete = tileMarks.length > 0 && tileMarks.every((mark) => mark === true);
          return (
            <div
              key={tile.name}
              className={`border p-3 ${complete ? "border-owned/60 shadow-[inset_0_0_18px_rgba(201,162,39,0.06)]" : "border-white/[0.12]"}`}
            >
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="ui-label text-zinc-300!">{tile.name}</span>
                <span className="ui-label shrink-0">{countNote(tileMarks)}</span>
              </div>
              {tile.rows ? (
                <ul>
                  {tile.rows.map((row, index) => (
                    <li key={row.name} className="flex items-center justify-between gap-3 border-t border-white/[0.07] py-2 text-sm text-zinc-100">
                      <span className={tileMarks[index] === false ? "text-zinc-400" : undefined}>
                        {row.name}
                        {row.sub ? <span className="block text-xs text-zinc-500">{row.sub}</span> : null}
                      </span>
                      <span role="img" aria-label={`${row.name}: ${statusText(tileMarks[index])}`}>
                        <Notch complete={tileMarks[index]} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <NotchRow marks={tileMarks} label={tile.name} />
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function CardBlock({
  block,
  slug,
  sources,
  completions,
  grow,
}: {
  block: ActivityCardBlock;
  slug: string;
  sources: ProgressSources;
  completions: Record<string, number>;
  grow?: boolean;
}) {
  const theme = CARD_THEMES[slug] ?? CARD_THEMES["the-pale-heart"];
  const count = !sources.signedIn
    ? null
    : block.counter
      ? counterValue(block.counter, sources)
      : (block.activityHashes ?? []).reduce((sum, hash) => sum + (completions[hash] ?? 0), 0);
  return (
    <div
      className={`relative flex flex-col gap-1.5 overflow-hidden border px-[18px] py-4 ${grow ? "flex-1" : ""}`}
      style={{ background: theme.background, borderColor: theme.border, boxShadow: theme.shadow }}
    >
      <span
        className="absolute top-3 right-3 border px-[7px] py-[3px] font-display text-[10.5px] uppercase tracking-[0.16em]"
        style={{ color: theme.accent, borderColor: theme.border }}
      >
        Repeatable
      </span>
      <svg width="32" height="32" viewBox="0 0 44 44" aria-hidden>
        {theme.icon}
      </svg>
      <span className="font-display text-[11px] uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
        {block.title}
      </span>
      {count !== null ? (
        <span className="font-display text-[26px] leading-none font-semibold uppercase tracking-[0.04em] text-white" style={{ textShadow: theme.glow }}>
          Completed {count.toLocaleString("en-US")}×
        </span>
      ) : null}
      {block.description ? <span className="text-[13px] text-[#c7cad0]">{block.description}</span> : null}
      {block.rows?.length ? (
        <div className="relative mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center">
          <span />
          <span className="pb-1.5 text-right text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500 sm:text-[11px]">
            {block.rowsHeader ?? ""}
          </span>
          {block.rows.map((row) => {
            const done = checkDone(row.check, sources);
            return (
              <div key={row.name} className="contents">
                <span className="border-t border-white/[0.07] py-2.5 text-sm text-zinc-100">{row.name}</span>
                <span className="flex h-full items-center justify-end border-t border-white/[0.07]" role="img" aria-label={`${row.name}: ${statusText(done)}`}>
                  <Notch complete={done} />
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SetTableBlock({ block, sources, grow }: { block: ActivitySetTableBlock; sources: ProgressSources; grow?: boolean }) {
  const marks = blockMarks(block, sources);
  const gridStyle = { gridTemplateColumns: `minmax(0,1fr) repeat(${block.columns.length}, var(--setcol))` };
  const setColStyle = { "--setcol-lg": block.columnWidth ?? "9rem" } as CSSProperties;
  return (
    <Panel title={block.title} note={countNote(marks)} grow={grow}>
      <div className="overflow-x-auto" style={setColStyle}>
        <div className="grid min-w-[22rem] items-center gap-x-4 [--setcol:minmax(7rem,auto)] sm:[--setcol:var(--setcol-lg)]" style={gridStyle}>
          <span />
          {block.columns.map((column) => (
            <span key={column} className="pb-1.5 text-[10px] leading-tight font-medium uppercase tracking-[0.12em] text-zinc-500 sm:text-[11px]">
              {column}
            </span>
          ))}
          {block.groups.map((group, groupIndex) => (
            <div key={group.name ?? groupIndex} className="contents">
              {group.name ? (
                <span className="col-span-full pt-3.5 pb-1.5 font-display text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                  {group.name}
                </span>
              ) : null}
              {group.rows.map((row) => (
                <div key={row.name} className="contents">
                  <span className="min-w-0 border-t border-white/[0.07] py-2.5 pr-2 text-sm text-zinc-100">{row.name}</span>
                  {row.cells.map((cell, index) => {
                    if (!cell) {
                      return (
                        <span key={index} className="flex h-full items-center border-t border-white/[0.07] text-sm text-zinc-600" aria-label={`${block.columns[index]}: not available`}>
                          —
                        </span>
                      );
                    }
                    const cellMarks = setMarks(cell, sources);
                    return (
                      <span key={index} className="flex h-full items-center justify-between gap-3 border-t border-white/[0.07] py-2">
                        <NotchRow marks={cellMarks} label={`${row.name} · ${block.columns[index]}`} />
                        <span className="ui-label shrink-0">{countNote(cellMarks)}</span>
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

type PlayStats = Record<string, { seconds: number; kills: number }>;

function playedText(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

/** World Tier ladder: informative only (patrols never complete), with time played and kills. */
function TiersBlock({ block, signedIn, stats, grow }: { block: ActivityTiersBlock; signedIn: boolean; stats: PlayStats | null; grow?: boolean }) {
  return (
    <Panel title={block.title} grow={grow}>
      <div className="grid auto-rows-fr grid-cols-2 gap-2.5">
        {block.tiers.map((tier) => {
          const totals = tier.activityHashes.reduce(
            (sum, hash) => ({ seconds: sum.seconds + (stats?.[hash]?.seconds ?? 0), kills: sum.kills + (stats?.[hash]?.kills ?? 0) }),
            { seconds: 0, kills: 0 },
          );
          return (
            <div key={tier.name} className="flex flex-col gap-1 border border-white/[0.14] px-3 py-2.5">
              <span className="ui-label">{tier.label}</span>
              <span className="font-display text-[15px] font-semibold uppercase tracking-[0.06em] text-bone">{tier.name}</span>
              {signedIn && stats ? (
                totals.seconds > 0 ? (
                  <span className="mt-1 flex flex-wrap gap-x-3.5 text-xs text-zinc-500">
                    <span><span className="text-zinc-300">{playedText(totals.seconds)}</span> played</span>
                    <span><span className="text-zinc-300">{totals.kills.toLocaleString("en-US")}</span> kills</span>
                  </span>
                ) : (
                  <span className="mt-1 text-xs text-zinc-500">—</span>
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function usePlayStats(activities: DestinationActivities, signedIn: boolean): PlayStats | null {
  const hashes = useMemo(() => tierActivityHashes(activities), [activities]);
  const [stats, setStats] = useState<PlayStats | null>(null);
  useEffect(() => {
    if (!signedIn || !hashes.length) return;
    let cancelled = false;
    fetch(`/api/profile/activity-play-stats?hashes=${hashes.join(",")}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { stats?: PlayStats } | null) => {
        if (!cancelled && payload?.stats) setStats(payload.stats);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [hashes, signedIn]);
  return stats;
}

function Block({
  block,
  slug,
  sources,
  completions,
  playStats,
  grow,
}: {
  block: ActivityBlock;
  slug: string;
  sources: ProgressSources;
  completions: Record<string, number>;
  playStats: PlayStats | null;
  grow?: boolean;
}) {
  switch (block.type) {
    case "setTable":
      return <SetTableBlock block={block} sources={sources} grow={grow} />;
    case "tiers":
      return <TiersBlock block={block} signedIn={sources.signedIn} stats={playStats} grow={grow} />;
    case "table":
      return <TableBlock block={block} sources={sources} grow={grow} />;
    case "set": {
      const marks = setMarks(blockSetSource(block), sources);
      return (
        <Panel title={block.title} note={countNote(marks)} grow={grow}>
          <NotchRow marks={marks} label={block.title} />
        </Panel>
      );
    }
    case "tiles":
      return <TilesBlock block={block} sources={sources} />;
    case "card":
      return <CardBlock block={block} slug={slug} sources={sources} completions={completions} grow={grow} />;
  }
}

function Rows({
  rows,
  slug,
  sources,
  completions,
  playStats,
}: {
  rows: ActivityRow[];
  slug: string;
  sources: ProgressSources;
  completions: Record<string, number>;
  playStats: PlayStats | null;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`grid gap-3 ${{ 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3" }[row.length] ?? ""}`}>
          {row.map((column, columnIndex) => (
            <div key={columnIndex} className="flex min-w-0 flex-col gap-3">
              {column.map((block, blockIndex) => (
                <Block
                  key={`${block.type}-${block.title}`}
                  block={block}
                  slug={slug}
                  sources={sources}
                  completions={completions}
                  playStats={playStats}
                  // The last block of a stacked column stretches so paired columns end level.
                  grow={blockIndex === column.length - 1}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 mb-3 flex items-center gap-3 first:mt-0">
      <span className="ui-label">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-white/[0.14]" />
    </div>
  );
}

/** Destination page · Activities: Combat and Exploration blocks with completion notches. */
export function DestinationActivitiesSection({ slug, activities }: { slug: string; activities: DestinationActivities }) {
  const { completions, ...sources } = useProgressSources(activities);
  const tally = activitiesTally(activities, sources);
  const playStats = usePlayStats(activities, sources.signedIn);
  return (
    <section id="activities" className="scroll-mt-20">
      <SectionHeading
        title="Activities"
        note={sources.signedIn ? `${tally.done} / ${tally.total}` : `${tally.total}`}
      />
      {activities.combat.length ? (
        <>
          <GroupLabel>Combat</GroupLabel>
          <Rows rows={activities.combat} slug={slug} sources={sources} completions={completions} playStats={playStats} />
        </>
      ) : null}
      {activities.exploration.length ? (
        <>
          <GroupLabel>Exploration</GroupLabel>
          <Rows rows={activities.exploration} slug={slug} sources={sources} completions={completions} playStats={playStats} />
        </>
      ) : null}
    </section>
  );
}
