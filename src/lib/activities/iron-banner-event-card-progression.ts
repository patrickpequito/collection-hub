import { IRON_BANNER_EVENT_CARD_REWARDS } from "@/data/activities/iron-banner-event-card";
import { fetchDestinyProfile } from "@/lib/destiny-inventory";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import type { BungieUserSession } from "@/lib/bungie";
import type { EventCardRewardClaimStatus } from "@/types/activity-hub";

/** Iron Banner Event Card reward progression (DestinyProgressionDefinition). */
export const IRON_BANNER_EVENT_CARD_PROGRESSION_HASH = "3010416058";

const CHARACTER_PROGRESSIONS_COMPONENT = 202;

const REWARD_CLAIMED = 4;
const REWARD_EARNED = 2;
const REWARD_CLAIM_ALLOWED = 8;

type ApiDestinyProgression = {
  level?: number;
  rewardItemStates?: number[];
};

function claimStatusFromFlags(flags: number): EventCardRewardClaimStatus {
  if (flags & REWARD_CLAIMED) return "claimed";
  if (flags & REWARD_CLAIM_ALLOWED) return "claimable";
  if (flags & REWARD_EARNED) return "claimable";
  return "locked";
}

function resolveIronBannerProgression(
  characterProgressions: Record<string, { progressions?: Record<string, ApiDestinyProgression> }> | undefined,
): ApiDestinyProgression | null {
  if (!characterProgressions) return null;

  for (const character of Object.values(characterProgressions)) {
    const progression =
      character.progressions?.[IRON_BANNER_EVENT_CARD_PROGRESSION_HASH];
    if (progression) return progression;
  }

  return null;
}

export function resolveIronBannerEventCardClaimStatuses(
  progression: ApiDestinyProgression | null,
): Record<number, EventCardRewardClaimStatus> {
  const level = progression?.level ?? 0;
  const rewardItemStates = progression?.rewardItemStates ?? [];
  const statuses: Record<number, EventCardRewardClaimStatus> = {};

  for (const reward of IRON_BANNER_EVENT_CARD_REWARDS) {
    const index = reward.progressionRewardIndex;
    if (level < reward.rank) {
      statuses[reward.rank] = "locked";
      continue;
    }

    const flags = rewardItemStates[index] ?? 0;
    statuses[reward.rank] = claimStatusFromFlags(flags);
  }

  return statuses;
}

export async function fetchIronBannerEventCardClaimStatuses(
  session: BungieUserSession,
): Promise<Record<number, EventCardRewardClaimStatus> | null> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return null;

  const profile = await fetchDestinyProfile(session, membership, [
    CHARACTER_PROGRESSIONS_COMPONENT,
  ]);

  const progression = resolveIronBannerProgression(
    profile.characterProgressions?.data,
  );

  return resolveIronBannerEventCardClaimStatuses(progression);
}
