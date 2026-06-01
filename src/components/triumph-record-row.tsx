import Image from "next/image";
import { TrimmedRewardIcon } from "@/components/trimmed-reward-icon";
import { bungieIconUrl } from "@/lib/bungie-icon";
import {
  getDisplayObjectives,
  isRecordInstanceComplete,
  isTitleTriumphComplete,
  type DisplayObjective,
} from "@/lib/triumphs/record-progress";
import type { RecordInstance, TriumphRecord } from "@/types/triumph";

type TriumphRecordRowProps = {
  record: TriumphRecord;
  instance?: RecordInstance;
  showProgress: boolean;
  /** Title pages — only Bungie record state counts as complete. */
  strictCompletion?: boolean;
  variant?: "group" | "title";
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
            objective.complete ? "bg-[#c9a227]/35" : "bg-zinc-600/70"
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
}: TriumphRecordRowProps) {
  const complete =
    showProgress &&
    (strictCompletion
      ? isTitleTriumphComplete(instance)
      : isRecordInstanceComplete(record, instance));
  const iconUrl = bungieIconUrl(record.iconPath);
  const objectives = showProgress
    ? getDisplayObjectives(record, instance, { strictCompletion })
    : [];
  const displayComplete =
    complete || (objectives.length > 0 && objectives.every((o) => o.complete));
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
                objectives.map((objective, index) => (
                  <ObjectiveProgressRow
                    key={`${record.recordHash}-${index}`}
                    objective={objective}
                    variant={variant}
                    isTitleVariant={isTitleVariant}
                    fallbackLabel={record.name}
                  />
                ))
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
                const rewardContent = (
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden">
                      {rewardIcon ? (
                        <Image
                          src={rewardIcon}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="32px"
                          unoptimized
                        />
                      ) : null}
                    </div>
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
                  </div>
                );

                if (isTitleVariant) {
                  return (
                    <div
                      key={reward.itemHash}
                      className="flex border border-zinc-800 bg-zinc-950/50"
                    >
                      <div className="flex w-14 shrink-0 items-center overflow-x-hidden border-r border-zinc-800">
                        {rewardIcon ? (
                          <TrimmedRewardIcon src={rewardIcon} alt="" />
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 items-center p-2">
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
                      </div>
                    </div>
                  );
                }

                return <div key={reward.itemHash}>{rewardContent}</div>;
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
