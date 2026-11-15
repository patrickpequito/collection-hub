"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { ACTIVITY_LOOT_PANEL_CLASS, ActivityCurrentLootPanel } from "@/components/activity-current-loot-panel";
import { LootItemGrid } from "@/components/loot-section";
import { useOwnership } from "@/components/client-ownership";
import { BoxHeading, SectionHeading } from "@/components/detail-page-parts";
import { Notch, NotchRow } from "@/components/expansions/completion-mark";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import {
  PRAXIC_BLADE_GROUPS,
  RENEGADE_ABILITIES_MAXED_RECORD,
  RENEGADE_ABILITY_GROUPS,
  RENEGADES_FRONTIER_BANNERS,
  RENEGADES_FRONTIER_GOODS,
  RENEGADES_INVASION_PLANETS,
  RENEGADES_SECRETS,
  type FrontierBanner,
  type FrontierGoal,
  type RenegadeAbility,
  type RenegadeAbilityGroup,
} from "@/data/expansions/renegades-frontier";
import type { ClanRank } from "@/lib/renegades-progress";
import { useSignedIn } from "@/lib/use-signed-in";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";
import type { RecordInstance } from "@/types/triumph";

/**
 * Renegades page: Lawless Frontier (title objectives), Clans (Syndicate ranks and
 * Renegade Abilities) and Collectibles (exploration triumphs). Lasting goals only.
 */

const BUNGIE = "https://www.bungie.net";

/** Armor sets or weapons as their own section (same blocks as the destination loot). */
export function RenegadesLootPanel({
  heading,
  activitySlug,
  activityTitle,
  armorRows,
  weapons,
  previewFiles,
  itemHrefs,
}: {
  heading: string;
  activitySlug: string;
  activityTitle: string;
  armorRows: ActivityArmorRow[];
  weapons: LootItem[];
  previewFiles?: string[];
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <ActivityCurrentLootPanel
      heading={heading}
      activitySlug={activitySlug}
      activityTitle={activityTitle}
      armorRows={armorRows}
      weapons={weapons}
      previewFiles={previewFiles}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
      itemHrefs={itemHrefs}
    />
  );
}

type Instances = Record<string, RecordInstance>;

function objectiveProgress(instances: Instances, recordHash: string, objectiveHash?: string): number {
  const objectives = instances[recordHash]?.objectives ?? [];
  const objective = objectiveHash ? objectives.find((entry) => entry.objectiveHash === objectiveHash) : objectives[0];
  return objective?.progress ?? 0;
}

function objectiveDone(instances: Instances, recordHash: string, objectiveHash: string): boolean {
  return instances[recordHash]?.objectives.find((entry) => entry.objectiveHash === objectiveHash)?.complete ?? false;
}

function compact(value: number) {
  return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
}

function Bar({ value, total, color }: { value: number; total: number; color: string }) {
  return (
    <span className="block h-1 bg-white/[0.12]">
      <span className="block h-1" style={{ width: `${total ? Math.min(100, (value / total) * 100) : 0}%`, background: color }} />
    </span>
  );
}

function fade(rgb: string, alpha: number) {
  return `rgba(${rgb},${alpha})`;
}

function GoalTile({ goal, banner, signedIn, value }: { goal: FrontierGoal; banner: FrontierBanner; signedIn: boolean; value: number }) {
  const done = signedIn && value >= goal.total;
  const shown = Math.min(value, goal.total);
  const format = (count: number) => (goal.compact ? compact(count) : count.toLocaleString("en-US"));
  const words = goal.label.split(" ");
  const first = goal.breakAfter ? words.slice(0, goal.breakAfter).join(" ") : goal.label;
  const second = goal.breakAfter ? words.slice(goal.breakAfter).join(" ") : "";
  const labelClass = "font-display text-[13px] leading-tight font-semibold uppercase tracking-[0.04em] text-white";
  return (
    // Bottom-aligned so every bar sits on the same line, whatever the label height.
    <div
      className="flex flex-col justify-end gap-2 border-l-2 bg-void/60 px-3 py-2.5"
      style={{ borderColor: done ? banner.accent : fade(banner.accentRgb, 0.5) }}
    >
      {/* One-line labels share their row with the count; two-line labels put it on the second line. */}
      <div>
        {second ? <div className={labelClass}>{first}</div> : null}
        <div className="flex items-end justify-between gap-2.5">
          <span className={labelClass}>{second || first}</span>
          <span className={`ui-label shrink-0 whitespace-nowrap text-[11px]! leading-tight ${done ? "text-owned!" : "text-[#e9e7e2]!"}`}>
            {signedIn ? `${format(shown)} / ${format(goal.total)}` : format(goal.total)}
          </span>
        </div>
      </div>
      {signedIn ? <Bar value={shown} total={goal.total} color={done ? "var(--color-owned)" : banner.accent} /> : null}
    </div>
  );
}

function FrontierBannerCard({ banner, instances, signedIn }: { banner: FrontierBanner; instances: Instances; signedIn: boolean }) {
  return (
    <div
      className="relative flex flex-col gap-[18px] overflow-hidden border px-4 py-4 sm:px-[22px] sm:py-[18px]"
      style={{ borderColor: fade(banner.accentRgb, 0.7), boxShadow: `0 0 16px ${fade(banner.accentRgb, 0.2)}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={banner.imageUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(12,9,8,.92) 0%, rgba(12,9,8,.5) 55%, rgba(12,9,8,.75) 100%)" }}
      />
      <div className="relative min-w-0">
        <div className="font-display text-[11px] uppercase tracking-[0.18em]" style={{ color: banner.accent }}>
          {banner.eyebrow}
        </div>
        <div
          className="mt-1 font-display text-[30px] leading-none font-semibold uppercase tracking-[0.04em] text-white sm:text-[38px]"
          style={{ textShadow: `0 0 12px ${fade(banner.accentRgb, 0.5)}` }}
        >
          {banner.title}
        </div>
        <div className="mt-2 text-[13px] text-[#c7cad0]">{banner.subtitle}</div>
      </div>
      <div className="relative grid grid-cols-2 gap-2 lg:grid-cols-4">
        {banner.goals.map((goal) => (
          <GoalTile
            key={goal.label}
            goal={goal}
            banner={banner}
            signedIn={signedIn}
            value={objectiveProgress(instances, goal.recordHash, goal.objectiveHash)}
          />
        ))}
      </div>
    </div>
  );
}

export function RenegadesLawlessFrontier() {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Lawless Frontier" />
      {RENEGADES_FRONTIER_BANNERS.map((banner) => (
        <FrontierBannerCard key={banner.id} banner={banner} instances={instances} signedIn={signedIn} />
      ))}
    </section>
  );
}

// ——— Clans ———

type RenegadesPayload = { clans: Record<string, ClanRank>; praxicUnlocked: string[] };

// One request feeds Clans and Praxic Blade.
let renegadesRequest: Promise<RenegadesPayload> | null = null;

function useRenegadesProgress(signedIn: boolean): RenegadesPayload | null {
  const [data, setData] = useState<RenegadesPayload | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    renegadesRequest ??= fetch("/api/profile/renegades", { cache: "no-store" })
      .then((response) => response.json() as Promise<Partial<RenegadesPayload>>)
      .then((payload) => ({ clans: payload.clans ?? {}, praxicUnlocked: payload.praxicUnlocked ?? [] }));
    renegadesRequest
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        renegadesRequest = null;
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);
  return signedIn ? data : null;
}

const ACCENT = "#e0a060";

function AbilityRow({ ability, instances, signedIn }: { ability: RenegadeAbility; instances: Instances; signedIn: boolean }) {
  // "Acquired" = at least the first upgrade bought; per-ability levels aren't in the API.
  const acquired = signedIn ? objectiveDone(instances, ability.recordHash, ability.objectiveHash) : null;
  const maxed = signedIn && objectiveDone(instances, RENEGADE_ABILITIES_MAXED_RECORD.recordHash, RENEGADE_ABILITIES_MAXED_RECORD.objectiveHash);
  return (
    <div className={`flex items-center gap-2.5 ${acquired === false ? "opacity-55" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BUNGIE}${ability.iconPath}`} alt="" aria-hidden className="h-[34px] w-[34px] shrink-0 border border-white/[0.14]" />
      <span className="min-w-0 flex-1 text-sm text-zinc-100">{ability.name}</span>
      {acquired !== null ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-zinc-400">
          <Notch complete={acquired} />
          {acquired ? (maxed ? "Max level" : "Acquired") : "Locked"}
        </span>
      ) : null}
    </div>
  );
}

function ClanCard({
  group,
  rank,
  instances,
  signedIn,
}: {
  group: RenegadeAbilityGroup;
  rank: ClanRank | undefined;
  instances: Instances;
  signedIn: boolean;
}) {
  const ranks = group.ranks ?? [];
  // The game's Rank = Bungie level + 1, capped at the last rank.
  const reached = rank ? Math.min(rank.level + 1, ranks.length) : 0;
  const maxed = reached === ranks.length;
  const fraction = rank && !maxed && rank.nextLevelAt ? rank.progressToNextLevel / rank.nextLevelAt : 0;
  return (
    <div className="ui-panel flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex items-center gap-3.5">
        {group.iconPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${BUNGIE}${group.iconPath}`} alt="" aria-hidden className="h-[52px] w-[52px] shrink-0 border border-white/[0.14] bg-[#1a1f27]" />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="ui-label">Clan</div>
          <h3 className="font-display text-xl font-semibold uppercase tracking-[0.08em] text-bone">{group.name}</h3>
        </div>
      </div>
      {signedIn && rank ? (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-[22px] leading-none font-semibold uppercase tracking-[0.04em]" style={{ color: ACCENT }}>
              {ranks[reached - 1]}
            </span>
            <span className="shrink-0 text-xs text-zinc-500">{`Rank ${reached} / ${ranks.length}`}</span>
          </div>
          <div className="flex gap-1" role="img" aria-label={`Rank ${reached} of ${ranks.length}`}>
            {ranks.map((name, index) => (
              <span
                key={name}
                className="h-2 flex-1"
                style={{
                  background:
                    index < reached
                      ? ACCENT
                      : index === reached
                        ? `linear-gradient(90deg, ${ACCENT} ${fraction * 100}%, rgba(255,255,255,.1) ${fraction * 100}%)`
                        : "rgba(255,255,255,.1)",
                }}
              />
            ))}
          </div>
          {!maxed ? <div className="text-xs text-zinc-500">{`${Math.floor(fraction * 100)}% to ${ranks[reached]}`}</div> : null}
        </>
      ) : null}
      <div className="ui-label border-t border-white/[0.08] pt-3">Renegade Abilities</div>
      <div className="flex flex-col gap-2.5">
        {group.abilities.map((ability) => (
          <AbilityRow key={ability.name} ability={ability} instances={instances} signedIn={signedIn} />
        ))}
      </div>
    </div>
  );
}

export function RenegadesClans() {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const clans = useRenegadesProgress(signedIn)?.clans ?? null;
  const syndicates = RENEGADE_ABILITY_GROUPS.filter((group) => group.progressionHash);
  const spider = RENEGADE_ABILITY_GROUPS.find((group) => !group.progressionHash);
  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Clans" />
      <div className="grid gap-3 md:grid-cols-3">
        {syndicates.map((group) => (
          <ClanCard
            key={group.id}
            group={group}
            rank={clans?.[group.progressionHash!]}
            instances={instances}
            signedIn={signedIn}
          />
        ))}
      </div>
      {spider ? (
        <div className="ui-panel flex flex-col gap-3 p-3 sm:p-4">
          <div>
            <div className="ui-label">{spider.name}</div>
            <h3 className="font-display text-xl font-semibold uppercase tracking-[0.08em] text-bone">Renegade Abilities</h3>
          </div>
          {/* Column gap = card gap (12) + both card paddings (2×16) + borders (2×1): rows line up with the clan cards above. */}
          <div className="grid gap-x-[46px] gap-y-2.5 md:grid-cols-3">
            {spider.abilities.map((ability) => (
              <AbilityRow key={ability.name} ability={ability} instances={instances} signedIn={signedIn} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

// ——— Collectibles ———

function marksFor(signedIn: boolean, value: number, total: number): (boolean | null)[] {
  return Array.from({ length: total }, (_, index) => (signedIn ? index < value : null));
}

function CountNote({ signedIn, done, total }: { signedIn: boolean; done: number; total: number }) {
  if (!signedIn) return <>{total}</>;
  return <span className={done >= total ? "text-owned" : undefined}>{`${Math.min(done, total)} / ${total}`}</span>;
}

function Panel({ title, note, grow, children }: { title: string; note?: ReactNode; grow?: boolean; children: ReactNode }) {
  return (
    <div className={`ui-panel space-y-3 p-3 sm:p-4 ${grow ? "flex-1" : ""}`}>
      <BoxHeading title={title} note={note} />
      {children}
    </div>
  );
}

export function RenegadesCollectibles() {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const value = (goal: { recordHash: string; objectiveHash?: string }) =>
    objectiveProgress(instances, goal.recordHash, goal.objectiveHash);

  const secretsDone = RENEGADES_SECRETS.reduce((sum, goal) => sum + Math.min(value(goal), goal.total), 0);
  const secretsTotal = RENEGADES_SECRETS.reduce((sum, goal) => sum + goal.total, 0);
  const planets = RENEGADES_INVASION_PLANETS.planets.map((planet) =>
    signedIn ? objectiveDone(instances, RENEGADES_INVASION_PLANETS.recordHash, planet.objectiveHash) : null,
  );

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Collectibles" />
      <div className="grid gap-3 md:grid-cols-2">
        {/* Small notches: 21 full-size ones don't fit a half-width panel. The three notch panels stretch so both columns end level. */}
        <div className="flex min-w-0 flex-col gap-3">
          {RENEGADES_FRONTIER_GOODS.map((goal) => (
            <Panel key={goal.label} title={goal.label} note={<CountNote signedIn={signedIn} done={value(goal)} total={goal.total} />} grow>
              <NotchRow marks={marksFor(signedIn, value(goal), goal.total)} label={goal.label} small />
            </Panel>
          ))}
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <Panel title="Secrets" note={<CountNote signedIn={signedIn} done={secretsDone} total={secretsTotal} />}>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5">
              {RENEGADES_SECRETS.map((goal) => (
                <Fragment key={goal.label}>
                  <span className="border-t border-white/[0.07] py-2.5 text-sm text-zinc-100">{goal.label}</span>
                  <span className="flex h-full items-center border-t border-white/[0.07]">
                    <NotchRow marks={marksFor(signedIn, value(goal), goal.total)} label={goal.label} small />
                  </span>
                  <span className="flex h-full items-center justify-end border-t border-white/[0.07] font-display text-[13px] text-zinc-400">
                    <CountNote signedIn={signedIn} done={value(goal)} total={goal.total} />
                  </span>
                </Fragment>
              ))}
            </div>
          </Panel>
          <Panel
            title="Invasion · Planets"
            note={<CountNote signedIn={signedIn} done={planets.filter(Boolean).length} total={planets.length} />}
          >
            <div className="grid items-center [--col:3.4rem] sm:[--col:4.75rem]" style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${planets.length}, var(--col))` }}>
              <span />
              {RENEGADES_INVASION_PLANETS.planets.map((planet) => (
                <span key={planet.name} className="pb-1.5 text-center text-[10px] leading-tight font-medium uppercase tracking-[0.12em] text-zinc-500 sm:text-[11px]">
                  {planet.name}
                </span>
              ))}
              <span className="min-w-0 border-t border-white/[0.07] py-2.5 pr-2 text-sm text-zinc-100">Invasion completed</span>
              {planets.map((done, index) => (
                <span key={index} className="flex h-full items-center justify-center border-t border-white/[0.07]">
                  <Notch complete={done} small />
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

// ——— Praxic Blade ———

/** Crystals, mods, catalysts and forms unlocked for the Praxic Blade (profile plug sets). */
export function RenegadesPraxicBlade() {
  const signedIn = useSignedIn();
  const progress = useRenegadesProgress(signedIn);
  const unlocked = new Set(progress?.praxicUnlocked ?? []);
  const showOwnership = Boolean(progress);
  const groups = PRAXIC_BLADE_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, source: "Praxic Blade" })),
  }));
  // A higher mod tier also unlocks the tiers below (ownershipHashes).
  const isUnlocked = (item: { itemHash: string; ownershipHashes?: string[] }) =>
    (item.ownershipHashes ?? [item.itemHash]).some((hash) => unlocked.has(hash));
  const resolveItemOwned = (itemHash: string) => {
    const item = groups.flatMap((group) => group.items).find((entry) => entry.itemHash === itemHash);
    return item ? isUnlocked(item) : false;
  };
  const owned = (items: { itemHash: string; ownershipHashes?: string[] }[]) => items.filter(isUnlocked).length;
  const all = groups.flatMap((group) => group.items);
  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Praxic Blade" note={showOwnership ? `${owned(all)} / ${all.length} unlocked` : `${all.length} items`} />
      <div className="grid items-stretch gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title} className={`${ACTIVITY_LOOT_PANEL_CLASS} space-y-3`}>
            <BoxHeading title={group.title} note={showOwnership ? `${owned(group.items)} / ${group.items.length}` : group.items.length} />
            <LootItemGrid
              items={group.items}
              ownedItemHashes={unlocked}
              showOwnership={showOwnership}
              resolveItemOwned={resolveItemOwned}
              ownedBorder={group.ownedBorder}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
