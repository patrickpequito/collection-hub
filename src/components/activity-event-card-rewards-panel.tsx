import { SectionHeading } from "@/components/detail-page-parts";
import Image from "next/image";
import Link from "@/components/app-link";
import { HorizontalScrollHint } from "@/components/horizontal-scroll-hint";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type {
  ActivityEventCardReward,
  EventCardRewardClaimStatus,
} from "@/types/activity-hub";

const REWARD_ICON_SIZE = 60;

const CLAIM_STATUS_CARD_CLASS: Record<EventCardRewardClaimStatus, string> = {
  claimed:
    "border-2 border-owned bg-zinc-950/40",
  claimable:
    "border-2 border-emerald-400/90 bg-emerald-950/20",
  locked: "border border-hairline bg-panel/85",
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
    <div className="relative my-2 size-[60px] shrink-0 overflow-hidden border border-white/20 bg-zinc-900">
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
      className={`flex w-[7.75rem] shrink-0 snap-start flex-col items-center p-3 text-center ${CLAIM_STATUS_CARD_CLASS[status]}`}
    >
      <p className="ui-label text-[11px]!">Rank {reward.rank}</p>
      {href ? (
        <Link
          href={href}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
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
    <section>
      <SectionHeading
        title="Event card"
        note={
          showClaimStatus ? (
            <>
              <span className="text-amber-300">Gold</span> claimed · <span className="text-emerald-300">Green</span>{" "}
              ready to claim
            </>
          ) : (
            "Reward track"
          )
        }
      />
      <div className="min-w-0">
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
      </div>
    </section>
  );
}
