import type { WeaponStat } from "@/types/all-loot";

type WeaponStatsPanelProps = {
  stats: WeaponStat[];
};

const PLAIN_STAT_NAMES = new Set([
  "Rounds Per Minute",
  "Magazine",
  "Recoil Direction",
  "Ammo Capacity",
  "Draw Time",
]);

function isPlainStat(stat: WeaponStat) {
  return PLAIN_STAT_NAMES.has(stat.name);
}

function statBarWidth(stat: WeaponStat) {
  if (!stat.max) return 0;
  return Math.max(0, Math.min(100, (stat.value / stat.max) * 100));
}

function partitionStats(stats: WeaponStat[]) {
  const barStats: WeaponStat[] = [];
  const plainStats: WeaponStat[] = [];

  for (const stat of stats) {
    if (isPlainStat(stat)) {
      plainStats.push(stat);
    } else {
      barStats.push(stat);
    }
  }

  return { barStats, plainStats };
}

function StatRow({ stat }: { stat: WeaponStat }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs leading-tight">
      <span className="text-zinc-400">{stat.name}</span>
      <span className="tabular-nums font-medium text-zinc-100">{stat.value}</span>
    </div>
  );
}

export function WeaponStatsPanel({ stats }: WeaponStatsPanelProps) {
  if (!stats.length) return null;

  const { barStats, plainStats } = partitionStats(stats);

  return (
    <div className="space-y-2">
      {barStats.map((stat) => (
        <div key={stat.name}>
          <StatRow stat={stat} />
          <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-100"
              style={{ width: `${statBarWidth(stat)}%` }}
            />
          </div>
        </div>
      ))}

      {plainStats.length > 0 ? (
        <div
          className={
            barStats.length > 0
              ? "space-y-1 border-t border-zinc-800/80 pt-2"
              : "space-y-1"
          }
        >
          {plainStats.map((stat) => (
            <StatRow key={stat.name} stat={stat} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
