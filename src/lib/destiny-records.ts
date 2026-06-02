import type { BungieUserSession } from "@/lib/bungie";
import { getBungieApiKey } from "@/lib/env";
import {
  mergeObjectiveProgress,
  mergeRecordState,
} from "@/lib/triumphs/record-progress";
import type {
  RecordInstance,
  RecordObjectiveProgress,
} from "@/types/triumph";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type DestinyMembership = {
  membershipId: string;
  membershipType: number;
  crossSaveOverride?: number;
};

type MembershipsResponse = {
  destinyMemberships: DestinyMembership[];
  primaryMembershipId?: string | null;
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

type ProfileRecordsResponse = {
  profileRecords?: {
    data?: { records?: Record<string, ApiRecordInstance> };
  };
  characterRecords?: {
    data?: Record<string, { records?: Record<string, ApiRecordInstance> }>;
  };
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

function pickDestinyMembership(
  memberships: DestinyMembership[],
  primaryMembershipId?: string | null,
): DestinyMembership | null {
  if (!memberships.length) return null;

  if (primaryMembershipId) {
    const primary = memberships.find(
      (m) => m.membershipId === primaryMembershipId,
    );
    if (primary) return primary;
  }

  const crossSave = memberships.find((m) => m.crossSaveOverride !== undefined);
  if (crossSave?.crossSaveOverride) {
    const active = memberships.find(
      (m) => m.membershipId === String(crossSave.crossSaveOverride),
    );
    if (active) return active;
  }

  return memberships[0];
}

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

/** Profile + character record progress for triumphs and titles. */
export async function fetchRecordInstances(
  session: BungieUserSession,
): Promise<Map<string, RecordInstance>> {
  const memberships = await bungieGet<MembershipsResponse>(
    "/Platform/User/GetMembershipsForCurrentUser/",
    session.accessToken,
  );

  const membership = pickDestinyMembership(
    memberships.destinyMemberships ?? [],
    memberships.primaryMembershipId,
  );

  if (!membership) {
    return new Map();
  }

  const profile = await bungieGet<ProfileRecordsResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=900`,
    session.accessToken,
  );

  const instances = new Map<string, RecordInstance>();
  mergeRecordInstances(instances, profile.profileRecords?.data?.records);

  for (const charRecords of Object.values(profile.characterRecords?.data ?? {})) {
    mergeRecordInstances(instances, charRecords.records);
  }

  return instances;
}

/** @deprecated Use fetchRecordInstances — state-only map for legacy callers. */
export async function fetchRecordStates(
  session: BungieUserSession,
): Promise<Map<string, number>> {
  const instances = await fetchRecordInstances(session);
  return new Map(
    [...instances.entries()].map(([hash, instance]) => [hash, instance.state]),
  );
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
