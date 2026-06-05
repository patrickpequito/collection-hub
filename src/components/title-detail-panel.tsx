import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { progressPercent } from "@/lib/triumphs/record-progress";
import {
  TITLE_BORDER_CLASSES,
  TITLE_FILL_CLASSES,
} from "@/lib/triumphs/title-styles";
import type { RaidCompletions } from "@/lib/destiny-activity-stats";
import type { TitleCompletionTier, TriumphProgress } from "@/types/triumph";

type TitleDetailPanelProps = {
  name: string;
  guardianTitle: string | null;
  description: string;
  iconPath: string;
  baseProgress: TriumphProgress;
  /** Base + gilding triumphs toward a gilded title (e.g. 1/12). */
  overallProgress: TriumphProgress;
  hasGilding: boolean;
  titleTier: TitleCompletionTier;
  /** Raid activity pages — gold progress and gold completion styling only. */
  appearance?: "default" | "raid";
  /** Clears logged on raid activity pages. Omit on non-raid pages. */
  raidCompletions?: RaidCompletions | null;
  /** When false, only a single completions row is shown (e.g. Last Wish). */
  showMasterCompletions?: boolean;
  /** Overrides the single-tier completions label (default: "Raid Completions"). */
  completionsLabel?: string;
};

function getDisplayTitleTier(
  titleTier: TitleCompletionTier,
  appearance: "default" | "raid",
): TitleCompletionTier {
  if (appearance === "raid" && titleTier === "base") {
    return "gilded";
  }
  return titleTier;
}

export function TitleDetailPanel({
  name,
  guardianTitle,
  description,
  iconPath,
  baseProgress,
  overallProgress,
  hasGilding,
  titleTier,
  appearance = "default",
  raidCompletions,
  showMasterCompletions = true,
  completionsLabel = "Raid Completions",
}: TitleDetailPanelProps) {
  const iconUrl = bungieIconUrl(iconPath);
  const basePercent = progressPercent(baseProgress);
  const overallPercent = progressPercent(overallProgress);
  const displayTitleTier = getDisplayTitleTier(titleTier, appearance);
  const titleBoxBorder = TITLE_BORDER_CLASSES[displayTitleTier];
  const titleBoxFill = TITLE_FILL_CLASSES[displayTitleTier];
  const progressBarClass =
    appearance === "raid" ? "bg-[#c9a227]" : "bg-[#9d6bff]";
  const showGildingProgress = hasGilding && appearance === "default";

  return (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
      <div className="relative mx-auto h-44 w-44 overflow-hidden">
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt=""
            fill
            className="object-contain"
            sizes="176px"
            unoptimized
          />
        ) : null}
      </div>

      <h2 className="mt-4 text-xl font-bold text-zinc-100">{name}</h2>

      {description ? (
        <p className="mt-2 text-sm italic leading-relaxed text-zinc-400">
          {description}
        </p>
      ) : null}

      {guardianTitle ? (
        <div
          className={`mt-6 w-full border px-3 py-2 text-sm font-semibold tracking-wide text-zinc-100 ${titleBoxBorder} ${titleBoxFill}`}
        >
          {guardianTitle}
        </div>
      ) : null}

      <div className={`w-full ${guardianTitle ? "mt-4" : "mt-6"}`}>
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500">
          <span>Title Progress</span>
          <span className="tabular-nums normal-case text-zinc-300">
            {baseProgress.completed} / {baseProgress.total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full ${progressBarClass}`}
            style={{ width: `${basePercent}%` }}
          />
        </div>
      </div>

      {appearance === "raid" && raidCompletions !== undefined ? (
        <div className="mt-4 w-full border border-[#c9a227]/30 bg-zinc-900/40 px-3 py-2.5">
          <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-wide text-zinc-500">
            <span>
              {showMasterCompletions ? "Normal Completions" : completionsLabel}
            </span>
            <span className="shrink-0 tabular-nums text-sm font-semibold normal-case text-zinc-100">
              {raidCompletions === null
                ? "—"
                : raidCompletions.normal.toLocaleString()}
            </span>
          </div>
          {showMasterCompletions ? (
            <>
              <div
                className="mx-2 my-2 border-t border-zinc-700/50"
                aria-hidden
              />
              <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-wide text-zinc-500">
                <span>Master Completions</span>
                <span className="shrink-0 tabular-nums text-sm font-semibold normal-case text-zinc-100">
                  {raidCompletions === null
                    ? "—"
                    : raidCompletions.master.toLocaleString()}
                </span>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {showGildingProgress ? (
        <div className="mt-4 w-full">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500">
            <span>Gilding Progress</span>
            <span className="tabular-nums normal-case text-zinc-300">
              {overallProgress.completed} / {overallProgress.total}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-[#c9a227]"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
