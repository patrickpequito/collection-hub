import type { BungieUserSession } from "@/lib/bungie";
import { getBungieApiKey } from "@/lib/env";
import {
  resolveDestinyMembership,
  type DestinyMembership,
} from "@/lib/destiny-membership";

const BUNGIE_ORIGIN = "https://www.bungie.net";

/** Raid, AllPvE (legacy dungeons), and Dungeon activity modes. */
const COMPLETION_HISTORY_MODES = [4, 7, 82] as const;
const ACTIVITIES_PAGE_SIZE = 250;
const MAX_ACTIVITY_PAGES = 80;
/** Skip the fast path for a while after Bungie returns an error. */
const AGGREGATE_UNHEALTHY_TTL_MS = 30 * 60 * 1000;

let aggregateEndpointHealthy: boolean | null = null;
let aggregateHealthCheckedAt = 0;

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

type ActivityHistoryEntry = {
  activityDetails?: {
    referenceId?: number;
    directorActivityHash?: number;
    instanceId?: string;
  };
  values?: Record<string, { basic?: { value?: number } }>;
};

type ActivityHistoryResponse = {
  activities?: ActivityHistoryEntry[];
};

type AggregateActivityStatsResponse = {
  activities?: Array<{
    activityHash: number;
    values?: Record<string, { basic?: { value?: number } }>;
  }>;
};

/** Activity hashes whose completions count toward each raid difficulty. */
export const RAID_COMPLETION_ACTIVITY_HASHES = {
  "the-pantheon": {
    normal: [
      43862588, 145874766, 206811036, 796488315, 1566552947, 1953549041,
      3975235718, 4169648176, 4169648177, 4169648179, 4169648182,
    ],
    master: [],
  },
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
  leviathan: {
    normal: [
      89727599, 287649202, 1699948563, 1875726950, 3916343513, 4039317196,
      2693136600, 2693136601, 2693136602, 2693136603, 2693136604, 2693136605,
    ],
    master: [
      417231112, 508802457, 757116822, 771164842, 1685065161, 1800508819,
      2449714930, 3446541099, 3857338478, 3879860661, 3912437239, 4206123728,
    ],
  },
  "scourge-of-the-past": {
    normal: [548750096, 2812525063],
    master: [],
  },
  "crown-of-sorrow": {
    normal: [960175301, 3333172150],
    master: [],
  },
  "eater-of-worlds": {
    normal: [2164432138, 3089205900],
    master: [809170886],
  },
  "spire-of-stars": {
    normal: [119944200, 3004605630],
    master: [3213556450],
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

  const data = (await response.json()) as BungieResponse<T>;
  if (!response.ok || data.ErrorCode !== 1) {
    const detail =
      data.Message ||
      (response.ok ? "Unexpected Bungie API response" : `HTTP ${response.status}`);
    throw new Error(detail);
  }

  return data.Response;
}

function shouldTryAggregateEndpoint(): boolean {
  if (aggregateEndpointHealthy !== false) {
    return true;
  }

  return Date.now() - aggregateHealthCheckedAt >= AGGREGATE_UNHEALTHY_TTL_MS;
}

function markAggregateEndpointHealthy() {
  aggregateEndpointHealthy = true;
  aggregateHealthCheckedAt = Date.now();
}

function markAggregateEndpointUnhealthy() {
  aggregateEndpointHealthy = false;
  aggregateHealthCheckedAt = Date.now();
}

function aggregateStatsToCountMap(
  stats: AggregateActivityStatsResponse,
): Map<number, number> {
  const counts = new Map<number, number>();

  for (const activity of stats.activities ?? []) {
    const completions = activity.values?.activityCompletions?.basic?.value ?? 0;
    if (completions > 0) {
      counts.set(activity.activityHash, completions);
    }
  }

  return counts;
}

async function fetchAggregateCountsForCharacter(
  membership: DestinyMembership,
  characterId: string,
  accessToken: string,
): Promise<Map<number, number> | null> {
  try {
    const stats = await bungieGet<AggregateActivityStatsResponse>(
      `/Platform/Destiny2/${membership.membershipType}/Account/${membership.membershipId}/Character/${characterId}/Stats/AggregateActivityStats/`,
      accessToken,
    );
    return aggregateStatsToCountMap(stats);
  } catch {
    return null;
  }
}

function isCompletedRun(entry: ActivityHistoryEntry): boolean {
  return entry.values?.completed?.basic?.value === 1;
}

function activityReferenceHash(entry: ActivityHistoryEntry): number | null {
  const referenceId = entry.activityDetails?.referenceId;
  if (typeof referenceId === "number" && referenceId > 0) {
    return referenceId;
  }

  const directorHash = entry.activityDetails?.directorActivityHash;
  if (typeof directorHash === "number" && directorHash > 0) {
    return directorHash;
  }

  return null;
}

async function fetchModeActivityHistory(
  membership: DestinyMembership,
  characterId: string,
  accessToken: string,
  mode: (typeof COMPLETION_HISTORY_MODES)[number],
): Promise<ActivityHistoryEntry[]> {
  const entries: ActivityHistoryEntry[] = [];

  for (let page = 0; page < MAX_ACTIVITY_PAGES; page += 1) {
    const response = await bungieGet<ActivityHistoryResponse>(
      `/Platform/Destiny2/${membership.membershipType}/Account/${membership.membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&count=${ACTIVITIES_PAGE_SIZE}&page=${page}`,
      accessToken,
    );

    const pageEntries = response.activities ?? [];
    entries.push(...pageEntries);

    if (pageEntries.length < ACTIVITIES_PAGE_SIZE) {
      break;
    }
  }

  return entries;
}

function countCompletedActivities(
  entries: ActivityHistoryEntry[],
  seenInstances: Set<string>,
): Map<number, number> {
  const counts = new Map<number, number>();

  for (const entry of entries) {
    if (!isCompletedRun(entry)) continue;

    const instanceId = entry.activityDetails?.instanceId;
    if (instanceId) {
      if (seenInstances.has(instanceId)) continue;
      seenInstances.add(instanceId);
    }

    const activityHash = activityReferenceHash(entry);
    if (!activityHash) continue;

    counts.set(activityHash, (counts.get(activityHash) ?? 0) + 1);
  }

  return counts;
}

async function fetchCompletionCountsForCharacter(
  membership: DestinyMembership,
  characterId: string,
  accessToken: string,
): Promise<Map<number, number>> {
  const seenInstances = new Set<string>();
  const totals = new Map<number, number>();

  for (const mode of COMPLETION_HISTORY_MODES) {
    const entries = await fetchModeActivityHistory(
      membership,
      characterId,
      accessToken,
      mode,
    );
    const modeCounts = countCompletedActivities(entries, seenInstances);

    for (const [activityHash, count] of modeCounts) {
      totals.set(activityHash, (totals.get(activityHash) ?? 0) + count);
    }
  }

  return totals;
}

async function fetchHistoryCountsByCharacter(
  membership: DestinyMembership,
  characterIds: string[],
  accessToken: string,
): Promise<Map<number, number>[]> {
  return Promise.all(
    characterIds.map((characterId) =>
      fetchCompletionCountsForCharacter(membership, characterId, accessToken),
    ),
  );
}

async function fetchAggregateCountsByCharacter(
  membership: DestinyMembership,
  characterIds: string[],
  accessToken: string,
): Promise<Map<number, number>[] | null> {
  const probe = await fetchAggregateCountsForCharacter(
    membership,
    characterIds[0],
    accessToken,
  );
  if (!probe) {
    return null;
  }

  if (characterIds.length === 1) {
    return [probe];
  }

  const rest = await Promise.all(
    characterIds.slice(1).map((characterId) =>
      fetchAggregateCountsForCharacter(membership, characterId, accessToken),
    ),
  );

  if (rest.some((counts) => counts === null)) {
    return null;
  }

  return [probe, ...(rest as Map<number, number>[])];
}

async function fetchCompletionCountsByCharacter(session: BungieUserSession) {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return null;

  const profile = await bungieGet<ProfileCharactersResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=200`,
    session.accessToken,
  );

  const characterIds = Object.keys(profile.characters?.data ?? {});
  if (!characterIds.length) return null;

  if (shouldTryAggregateEndpoint()) {
    const aggregateCounts = await fetchAggregateCountsByCharacter(
      membership,
      characterIds,
      session.accessToken,
    );

    if (aggregateCounts) {
      markAggregateEndpointHealthy();
      return aggregateCounts;
    }

    markAggregateEndpointUnhealthy();
  }

  return fetchHistoryCountsByCharacter(
    membership,
    characterIds,
    session.accessToken,
  );
}

function readActivityCompletions(
  counts: Map<number, number>,
  activityHashes: readonly number[],
): number {
  let total = 0;

  for (const activityHash of activityHashes) {
    total += counts.get(activityHash) ?? 0;
  }

  return total;
}

function sumCompletionsForSlug(
  countsByCharacter: Map<number, number>[],
  slug: RaidCompletionSlug,
): RaidCompletions {
  const difficultyHashes = RAID_COMPLETION_ACTIVITY_HASHES[slug];

  return countsByCharacter.reduce<RaidCompletions>(
    (totals, counts) => ({
      normal:
        totals.normal +
        readActivityCompletions(counts, difficultyHashes.normal),
      master:
        totals.master +
        readActivityCompletions(counts, difficultyHashes.master),
    }),
    { normal: 0, master: 0 },
  );
}

/** All tracked activity completions (fast aggregate path, history fallback). */
export async function fetchAllActivityCompletions(
  session: BungieUserSession,
): Promise<Partial<Record<RaidCompletionSlug, RaidCompletions>>> {
  const countsByCharacter = await fetchCompletionCountsByCharacter(session);
  if (!countsByCharacter) return {};

  const result: Partial<Record<RaidCompletionSlug, RaidCompletions>> = {};
  for (const slug of Object.keys(
    RAID_COMPLETION_ACTIVITY_HASHES,
  ) as RaidCompletionSlug[]) {
    result[slug] = sumCompletionsForSlug(countsByCharacter, slug);
  }
  return result;
}

/** Raid completions by difficulty across all characters for a supported activity page. */
export async function fetchRaidCompletions(
  session: BungieUserSession,
  slug: RaidCompletionSlug,
): Promise<RaidCompletions> {
  const countsByCharacter = await fetchCompletionCountsByCharacter(session);
  if (!countsByCharacter) {
    return { normal: 0, master: 0 };
  }

  return sumCompletionsForSlug(countsByCharacter, slug);
}

export function isRaidCompletionSlug(slug: string): slug is RaidCompletionSlug {
  return slug in RAID_COMPLETION_ACTIVITY_HASHES;
}

export function raidHasMasterTier(slug: RaidCompletionSlug): boolean {
  return RAID_COMPLETION_ACTIVITY_HASHES[slug].master.length > 0;
}
