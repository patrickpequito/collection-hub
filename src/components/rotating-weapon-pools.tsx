"use client";

import { useEffect, useState } from "react";
import { LootItemGrid } from "@/components/loot-section";
import { rankPools, type PoolOccurrence, type PoolRowStatus } from "@/lib/activities/pool-rotation";
import type { ActivityWeaponPool } from "@/types/activity-hub";
import type { LootItem } from "@/types/activity-loot";

const TAG = "border px-1.5 py-0.5 font-display text-[10.5px] uppercase tracking-[0.14em] whitespace-nowrap bg-void/60";
const TAG_STYLE: Record<PoolRowStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "border-owned text-[#e8c860]" },
  next: { label: "Next", className: "border-seasonal/70 text-[#5fd6d5]" },
  later: { label: "Then", className: "border-white/30 text-[#c7cad0]" },
};

function formatDay(ms: number) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(ms),
  );
}

/** Re-ranks once a minute so Active / Next switch on their own when an event starts or ends. */
function useNow(initialNowMs: number) {
  const [nowMs, setNowMs] = useState(initialNowMs);
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    void Promise.resolve().then(() => setNowMs(Date.now()));
    return () => window.clearInterval(timer);
  }, []);
  return nowMs;
}

/**
 * Rotating weapon pools, all visible and sorted by when they come up (Iron Banner events,
 * Trials weekends). The running or next pool sits on top with a gold title and an
 * Active / Next tag; the others are dimmed with their date.
 */
export function RotatingWeaponPools({
  pools,
  occurrences,
  initialNowMs,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
  upcomingAsNext = false,
}: {
  pools: ActivityWeaponPool[];
  occurrences: PoolOccurrence[];
  /** Server time, so the first client render matches the page. */
  initialNowMs: number;
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  resolveItemOwned?: (itemHash: string) => boolean;
  itemHrefs?: Record<string, string>;
  /** Tag every upcoming pool "Next" (with its date) instead of "Then". */
  upcomingAsNext?: boolean;
}) {
  const nowMs = useNow(initialNowMs);
  const rows = rankPools(
    pools.map((pool) => pool.id),
    occurrences,
    nowMs,
  );
  const owns = (item: LootItem) =>
    resolveItemOwned
      ? resolveItemOwned(item.itemHash)
      : (item.ownershipHashes?.length ? item.ownershipHashes : [item.itemHash]).some((hash) => ownedItemHashes.has(hash));

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const pool = pools.find((entry) => entry.id === row.poolId);
        if (!pool) return null;
        const tag = TAG_STYLE[upcomingAsNext && row.status === "later" ? "next" : row.status];
        // Gold title and brighter frame for the pool that matters now: the running one,
        // or the upcoming one when nothing is running.
        const highlighted = row.status === "active" || (row.status === "next" && !rows.some((entry) => entry.status === "active"));
        const when = row.occurrence
          ? row.status === "active"
            ? `until ${formatDay(row.occurrence.endMs)}`
            : formatDay(row.occurrence.startMs)
          : "Not scheduled";
        return (
          <div
            key={pool.id}
            className={`grid min-w-0 items-center gap-x-5 gap-y-3 border bg-void/30 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)_auto] ${
              highlighted ? "border-white/40" : "border-white/[0.12]"
            }`}
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <span
                className={`font-display text-base font-semibold uppercase tracking-[0.08em] ${
                  highlighted ? "text-[#e8c860]" : "text-bone"
                }`}
              >
                {pool.label}
              </span>
              <span className="flex items-center gap-2">
                <span className={`${TAG} ${tag.className}`}>{tag.label}</span>
                <span className="text-[12.5px] text-ash">{when}</span>
              </span>
            </div>
            <div>
              <LootItemGrid
                items={pool.items}
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                resolveItemOwned={resolveItemOwned}
                itemHrefs={itemHrefs}
              />
            </div>
            <span className="text-right text-xs tabular-nums text-ash">
              {showOwnership ? `${pool.items.filter(owns).length} / ${pool.items.length}` : pool.items.length}
            </span>
          </div>
        );
      })}
    </div>
  );
}
