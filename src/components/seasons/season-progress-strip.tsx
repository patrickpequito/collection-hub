"use client";

import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
import { countOwnedGroups } from "@/lib/expansions/expansion-progress";

type SeasonProgressStripProps = {
  total: number;
  ownershipGroups: string[][];
};

function StatCard({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number | null;
}) {
  const widthPercent =
    progress == null ? 0 : Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-zinc-900/40 ${
        progress != null && progress >= 1
          ? "border-[#c9a227]/50"
          : "border-zinc-800"
      }`}
    >
      <div className="px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-100">
          {value}
        </p>
      </div>
      <div
        className="h-1 w-full bg-zinc-800"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress == null ? undefined : Math.round(widthPercent)}
      >
        <div
          className="h-full bg-[#c9a227] transition-[width] duration-300 ease-out"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}

export function SeasonProgressStrip({
  total,
  ownershipGroups,
}: SeasonProgressStripProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();

  const owned = useMemo(
    () =>
      showOwnership
        ? countOwnedGroups(ownershipGroups, ownedItemHashes)
        : null,
    [ownershipGroups, ownedItemHashes, showOwnership],
  );

  return (
    <section>
      <StatCard
        label="Collection progress"
        value={owned === null ? `— / ${total}` : `${owned}/${total}`}
        progress={
          owned == null || total === 0 ? null : owned / total
        }
      />
      <p className="mt-2 text-xs text-zinc-500">
        Counts obtainable season loot only — no triumphs, titles, or
        unobtainable legacy rewards.
      </p>
    </section>
  );
}
