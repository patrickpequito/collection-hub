import { bungieIconUrl } from "@/lib/bungie-icon";
import { isIncreasedDropRateReward } from "@/lib/triumph-reward-icon";
import {
  getDisplayObjectives,
  isRecordInstanceComplete,
  isRecordObjectivesMet,
  isRecordRedeemed,
  isTitleTriumphComplete,
  type DisplayObjective, formatRecordDescription } from "@/lib/triumphs/record-progress";
import type { RecordInstance, TriumphRecord, TriumphStringVariables } from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

export type TriumphTileState = "complete" | "claim" | "open";

/** Display state: complete (gold), objectives done but not claimed in game, or open. */
export function triumphTileState(
  record: TriumphRecord,
  instance: RecordInstance | undefined,
  { showProgress, strictCompletion }: { showProgress: boolean; strictCompletion: boolean },
): TriumphTileState {
  if (!showProgress || !instance) return "open";
  if (isRecordRedeemed(instance.state)) return "complete";
  if (isRecordObjectivesMet(instance.state)) return "claim";
  if (!strictCompletion && isRecordInstanceComplete(record, instance)) return "complete";
  if (strictCompletion && isTitleTriumphComplete(instance)) return "complete";
  return "open";
}

function ObjectiveRow({
  objective,
  showProgress,
  tileDone,
}: {
  objective: DisplayObjective;
  showProgress: boolean;
  tileDone: boolean;
}) {
  const value = Math.min(objective.progress, objective.completionValue);
  const percent = objective.completionValue > 0 ? Math.round((value / objective.completionValue) * 100) : 0;
  const checked = showProgress && objective.complete;
  return (
    <div className="grid grid-cols-[22px_minmax(0,1fr)] items-center gap-2.5">
      <span
        aria-hidden
        className={`size-[22px] border ${
          checked ? "border-owned bg-owned bg-clip-content p-[3px]" : "border-white/45 bg-[#1d2026]"
        }`}
      />
      <span className="relative flex min-h-7 items-center justify-between gap-2.5 overflow-hidden bg-white/[0.06] px-3 text-[15px] text-bone">
        {showProgress && !tileDone ? (
          <span className="absolute inset-y-0 left-0 bg-white/[0.12]" style={{ width: `${percent}%` }} />
        ) : null}
        <span className="relative min-w-0 truncate">{objective.label}</span>
        {objective.completionValue > 1 ? (
          <span className="relative shrink-0 tabular-nums">
            {showProgress ? `${value}/${objective.completionValue}` : objective.completionValue}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** One triumph as in game: icon, name, score, every objective, then rewards. */
export function TriumphTile({
  record,
  instance,
  showProgress,
  strictCompletion = false,
  stringVariables = EMPTY_TRIUMPH_STRING_VARIABLES,
}: {
  record: TriumphRecord;
  instance?: RecordInstance;
  showProgress: boolean;
  /** Seal pages: only Bungie record state counts as complete. */
  strictCompletion?: boolean;
  stringVariables?: TriumphStringVariables;
}) {
  const state = triumphTileState(record, instance, { showProgress, strictCompletion });
  const done = state !== "open";
  const objectives = getDisplayObjectives(record, showProgress ? instance : undefined, {
    strictCompletion,
    stringVariables,
  });
  const rows: DisplayObjective[] = objectives.length
    ? objectives
    : [{ label: "Complete", progress: done ? 1 : 0, completionValue: 1, complete: done }];
  const iconUrl = bungieIconUrl(record.iconPath);

  return (
    <article
      className={`relative flex min-w-0 flex-col gap-3.5 border p-[18px] pl-4 ${
        done
          ? "border-owned bg-[#12161c] bg-[linear-gradient(rgba(201,162,39,0.12),rgba(201,162,39,0.12))]"
          : "border-white/[0.16] bg-[#0e1115]/90"
      } ${state === "claim" ? "shadow-[0_0_0_1px_#c9a227,0_0_18px_rgba(201,162,39,0.4)]" : ""}`}
    >
      <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-start gap-3.5">
        <span className="flex size-[52px] items-center justify-center">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt="" width={46} height={46} className="size-[46px] object-contain" />
          ) : null}
        </span>
        <div className="min-w-0">
          <h3 className="text-[19px] font-medium leading-snug text-[#f1efe9]">{record.name}</h3>
          {record.description ? (
            <p className="mt-1.5 text-[15px] leading-[1.45] text-[#b9bcc2]">{formatRecordDescription(record.description, stringVariables)}</p>
          ) : null}
        </div>
        {record.score ? (
          <span className="text-[17px] tabular-nums text-bone underline decoration-white/45 decoration-dotted underline-offset-[5px]">
            {record.score}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((objective, index) => (
          <ObjectiveRow
            key={`${record.recordHash}-${index}`}
            objective={{ ...objective, label: objective.label || record.name }}
            showProgress={showProgress}
            tileDone={done}
          />
        ))}
      </div>

      {state === "claim" ? (
        <span className="self-start border border-owned px-1.5 py-px font-display text-[11px] uppercase tracking-[0.14em] text-owned">
          Ready to claim in game
        </span>
      ) : null}

      {record.rewards.map((reward) => {
        const rewardIcon = bungieIconUrl(reward.iconPath);
        if (!reward.itemType || isIncreasedDropRateReward(reward.iconPath)) {
          return (
            <div key={reward.itemHash} className="flex items-center gap-2.5 text-sm text-[#c7cad0]">
              {rewardIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rewardIcon} alt="" width={28} height={28} className="size-7 shrink-0 object-contain" />
              ) : null}
              <span className="underline decoration-white/40 decoration-dotted underline-offset-4">{reward.name}</span>
            </div>
          );
        }
        return (
          <div
            key={reward.itemHash}
            className="grid grid-cols-[52px_minmax(0,1fr)] gap-3.5 border border-white/30 bg-white/[0.04] p-[3px]"
          >
            {rewardIcon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={rewardIcon} alt="" width={52} height={52} className="size-[52px] object-cover" />
            ) : (
              <span />
            )}
            <span className="flex min-w-0 flex-col justify-center">
              <span className="truncate text-base text-bone">{reward.name}</span>
              <span className="truncate text-[13px] text-ash">{reward.itemType}</span>
            </span>
          </div>
        );
      })}
    </article>
  );
}
