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
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-zinc-300">{stat.name}</span>
      <span className="tabular-nums text-zinc-100">{stat.value}</span>
    </div>
  );
}

export function WeaponStatsPanel({ stats }: WeaponStatsPanelProps) {
  if (!stats.length) return null;

  const { barStats, plainStats } = partitionStats(stats);

  return (
    <div className="space-y-3">
      {barStats.map((stat) => (
        <div key={stat.name}>
          <div className="mb-1">
            <StatRow stat={stat} />
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-100"
              style={{ width: `${statBarWidth(stat)}%` }}
            />
          </div>
        </div>
      ))}

      {plainStats.length > 0 ? (
        <div className={barStats.length > 0 ? "space-y-2 border-t border-zinc-800 pt-3" : "space-y-2"}>
          {plainStats.map((stat) => (
            <StatRow key={stat.name} stat={stat} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
