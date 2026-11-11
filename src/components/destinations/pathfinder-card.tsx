"use client";

import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import type { PathfinderBoard } from "@/lib/destinations/pathfinder";
import { isRecordRedeemed } from "@/lib/triumphs/record-progress";
import { useSignedIn } from "@/lib/use-signed-in";
import type { RecordInstance } from "@/types/triumph";

const ACCENT = "#e9d8a6";

function recordDone(instance: RecordInstance | undefined): boolean {
  if (!instance) return false;
  if (isRecordRedeemed(instance.state)) return true;
  return instance.objectives.length > 0 && instance.objectives.every((o) => o.complete || o.progress >= o.completionValue);
}

function Node({ done, title, reward = false }: { done: boolean; title: string; reward?: boolean }) {
  return (
    <span
      title={title}
      className={`inline-block rotate-45 border ${reward ? "h-[22px] w-[22px]" : "h-4 w-4"}`}
      style={{
        borderColor: reward ? "#c9a227" : done ? ACCENT : "rgba(233,216,166,.45)",
        background: done ? ACCENT : "rgba(11,13,16,.6)",
        boxShadow: done ? "0 0 8px rgba(233,216,166,.55)" : undefined,
      }}
    />
  );
}

function Bar({ label, done, total }: { label: string; done: number; total: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-zinc-400">{`${label} · ${done} / ${total}`}</span>
      <span className="block h-[3px] bg-white/[0.12]">
        <span className="block h-[3px]" style={{ width: `${total ? (done / total) * 100 : 0}%`, background: ACCENT }} />
      </span>
    </div>
  );
}

/** Pale Heart · This week: the active Pathfinder board with the player's progress. */
export function PathfinderCard({ board }: { board: PathfinderBoard }) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const nodes = board.rows.flat();
  const doneOf = (hash: string) => signedIn && recordDone(instances[hash]);
  const objectivesDone = nodes.filter((node) => doneOf(node.hash)).length;
  const claimedObjective = instances[board.pathsClaimedRecordHash]?.objectives[0];
  const pathsClaimed = Math.min(claimedObjective?.completionValue ?? 3, claimedObjective?.progress ?? 0);
  const pathsTotal = claimedObjective?.completionValue ?? 3;

  return (
    <div
      className="relative grid gap-7 overflow-hidden border px-[18px] py-4 md:grid-cols-[1fr_340px] md:items-center"
      style={{
        background: "radial-gradient(circle at 85% 15%, rgba(255,244,214,.16), transparent 50%), linear-gradient(160deg, #17151a, #0e0c12)",
        borderColor: "rgba(233,216,166,.7)",
        boxShadow: "0 0 16px rgba(233,216,166,.18)",
      }}
    >
      <span
        className="absolute top-3 right-3 border px-[7px] py-[3px] font-display text-[10.5px] uppercase tracking-[0.16em]"
        style={{ color: ACCENT, borderColor: "rgba(233,216,166,.5)" }}
      >
        Weekly
      </span>
      <div className="flex flex-col gap-1.5">
        <svg width="40" height="40" viewBox="0 0 44 44" aria-hidden>
          <circle cx="22" cy="22" r="18" fill="none" stroke={ACCENT} strokeWidth="1.2" />
          <circle cx="22" cy="22" r="11" fill="none" stroke={ACCENT} strokeWidth="1" strokeDasharray="2 3" />
          <path d="M22 4v36M4 22h36" stroke={ACCENT} strokeWidth=".8" />
          <circle cx="22" cy="22" r="3" fill="#fff4d6" />
        </svg>
        <span className="font-display text-[11px] uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
          Pale Heart Pathfinder
        </span>
        <span
          className="font-display text-[26px] leading-none font-semibold uppercase tracking-[0.04em] text-white"
          style={{ textShadow: "0 0 12px rgba(255,244,214,.45)" }}
        >
          {signedIn ? `${pathsClaimed} of ${pathsTotal} paths claimed` : "This week's board"}
        </span>
        {signedIn ? (
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Bar label="Objectives" done={objectivesDone} total={nodes.length} />
            <Bar label="Path rewards" done={pathsClaimed} total={pathsTotal} />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-center gap-3.5 pt-2" role="img" aria-label={`Pathfinder board: ${objectivesDone} of ${nodes.length} objectives`}>
        <div className="flex gap-[18px]">
          <Node reward done={doneOf(board.rewardHash)} title="Path Completion Reward" />
        </div>
        {board.rows.map((row, index) => (
          <div key={index} className="flex gap-[22px]">
            {row.map((node) => (
              <Node key={node.hash} done={doneOf(node.hash)} title={`${node.name} — ${node.description}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
