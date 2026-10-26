"use client";

import { useActivitiesProgress } from "@/components/activities/activities-progress-provider";
import { ProgressLine } from "@/components/home/home-progress";
import { ProgressBar } from "@/components/home/progress-bar";

/**
 * Total loot bar: every weapon, armor piece (all classes) and cosmetic.
 * "bar" = home page style (short bar and count, no label).
 */
export function ActivityCardProgress({ slug, variant = "line" }: { slug: string; variant?: "line" | "bar" }) {
  const { progress } = useActivitiesProgress();
  const entry = progress?.[slug];
  if (!entry || entry.total.total === 0) return null;
  const { owned, total } = entry.total;
  if (variant === "line") return <ProgressLine label="Loot" owned={owned} total={total} />;
  return (
    <span className="relative mt-1 flex items-center gap-2">
      <ProgressBar owned={owned} total={total} className="max-w-[160px] flex-1" />
      <span className={`text-on-art text-xs tabular-nums ${owned >= total ? "text-owned" : "text-[#c7cad0]"}`}>
        {owned} / {total}
      </span>
    </span>
  );
}
