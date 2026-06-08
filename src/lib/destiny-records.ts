import type { BungieUserSession } from "@/lib/bungie";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import { getBungieApiKey } from "@/lib/env";
import {
  mergeObjectiveProgress,
  mergeRecordState,
} from "@/lib/triumphs/record-progress";
import {
  EMPTY_TRIUMPH_STRING_VARIABLES,
  type RecordInstance,
  type RecordObjectiveProgress,
  type TriumphStringVariables,
} from "@/types/triumph";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type ApiObjectiveProgress = {
  objectiveHash: number;
  progress?: number;
  completionValue?: number;
  complete?: boolean;
};

type ApiRecordInstance = {
  state: number;
  objectives?: ApiObjectiveProgress[];
  /** Stepped triumphs (e.g. 3/10/20) — progress lives here, not in objectives. */
  intervalObjectives?: ApiObjectiveProgress[];
};

type ProfileRecordsData = {
  score?: number;
  activeScore?: number;
  lifetimeScore?: number;
  records?: Record<string, ApiRecordInstance>;
};

type ProfileRecordsResponse = {
  profileRecords?: {
    data?: ProfileRecordsData;
  };
  characterRecords?: {
    data?: Record<string, { records?: Record<string, ApiRecordInstance> }>;
  };
  profileStringVariables?: {
    data?: { integerValuesByHash?: Record<string, number> };
  };
  characterStringVariables?: {
    data?: Record<string, { integerValuesByHash?: Record<string, number> }>;
  };
};

export type TriumphProfileData = {
  instances: Map<string, RecordInstance>;
  stringVariables: TriumphStringVariables;
};

export type TriumphScores = {
  activeScore: number;
  lifetimeScore: number;
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

export { resolveDestinyMembership } from "@/lib/destiny-membership";

function normalizeObjectives(
  objectives: ApiObjectiveProgress[] | undefined,
): RecordObjectiveProgress[] {
  return (objectives ?? []).map((objective) => ({
    objectiveHash: String(objective.objectiveHash),
    progress: objective.progress ?? 0,
    completionValue: objective.completionValue ?? 1,
    complete: Boolean(objective.complete),
  }));
}

function apiRecordObjectives(
  record: ApiRecordInstance,
): RecordObjectiveProgress[] {
  return normalizeObjectives([
    ...(record.objectives ?? []),
    ...(record.intervalObjectives ?? []),
  ]);
}

function mergeRecordInstances(
  target: Map<string, RecordInstance>,
  records: Record<string, ApiRecordInstance> | undefined,
) {
  for (const [recordHash, record] of Object.entries(records ?? {})) {
    const existing = target.get(recordHash);
    if (!existing) {
      target.set(recordHash, {
        state: record.state,
        objectives: apiRecordObjectives(record),
      });
      continue;
    }

    target.set(recordHash, {
      state: mergeRecordState(existing.state, record.state),
      objectives: mergeObjectiveProgress(
        existing.objectives,
        apiRecordObjectives(record),
      ),
    });
  }
}

function readTriumphScores(data: ProfileRecordsData | undefined): TriumphScores | null {
  if (!data) return null;

  return {
    activeScore: data.activeScore ?? data.score ?? 0,
    lifetimeScore: data.lifetimeScore ?? 0,
  };
}

/** Active and lifetime triumph score from the Bungie profile. */
export async function fetchTriumphScores(
  session: BungieUserSession,
): Promise<TriumphScores | null> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return null;

  const profile = await bungieGet<ProfileRecordsResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=900`,
    session.accessToken,
  );

  return readTriumphScores(profile.profileRecords?.data);
}

function readStringVariables(
  profile: ProfileRecordsResponse,
): TriumphStringVariables {
  const stringVariables: TriumphStringVariables = {
    profile: {},
    byCharacter: {},
  };

  for (const [hash, value] of Object.entries(
    profile.profileStringVariables?.data?.integerValuesByHash ?? {},
  )) {
    stringVariables.profile[hash] = value;
  }

  for (const [characterId, data] of Object.entries(
    profile.characterStringVariables?.data ?? {},
  )) {
    stringVariables.byCharacter[characterId] = {};
    for (const [hash, value] of Object.entries(data.integerValuesByHash ?? {})) {
      stringVariables.byCharacter[characterId][hash] = value;
    }
  }

  return stringVariables;
}

/** Profile + character record progress for triumphs and titles. */
export async function fetchRecordInstances(
  session: BungieUserSession,
): Promise<TriumphProfileData> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) {
    return {
      instances: new Map(),
      stringVariables: EMPTY_TRIUMPH_STRING_VARIABLES,
    };
  }

  const profile = await bungieGet<ProfileRecordsResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=900,1200`,
    session.accessToken,
  );

  const instances = new Map<string, RecordInstance>();
  mergeRecordInstances(instances, profile.profileRecords?.data?.records);

  for (const charRecords of Object.values(profile.characterRecords?.data ?? {})) {
    mergeRecordInstances(instances, charRecords.records);
  }

  return {
    instances,
    stringVariables: readStringVariables(profile),
  };
}

/** @deprecated Use fetchRecordInstances — state-only map for legacy callers. */
export async function fetchRecordStates(
  session: BungieUserSession,
): Promise<Map<string, number>> {
  const { instances } = await fetchRecordInstances(session);
  return new Map(
    [...instances.entries()].map(([hash, instance]) => [hash, instance.state]),
  );
}

export function serializeTriumphProfileData(
  data: TriumphProfileData,
): {
  recordInstances: Record<string, RecordInstance>;
  stringVariables: TriumphStringVariables;
} {
  return {
    recordInstances: Object.fromEntries(data.instances),
    stringVariables: data.stringVariables,
  };
}

export function serializeRecordInstances(
  instances: Map<string, RecordInstance>,
): Record<string, RecordInstance> {
  return Object.fromEntries(instances);
}

export function deserializeRecordInstances(
  instances: Record<string, RecordInstance>,
): Map<string, RecordInstance> {
  return new Map(Object.entries(instances));
}
