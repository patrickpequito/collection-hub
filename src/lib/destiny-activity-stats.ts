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
  "garden-of-salvation": {
    normal: [1042180643, 2497200493, 2659723068, 3458480158, 3845997235],
    master: [],
  },
  "deep-stone-crypt": {
    normal: [910380154],
    master: [3976949817],
  },
  "vow-of-the-disciple": {
    normal: [1441982566, 2906950631, 4156879541],
    master: [3889634515, 4217492330],
  },
  "root-of-nightmares": {
    normal: [2381413764],
    master: [2918919505],
  },
  "salvations-edge": {
    normal: [940375169, 1541433876, 2192826039],
    master: [4129614942],
  },
  "the-desert-perpetual": {
    normal: [1044919065, 3817322389],
    master: [],
  },
  prophecy: {
    normal: [1077850348, 4148187374, 3637651331, 1788465402],
    master: [],
  },
  "pit-of-heresy": {
    normal: [1375089621, 2582501063],
    master: [785700673, 2559374374, 2559374375],
  },
  "the-shattered-throne": {
    normal: [2032534090],
    master: [],
  },
  "grasp-of-avarice": {
    normal: [4078656646],
    master: [1112917203, 3774021532],
  },
  duality: {
    normal: [2823159265],
    master: [1668217731, 3012587626],
  },
  "spire-of-the-watcher": {
    normal: [1262462921],
    master: [1801496203, 2296818662],
  },
  "ghosts-of-the-deep": {
    normal: [313828469],
    master: [2716998124],
  },
  "warlords-ruin": {
    normal: [2004855007],
    master: [2534833093],
  },
  "vespers-host": {
    normal: [300092127, 1915770060, 3492566689],
    master: [4293676253],
  },
  "sundered-doctrine": {
    normal: [247869137, 3834447244],
    master: [3521648250],
  },
  equilibrium: {
    normal: [2727361621],
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
