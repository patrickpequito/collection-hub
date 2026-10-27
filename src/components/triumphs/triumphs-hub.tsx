"use client";

import Link from "@/components/app-link";
import { useMemo, useState } from "react";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import { LegacySealCard, SealCard } from "@/components/triumphs/seal-card";
import { SEAL_CATEGORIES, TRIUMPH_GROUP_BANDS } from "@/data/triumphs/seal-categories";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { SealSummary, TriumphGroupSummary } from "@/lib/triumphs/hub";
import { isRecordRedeemed } from "@/lib/triumphs/record-progress";
import { groupProgress, sealProgress } from "@/lib/triumphs/seal-progress";
import { useSignedIn } from "@/lib/use-signed-in";
import { usePinnedTitles } from "@/lib/use-pinned-titles";
import { useTriumphScores } from "@/lib/use-triumph-scores";
import { PinIcon } from "@/components/pin-icon";
import type { TriumphProgress } from "@/types/triumph";

type SealFilter = "all" | "progress" | "completed" | "gild";

const FILTERS: { id: SealFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "gild", label: "Can gild" },
];

function NavRow({
  href,
  iconPath,
  name,
  progress,
  selected = false,
  primary = false,
}: {
  href: string;
  iconPath: string;
  name: string;
  progress: TriumphProgress | null;
  selected?: boolean;
  primary?: boolean;
}) {
  const complete = progress !== null && progress.total > 0 && progress.completed === progress.total;
  const percent = progress && progress.total ? (progress.completed / progress.total) * 100 : 0;
  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      className={`grid items-center gap-2.5 px-4 py-2 transition ${
        primary ? "grid-cols-[30px_minmax(0,1fr)_auto]" : "grid-cols-[24px_minmax(0,1fr)_auto]"
      } ${selected ? "bg-white/[0.07] shadow-[inset_3px_0_0_0_#e9e7e2]" : "hover:bg-white/[0.04]"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bungieIconUrl(iconPath)}
        alt=""
        width={primary ? 30 : 24}
        height={primary ? 30 : 24}
        className={`${primary ? "size-[30px]" : "size-6"} object-contain`}
      />
      <span className="min-w-0">
        <span
          className={`block truncate ${
            primary
              ? "font-display text-[15px] font-semibold uppercase tracking-[0.1em] text-bone"
              : `text-sm ${selected ? "text-white" : "text-bone/90"}`
          }`}
        >
          {name}
        </span>
        {progress ? (
          <span className="mt-1 block h-0.5 bg-white/10">
            <span
              className={`block h-full ${complete ? "bg-owned" : "bg-ash"}`}
              style={{ width: `${percent}%` }}
            />
          </span>
        ) : null}
      </span>
      {progress ? (
        <span className={`text-xs tabular-nums ${complete ? "text-owned" : "text-ash"}`}>
          {progress.completed}/{progress.total}
        </span>
      ) : null}
    </Link>
  );
}

/** Left column: Seals plus every triumph category, always in reach (like in game). */
function TriumphsNav({
  seals,
  groups,
  sealTotals,
}: {
  seals: SealSummary[];
  groups: TriumphGroupSummary[];
  sealTotals: TriumphProgress | null;
}) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  return (
    <nav aria-label="Triumph categories" className="ui-panel py-1.5">
      <NavRow
        href="/triumphs"
        iconPath={seals[0]?.iconPath ?? ""}
        name="Seals"
        progress={sealTotals}
        selected
        primary
      />
      {TRIUMPH_GROUP_BANDS.map((band) => {
        const bandGroups = groups.filter((group) => group.band === band);
        if (!bandGroups.length) return null;
        return (
          <div key={band} className="mt-1.5 border-t border-white/[0.08] pt-1">
            <p className="ui-label px-4 pb-1 pt-2.5 text-[11px]!">{band}</p>
            {bandGroups.map((group) => (
              <NavRow
                key={group.slug}
                href={`/triumphs/group/${group.slug}`}
                iconPath={group.iconPath}
                name={group.name}
                progress={signedIn ? groupProgress(group.recordHashes, instances) : null}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

/** Phones: every triumph category as an always-open list (Seals are the section below). */
function MobileCategoryList({ groups }: { groups: TriumphGroupSummary[] }) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  return (
    <div className="space-y-1.5 lg:hidden">
      <p className="ui-label text-[10px]!">Triumph categories</p>
      <nav aria-label="Triumph categories" className="ui-panel divide-y divide-white/[0.07]">
        {TRIUMPH_GROUP_BANDS.flatMap((band) => groups.filter((group) => group.band === band)).map((group) => {
          const progress = signedIn ? groupProgress(group.recordHashes, instances) : null;
          const percent = progress && progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
          const complete = progress !== null && progress.total > 0 && progress.completed === progress.total;
          return (
            <Link
              key={group.slug}
              href={`/triumphs/group/${group.slug}`}
              className="flex items-center gap-2.5 px-3 py-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bungieIconUrl(group.iconPath)} alt="" width={24} height={24} className="size-6 shrink-0 object-contain" />
              <span className="min-w-0 flex-1 truncate text-[13.5px] text-bone">{group.name}</span>
              {progress ? (
                <>
                  <span className="block h-[3px] w-16 shrink-0 bg-white/10">
                    <span className={`block h-full ${complete ? "bg-owned" : "bg-bone"}`} style={{ width: `${percent}%` }} />
                  </span>
                  <span className={`w-9 shrink-0 text-right text-[11.5px] tabular-nums ${complete ? "text-owned" : "text-ash"}`}>
                    {percent}%
                  </span>
                </>
              ) : null}
              <span aria-hidden className="text-[11px] text-ash">
                ▸
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function TriumphsHub({
  seals,
  legacySeals,
  groups,
}: {
  seals: SealSummary[];
  legacySeals: SealSummary[];
  groups: TriumphGroupSummary[];
}) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const scores = useTriumphScores();
  const [filter, setFilter] = useState<SealFilter>("all");
  const { pins, isPinned } = usePinnedTitles();
  const pinnedSeals = pins
    .map((slug) => seals.find((seal) => seal.slug === slug))
    .filter((seal): seal is SealSummary => Boolean(seal));

  const progressBySlug = useMemo(
    () => (signedIn ? new Map(seals.map((seal) => [seal.slug, sealProgress(seal, instances)])) : null),
    [instances, seals, signedIn],
  );
  const earnedTitles = progressBySlug ? [...progressBySlug.values()].filter((p) => p.tier !== "none").length : null;
  const gildedNow = progressBySlug ? [...progressBySlug.values()].filter((p) => p.tier === "gilded").length : null;
  const gildsTotal = progressBySlug ? [...progressBySlug.values()].reduce((sum, p) => sum + p.gildCount, 0) : 0;
  const sealTotals = earnedTitles !== null ? { completed: earnedTitles, total: seals.length } : null;

  const matches = (seal: SealSummary) => {
    if (filter === "all") return true;
    const progress = progressBySlug?.get(seal.slug);
    // Signed out: only "Can gild" narrows the list (no progress to filter on).
    if (!progress) return filter !== "gild" || seal.gildingHashes.length > 0;
    if (filter === "progress") return progress.tier === "none";
    if (filter === "completed") return progress.tier !== "none";
    return progress.gildable && progress.tier === "base";
  };

  const legacyEarned = (seal: SealSummary) =>
    signedIn && seal.completionRecordHash
      ? isRecordRedeemed(instances[seal.completionRecordHash]?.state)
      : null;

  return (
    <div className="space-y-5">
      <StatBlockGrid count={4}>
        <StatBlock label="Active triumph score">
          <span className={`font-display text-[22px] leading-none sm:text-[30px] ${scores ? "text-owned" : "text-bone"}`}>
            {scores ? scores.activeScore.toLocaleString("en-US") : "—"}
          </span>
        </StatBlock>
        <StatBlock label="Lifetime score">
          <span className="font-display text-[22px] leading-none sm:text-[30px] text-bone">
            {scores ? scores.lifetimeScore.toLocaleString("en-US") : "—"}
          </span>
        </StatBlock>
        <StatBlock label="Titles">
          <StatCount owned={earnedTitles} total={seals.length} />
        </StatBlock>
        <StatBlock label="Gilded this season">
          <span className="font-display text-[22px] leading-none sm:text-[30px] text-bone">
            {gildedNow ?? "—"}
            {progressBySlug ? <span className="ml-2 text-base text-ash">· {gildsTotal} gilds total</span> : null}
          </span>
        </StatBlock>
      </StatBlockGrid>

      {!signedIn ? <p className="text-[13px] text-owned">Sign in to see your seals and triumph progress.</p> : null}

      <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
        <div className="hidden lg:sticky lg:top-20 lg:block">
          <TriumphsNav seals={seals} groups={groups} sealTotals={sealTotals} />
        </div>
        <MobileCategoryList groups={groups} />

        <section className="min-w-0 space-y-3.5">
          <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
            <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Seals</h2>
            {earnedTitles !== null ? (
              <span className="ui-label">
                {earnedTitles} of {seals.length} titles · {gildedNow} gilded this season
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={filter === entry.id}
                  onClick={() => setFilter(entry.id)}
                  className={`inline-flex min-h-[38px] items-center border px-3.5 font-display text-sm uppercase tracking-[0.12em] transition ${
                    filter === entry.id
                      ? "border-bone bg-bone text-void"
                      : "border-white/[0.22] text-[#c7cad0] hover:border-bone/70"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-2 text-[13px] text-ash">
              <span className="size-[7px] rotate-45 border border-owned" aria-hidden />
              Gildable
            </span>
          </div>

          {pinnedSeals.length && filter === "all" ? (
            <div className="space-y-2 pt-1">
              <p className="ui-label flex items-center gap-1.5 text-xs! text-owned!">
                <PinIcon className="size-3" />
                Pinned · {pinnedSeals.length}
                <span className="ml-1 normal-case tracking-normal text-ash">— shown first on Home</span>
              </p>
              <div className="ui-panel grid grid-cols-3 gap-0.5 border-owned/40! p-1.5 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7">
                {pinnedSeals.map((seal) => (
                  <SealCard key={seal.slug} seal={seal} progress={progressBySlug?.get(seal.slug) ?? null} pinned />
                ))}
              </div>
            </div>
          ) : null}

          {SEAL_CATEGORIES.map((category) => {
            const inCategory = seals.filter((seal) => seal.category === category && matches(seal));
            if (!inCategory.length) return null;
            return (
              <div key={category} className="space-y-2 pt-1">
                <p className="ui-label text-xs!">
                  {category} · {inCategory.length}
                </p>
                <div className="ui-panel grid grid-cols-3 gap-0.5 p-1.5 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7">
                  {inCategory.map((seal) => (
                    <SealCard
                      key={seal.slug}
                      seal={seal}
                      progress={progressBySlug?.get(seal.slug) ?? null}
                      pinned={isPinned(seal.slug)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filter === "all" || filter === "completed" ? (
            <div className="space-y-2 pt-4">
              <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
                <h2 className="text-xl font-semibold uppercase tracking-[0.06em] text-bone">Legacy seals</h2>
                <span className="ui-label">{legacySeals.length} · no longer obtainable</span>
              </div>
              <div className="ui-panel grid grid-cols-4 gap-0.5 p-1.5 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
                {legacySeals
                  .filter((seal) => filter === "all" || legacyEarned(seal) !== false)
                  .map((seal) => (
                    <LegacySealCard key={seal.slug} seal={seal} earned={legacyEarned(seal)} />
                  ))}
              </div>
              <p className="text-xs text-ash">
                Legacy seals only show whether you earned them (white = earned, dim = not earned).
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
