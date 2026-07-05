import { InteractiveBannerLink } from "@/components/interactive-banner-link";
import { getActivityHref } from "@/data/rad-loot/activities";
import { activityKindIconPath } from "@/lib/activity-kind-icon";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ActivityEntry } from "@/types/activity-loot";

type HomeFeaturedActivityBannerProps = {
  entry: ActivityEntry;
  kind: "raid" | "dungeon";
};

export function HomeFeaturedActivityBanner({
  entry,
  kind,
}: HomeFeaturedActivityBannerProps) {
  const href = getActivityHref(entry);
  const imageUrl = entry.imageFile
    ? `/images/rad-loot/activities/${entry.imageFile}`
    : null;

  const iconSlotClass = "flex w-5 shrink-0 items-center justify-start sm:w-6";
  const iconClass =
    kind === "raid"
      ? "h-8 w-8 max-w-none -translate-x-1.5 object-contain brightness-0 invert drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:h-9 sm:w-9 sm:-translate-x-2"
      : "h-4 w-4 object-contain brightness-0 invert drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:h-5 sm:w-5";

  return (
    <InteractiveBannerLink
      href={href}
      className="group relative block overflow-hidden rounded-lg transition"
    >
      <div className="relative h-[35px] overflow-hidden bg-zinc-900 sm:h-[60px] md:h-[70px]">
        {imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-left transition duration-500 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center gap-2 px-3 sm:gap-2.5 sm:px-4">
          <span className={iconSlotClass} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bungieIconUrl(activityKindIconPath(kind))}
              alt=""
              width={kind === "raid" ? 36 : 20}
              height={kind === "raid" ? 36 : 20}
              className={iconClass}
            />
          </span>
          <span className="text-sm font-bold uppercase tracking-wide text-zinc-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-base">
            {entry.title}
          </span>
        </div>
      </div>
    </InteractiveBannerLink>
  );
}
