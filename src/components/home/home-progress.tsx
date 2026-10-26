"use client";

import { useHomeSummary } from "@/components/home/home-summary-provider";
import { ProgressBar } from "@/components/home/progress-bar";

export function ProgressLine({
  label,
  owned,
  total,
  asPercent = false,
}: {
  label: string;
  owned: number;
  total: number;
  asPercent?: boolean;
}) {
  const value =
    asPercent && total > 0 ? `${Math.round((owned / total) * 100)}%` : `${owned} / ${total}`;
  // Bone bar and count while in progress, gold once complete.
  const gold = total > 0 && owned >= total;
  // One line: label · bar · count.
  return (
    <span className="relative mt-1.5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
      <span className="ui-label text-on-art min-w-[4.5rem] text-[11px]!">{label}</span>
      <ProgressBar owned={owned} total={total} />
      <span className={`text-on-art min-w-[2.75rem] text-right text-xs tabular-nums ${gold ? "text-owned" : "text-[#c7cad0]"}`}>
        {value}
      </span>
    </span>
  );
}

/** This week tiles: one bar with every piece of loot (weapons plus armor for all three classes). */
export function WeeklyLootBar({ slug }: { slug: string }) {
  const { summary } = useHomeSummary();
  const progress = summary?.featured[slug];
  if (!progress) return null;
  const armor = Object.values(progress.armor);
  const owned = progress.weapons.owned + armor.reduce((sum, entry) => sum + entry.owned, 0);
  const total = progress.weapons.total + armor.reduce((sum, entry) => sum + entry.total, 0);
  if (total === 0) return null;
  return (
    <span className="relative mt-1 flex items-center gap-2">
      <ProgressBar owned={owned} total={total} className="max-w-[160px] flex-1" />
      <span className={`text-on-art text-xs tabular-nums ${owned >= total ? "text-owned" : "text-[#c7cad0]"}`}>
        {owned} / {total}
      </span>
    </span>
  );
}
