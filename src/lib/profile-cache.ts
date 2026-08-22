import type { RecordInstance, TriumphStringVariables } from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

export const PROFILE_CACHE_VERSION = 1 as const;

export type ProfileCacheSnapshot = {
  version: typeof PROFILE_CACHE_VERSION;
  membershipId: string;
  syncedAt: number;
  ownedItemHashes: string[];
  recordInstances: Record<string, RecordInstance>;
  stringVariables: TriumphStringVariables;
  activityCompletions: Record<string, number>;
  questCompletions: Record<string, boolean>;
  checklists: Record<string, Record<string, boolean>>;
};

function cacheKey(membershipId: string): string {
  return `d2-collector:profile:v${PROFILE_CACHE_VERSION}:${membershipId}`;
}

export function readProfileCache(
  membershipId: string,
): ProfileCacheSnapshot | null {
  if (typeof window === "undefined" || !membershipId) return null;

  try {
    const raw = localStorage.getItem(cacheKey(membershipId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ProfileCacheSnapshot;
    if (
      parsed.version !== PROFILE_CACHE_VERSION ||
      parsed.membershipId !== membershipId
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeProfileCache(snapshot: ProfileCacheSnapshot): void {
  if (typeof window === "undefined" || !snapshot.membershipId) return;

  try {
    localStorage.setItem(cacheKey(snapshot.membershipId), JSON.stringify(snapshot));
  } catch {
    // Quota exceeded — cache is optional; in-memory state still works.
  }
}

export function clearProfileCache(membershipId?: string): void {
  if (typeof window === "undefined") return;

  if (membershipId) {
    localStorage.removeItem(cacheKey(membershipId));
    return;
  }

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("d2-collector:profile:v")) {
      localStorage.removeItem(key);
    }
  }
}

export function emptyProfileCacheSnapshot(
  membershipId: string,
): ProfileCacheSnapshot {
  return {
    version: PROFILE_CACHE_VERSION,
    membershipId,
    syncedAt: 0,
    ownedItemHashes: [],
    recordInstances: {},
    stringVariables: EMPTY_TRIUMPH_STRING_VARIABLES,
    activityCompletions: {},
    questCompletions: {},
    checklists: {},
  };
}

export function mergeProfileCache(
  current: ProfileCacheSnapshot,
  patch: Partial<
    Omit<ProfileCacheSnapshot, "version" | "membershipId" | "syncedAt">
  >,
): ProfileCacheSnapshot {
  return {
    ...current,
    ...patch,
    activityCompletions: {
      ...current.activityCompletions,
      ...patch.activityCompletions,
    },
    questCompletions: {
      ...current.questCompletions,
      ...patch.questCompletions,
    },
    checklists: patch.checklists ?? current.checklists,
    recordInstances: patch.recordInstances ?? current.recordInstances,
    stringVariables: patch.stringVariables ?? current.stringVariables,
    ownedItemHashes: patch.ownedItemHashes ?? current.ownedItemHashes,
    syncedAt: Date.now(),
  };
}
