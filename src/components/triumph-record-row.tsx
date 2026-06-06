import Image from "next/image";
import { TriumphRewardIcon } from "@/components/triumph-reward-icon";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { isIncreasedDropRateReward } from "@/lib/triumph-reward-icon";
import {
  getDisplayObjectives,
  getIntervalSegments,
  isRecordInstanceComplete,
  isTitleTriumphComplete,
  type DisplayObjective,
} from "@/lib/triumphs/record-progress";
import type {
  RecordInstance,
  TriumphRecord,
  TriumphStringVariables,
} from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

type TriumphRecordRowProps = {
  record: TriumphRecord;
  instance?: RecordInstance;
  showProgress: boolean;
  /** Title pages — only Bungie record state counts as complete. */
  strictCompletion?: boolean;
  variant?: "group" | "title";
  stringVariables?: TriumphStringVariables;
};

function CompletionBox({
  complete,
  variant,
}: {
  complete: boolean;
  variant: "group" | "title";
}) {
  if (variant === "title") {
    return (
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center border ${
          complete ? "border-[#c9a227]" : "border-zinc-500"
        }`}
        aria-hidden
      >
        {complete ? (
          <span className="h-[calc(100%-6px)] w-[calc(100%-6px)] bg-[#c9a227]" />
        ) : null}
      </span>
    );
  }

  return (
    <span
      className={`mt-0.5 inline-block h-4 w-4 shrink-0 border ${
        complete
          ? "border-[#c9a227] bg-[#c9a227]"
          : "border-zinc-500 bg-transparent"
      }`}
      aria-hidden
    />
  );
}

function IntervalObjectiveProgressRow({
  objective,
  variant,
  isTitleVariant,
  fallbackLabel,
}: {
  objective: DisplayObjective;
  variant: "group" | "title";
  isTitleVariant: boolean;
  fallbackLabel?: string;
}) {
  const thresholds = objective.intervalThresholds ?? [];
  const segments = getIntervalSegments(objective.progress, thresholds);
  const displayProgress = Math.min(objective.progress, objective.completionValue);

  return (
    <div className="flex items-center gap-2">
      <CompletionBox complete={objective.complete} variant={variant} />

      <div
        className={`relative min-h-6 min-w-0 flex-1 overflow-hidden bg-zinc-800 ${
          isTitleVariant ? "" : "rounded-sm"
        }`}
      >
        <div className="absolute inset-0 flex gap-[3px] bg-zinc-950 p-[2px]">
          {segments.map((segment, index) => (
            <div
              key={`${objective.label}-${index}`}
              className="relative min-w-0 flex-1 overflow-hidden bg-zinc-800"
            >
              {segment.state === "complete" ? (
                <div className="absolute inset-0 bg-[#c2a342]/60" />
              ) : null}
              {segment.state === "partial" ? (
                <div
                  className="absolute inset-y-0 left-0 bg-[#5e5233]/80"
                  style={{ width: `${segment.partialRatio * 100}%` }}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="relative flex min-h-6 items-center justify-between gap-2 px-2">
          <span className="truncate text-[11px] text-zinc-200">
            {objective.label || fallbackLabel}
          </span>
          <span className="shrink-0 tabular-nums text-[11px] text-zinc-300">
            {displayProgress}/{objective.completionValue}
          </span>
        </div>
      </div>
    </div>
  );
}

function ObjectiveProgressRow({
  objective,
  variant,
  isTitleVariant,
  fallbackLabel,
}: {
  objective: DisplayObjective;
  variant: "group" | "title";
  isTitleVariant: boolean;
  fallbackLabel?: string;
}) {
  const hasNumericProgress = objective.completionValue > 1;
  const displayProgress = Math.min(objective.progress, objective.completionValue);
  const objectivePercent =
    objective.completionValue > 0
      ? Math.min(
          100,
          Math.round((displayProgress / objective.completionValue) * 100),
        )
      : 0;

  return (
    <div className="flex items-center gap-2">
      <CompletionBox complete={objective.complete} variant={variant} />

      <div
        className={`relative min-h-6 min-w-0 flex-1 overflow-hidden bg-zinc-800 ${
          isTitleVariant ? "" : "rounded-sm"
        }`}
      >
        <div
          className={`absolute inset-y-0 left-0 ${
            objective.complete ? "bg-[#c2a342]/60" : "bg-[#5e5233]/80"
          }`}
          style={{
            width: objective.complete ? "100%" : `${objectivePercent}%`,
          }}
        />
        <div className="relative flex min-h-6 items-center justify-between gap-2 px-2">
          <span className="truncate text-[11px] text-zinc-200">
            {objective.label || fallbackLabel}
          </span>
          {hasNumericProgress ? (
            <span className="shrink-0 tabular-nums text-[11px] text-zinc-300">
              {displayProgress}/{objective.completionValue}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TriumphRecordRow({
  record,
  instance,
  showProgress,
  strictCompletion = false,
  variant = "group",
  stringVariables = EMPTY_TRIUMPH_STRING_VARIABLES,
}: TriumphRecordRowProps) {
  const complete =
    showProgress &&
    (strictCompletion
      ? isTitleTriumphComplete(instance)
      : isRecordInstanceComplete(record, instance));
  const iconUrl = bungieIconUrl(record.iconPath);
  const objectives = showProgress
    ? getDisplayObjectives(record, instance, {
        strictCompletion,
        stringVariables,
      })
    : [];
  const displayComplete = strictCompletion
    ? complete
    : complete || (objectives.length > 0 && objectives.every((o) => o.complete));
  const isTitleVariant = variant === "title";

  const content = (
    <>
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt=""
              fill
              className="object-contain"
              sizes="40px"
              unoptimized
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-snug ${
              displayComplete ? "text-zinc-300" : "text-zinc-100"
            }`}
          >
            {record.name}
          </p>
          {record.description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
              {record.description}
            </p>
          ) : null}

          {showProgress && (objectives.length > 0 || !record.objectives.length) ? (
            <div className="mt-2.5 space-y-2">
              {objectives.length > 0 ? (
                objectives.map((objective, index) =>
                  objective.intervalThresholds?.length ? (
                    <IntervalObjectiveProgressRow
                      key={`${record.recordHash}-${index}`}
                      objective={objective}
                      variant={variant}
                      isTitleVariant={isTitleVariant}
                      fallbackLabel={record.name}
                    />
                  ) : (
                    <ObjectiveProgressRow
                      key={`${record.recordHash}-${index}`}
                      objective={objective}
                      variant={variant}
                      isTitleVariant={isTitleVariant}
                      fallbackLabel={record.name}
                    />
                  ),
                )
              ) : (
                <ObjectiveProgressRow
                  objective={{
                    label: record.name,
                    progress: 0,
                    completionValue: 1,
                    complete: displayComplete,
                  }}
                  variant={variant}
                  isTitleVariant={isTitleVariant}
                  fallbackLabel={record.name}
                />
              )}
            </div>
          ) : null}

          {record.rewards.length > 0 ? (
            <div className={isTitleVariant ? "mt-3 space-y-2" : "mt-2 space-y-1.5"}>
              {record.rewards.map((reward) => {
                const rewardIcon = bungieIconUrl(reward.iconPath);
                const dropRateReward = isIncreasedDropRateReward(reward.iconPath);
                const rewardText = (
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-zinc-200">
                      {reward.name}
                    </p>
                    {reward.itemType ? (
                      <p className="truncate text-[11px] text-zinc-500/80">
                        {reward.itemType}
                      </p>
                    ) : null}
                  </div>
                );

                if (isTitleVariant) {
                  if (dropRateReward) {
                    return (
                      <div
                        key={reward.itemHash}
                        className="flex items-center gap-2.5 py-1"
                      >
                        {rewardIcon ? (
                          <TriumphRewardIcon src={rewardIcon} size="title" />
                        ) : null}
                        {rewardText}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={reward.itemHash}
                      className="flex border border-zinc-800 bg-zinc-950/50"
                    >
                      <div className="flex shrink-0 items-center justify-center border-r border-zinc-800">
                        {rewardIcon ? (
                          <TriumphRewardIcon src={rewardIcon} size="title" />
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 items-center p-2">
                        {rewardText}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={reward.itemHash}>
                    <div className="flex items-center gap-2">
                      {rewardIcon ? (
                        <TriumphRewardIcon src={rewardIcon} size="group" />
                      ) : null}
                      {rewardText}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  if (isTitleVariant) {
    return (
      <div
        className={`relative border bg-zinc-900/30 p-3 transition-transform duration-200 ease-out hover:z-10 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100 ${
          displayComplete ? "border-[#c9a227]/50" : "border-zinc-800"
        }`}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`px-2 py-3 ${
        displayComplete
          ? "rounded-md ring-1 ring-[#c9a227]/75 ring-inset"
          : "border-b border-zinc-800/80 last:border-b-0"
      }`}
    >
      {content}
    </div>
  );
}
