import Image from "next/image";
import Link from "next/link";
import { ACTIVITY_LOOT_PANEL_CLASS } from "@/components/activity-current-loot-panel";
import { HorizontalScrollHint } from "@/components/horizontal-scroll-hint";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type {
  ActivityEventCardReward,
  EventCardRewardClaimStatus,
} from "@/types/activity-hub";

const REWARD_ICON_SIZE = 60;

const CLAIM_STATUS_CARD_CLASS: Record<EventCardRewardClaimStatus, string> = {
  claimed:
    "border-2 border-[rgb(255,188,0)] bg-zinc-950/40 shadow-[0_0_6px_rgba(255,188,0,0.8)]",
  claimable:
    "border-2 border-emerald-400/90 bg-emerald-950/20 shadow-[0_0_6px_rgba(52,211,153,0.55)]",
  locked: "border border-zinc-800 bg-zinc-950/40",
};

type ActivityEventCardRewardsPanelProps = {
  rewards: ActivityEventCardReward[];
  claimStatusByRank?: Record<number, EventCardRewardClaimStatus> | null;
  showClaimStatus?: boolean;
  itemHrefs?: Record<string, string>;
};

function EventCardRewardCard({
  reward,
  claimStatus,
  showClaimStatus,
  href,
}: {
  reward: ActivityEventCardReward;
  claimStatus: EventCardRewardClaimStatus;
  showClaimStatus: boolean;
  href?: string;
}) {
  const status = showClaimStatus ? claimStatus : "locked";
  const icon = (
    <div className="relative my-2 size-[60px] shrink-0 overflow-hidden rounded-md bg-zinc-900">
      <Image
        src={bungieIconUrl(reward.iconPath)}
        alt=""
        width={REWARD_ICON_SIZE}
        height={REWARD_ICON_SIZE}
        className={`size-full object-cover ${showClaimStatus && status === "locked" ? "opacity-80" : ""}`}
        unoptimized
      />
    </div>
  );

  return (
    <article
      className={`flex w-[7.75rem] shrink-0 snap-start flex-col items-center rounded-lg p-3 text-center ${CLAIM_STATUS_CARD_CLASS[status]}`}
    >
      <p className="text-xs font-semibold text-zinc-300">Rank {reward.rank}</p>
      {href ? (
        <Link
          href={href}
          className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          {icon}
        </Link>
      ) : (
        icon
      )}
      <p className="text-xs leading-snug text-zinc-100">{reward.name}</p>
      {reward.subtitle ? (
        <p className="mt-1 text-[10px] leading-snug text-zinc-500">
          {reward.subtitle}
        </p>
      ) : null}
    </article>
  );
}

export function ActivityEventCardRewardsPanel({
  rewards,
  claimStatusByRank,
  showClaimStatus = false,
  itemHrefs,
}: ActivityEventCardRewardsPanelProps) {
  if (rewards.length === 0) return null;

  return (
    <section className={ACTIVITY_LOOT_PANEL_CLASS}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-300">
          Event Card — reward track
        </h3>
        {showClaimStatus ? (
          <p className="text-[10px] text-zinc-500">
            <span className="text-amber-300">Gold</span> claimed ·{" "}
            <span className="text-emerald-300">Green</span> ready to claim
          </p>
        ) : null}
      </div>
      <HorizontalScrollHint hintLabel="Scroll for more ranks">
        <div className="flex w-max min-w-full gap-3">
          {rewards.map((reward) => (
            <EventCardRewardCard
              key={reward.rank}
              reward={reward}
              claimStatus={claimStatusByRank?.[reward.rank] ?? "locked"}
              showClaimStatus={showClaimStatus}
              href={
                reward.itemHash ? itemHrefs?.[reward.itemHash] : undefined
              }
            />
          ))}
        </div>
      </HorizontalScrollHint>
    </section>
  );
}
