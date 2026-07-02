import type { WeaponStat } from "@/types/all-loot";

type ArmorStatsPanelProps = {
  stats: WeaponStat[];
  highlightedStatNames?: Set<string>;
};

function statBarWidth(stat: WeaponStat) {
  if (!stat.max) return 0;
  return Math.max(0, Math.min(100, (stat.value / stat.max) * 100));
}

export function ArmorStatsPanel({
  stats,
  highlightedStatNames,
}: ArmorStatsPanelProps) {
  if (!stats.length) return null;

  return (
    <div className="space-y-2">
      {stats.map((stat) => {
        const highlighted = highlightedStatNames?.has(stat.name) ?? false;
        return (
          <div key={stat.name}>
            <div className="flex items-baseline justify-between gap-2 text-xs leading-tight">
              <span
                className={
                  highlighted ? "font-medium text-amber-200" : "text-zinc-400"
                }
              >
                {stat.name}
              </span>
              <span
                className={`tabular-nums font-medium ${
                  highlighted ? "text-amber-100" : "text-zinc-100"
                }`}
              >
                {stat.value}
              </span>
            </div>
            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full ${
                  highlighted ? "bg-amber-300" : "bg-zinc-100"
                }`}
                style={{ width: `${statBarWidth(stat)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
