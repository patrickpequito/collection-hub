import type { BungieUserSession } from "@/lib/bungie";
import { getBungieApiKey } from "@/lib/env";
import { resolveDestinyMembership } from "@/lib/destiny-records";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type ProfileCharactersResponse = {
  characters?: {
    data?: Record<string, unknown>;
  };
};

type AggregateActivityStatsResponse = {
  activities?: Array<{
    activityHash: number;
    values?: Record<string, { basic?: { value?: number } }>;
  }>;
};

/** Activity hashes whose completions count toward each raid difficulty. */
export const RAID_COMPLETION_ACTIVITY_HASHES = {
  "vault-of-glass": {
    normal: [3881495763, 1485585878],
    master: [3022541210],
  },
  "crotas-end": {
    normal: [107319834, 1566480315],
    master: [1507509200],
  },
  "kings-fall": {
    normal: [1374392663, 2897223272],
    master: [3257594522],
  },
  "last-wish": {
    normal: [2122313384, 1661734046],
    master: [],
  },
  prophecy: {
    normal: [1077850348, 4148187374, 3637651331, 1788465402],
    master: [],
  },
} as const;

export type RaidCompletionSlug = keyof typeof RAID_COMPLETION_ACTIVITY_HASHES;

export type RaidCompletions = {
  normal: number;
  master: number;
};

function bungieHeaders(accessToken: string) {
  return {
    "X-API-Key": getBungieApiKey(),
    Authorization: `Bearer ${accessToken}`,
  };
}

async function bungieGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${BUNGIE_ORIGIN}${path}`, {
    headers: bungieHeaders(accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bungie API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as BungieResponse<T>;
  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || "Unexpected Bungie API response");
  }

  return data.Response;
}

function readActivityCompletions(
  activities: AggregateActivityStatsResponse["activities"],
  activityHashes: readonly number[],
): number {
  const hashSet = new Set(activityHashes);
  let total = 0;

  for (const activity of activities ?? []) {
    if (!hashSet.has(activity.activityHash)) continue;
    total += activity.values?.activityCompletions?.basic?.value ?? 0;
  }

  return total;
}

/** Raid completions by difficulty across all characters for a supported activity page. */
export async function fetchRaidCompletions(
  session: BungieUserSession,
  slug: RaidCompletionSlug,
): Promise<RaidCompletions> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) {
    return { normal: 0, master: 0 };
  }

  const profile = await bungieGet<ProfileCharactersResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=200`,
    session.accessToken,
  );

  const characterIds = Object.keys(profile.characters?.data ?? {});
  if (!characterIds.length) {
    return { normal: 0, master: 0 };
  }

  const difficultyHashes = RAID_COMPLETION_ACTIVITY_HASHES[slug];
  const statsByCharacter = await Promise.all(
    characterIds.map((characterId) =>
      bungieGet<AggregateActivityStatsResponse>(
        `/Platform/Destiny2/${membership.membershipType}/Account/${membership.membershipId}/Character/${characterId}/Stats/AggregateActivityStats/`,
        session.accessToken,
      ),
    ),
  );

  return statsByCharacter.reduce<RaidCompletions>(
    (totals, stats) => ({
      normal:
        totals.normal +
        readActivityCompletions(stats.activities, difficultyHashes.normal),
      master:
        totals.master +
        readActivityCompletions(stats.activities, difficultyHashes.master),
    }),
    { normal: 0, master: 0 },
  );
}

export function isRaidCompletionSlug(slug: string): slug is RaidCompletionSlug {
  return slug in RAID_COMPLETION_ACTIVITY_HASHES;
}

export function raidHasMasterTier(slug: RaidCompletionSlug): boolean {
  return RAID_COMPLETION_ACTIVITY_HASHES[slug].master.length > 0;
}
