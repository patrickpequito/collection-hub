import Image from "next/image";
import Link from "next/link";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { progressPercent } from "@/lib/triumphs/record-progress";
import {
  TITLE_BORDER_CLASSES,
  TITLE_HOVER_BORDER_CLASSES,
  TITLE_PROGRESS_BAR_CLASSES,
} from "@/lib/triumphs/title-styles";
import type { TitleCompletionTier, TriumphProgress } from "@/types/triumph";

type TriumphProgressBannerProps = {
  href: string;
  name: string;
  iconPath: string;
  progress: TriumphProgress;
  titleTier?: TitleCompletionTier;
  /** Larger icon with tighter padding — used for triumph category banners. */
  largeIcon?: boolean;
};

export function TriumphProgressBanner({
  href,
  name,
  iconPath,
  progress,
  titleTier = "none",
  largeIcon = false,
}: TriumphProgressBannerProps) {
  const percent = progressPercent(progress);
  const iconUrl = bungieIconUrl(iconPath);
  const borderClass =
    titleTier !== "none" ? TITLE_BORDER_CLASSES[titleTier] : "border-zinc-800";

  return (
    <Link
      href={href}
      className={`group relative block h-14 overflow-hidden rounded-xl border bg-zinc-900 transition-[transform,border-color] duration-200 ease-out hover:z-10 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100 ${borderClass} ${TITLE_HOVER_BORDER_CLASSES[titleTier]}`}
    >
      <div
        className={`absolute inset-y-0 left-0 transition-[width] duration-300 ${TITLE_PROGRESS_BAR_CLASSES[titleTier]}`}
        style={{ width: `${percent}%` }}
      />

      <div
        className={`relative flex h-full items-center ${
          largeIcon ? "gap-2 pl-1.5 pr-3" : "gap-3 px-3"
        }`}
      >
        <div
          className={`relative shrink-0 overflow-hidden ${
            largeIcon ? "h-11 w-11" : "h-9 w-9"
          }`}
        >
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt=""
              fill
              className="object-contain"
              sizes={largeIcon ? "44px" : "36px"}
              unoptimized
            />
          ) : null}
        </div>

        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100">
          {name}
        </span>

        <span className="shrink-0 tabular-nums text-sm text-zinc-300">
          {progress.completed}
          <span className="text-zinc-500"> / </span>
          {progress.total}
        </span>
      </div>
    </Link>
  );
}
