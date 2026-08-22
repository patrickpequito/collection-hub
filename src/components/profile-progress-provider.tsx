"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { QuestCompletionTarget } from "@/lib/destiny-quest-progress";
import { serializeQuestCompletionTargets } from "@/lib/destiny-quest-progress";
import {
  emptyProfileCacheSnapshot,
  mergeProfileCache,
  readProfileCache,
  writeProfileCache,
  type ProfileCacheSnapshot,
} from "@/lib/profile-cache";
import type { RecordInstance, TriumphStringVariables } from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

type ProfileProgressContextValue = {
  membershipId: string | null;
  syncedAt: number | null;
  ownedItemHashes: Set<string>;
  inventoryError: string | null;
  recordInstances: Record<string, RecordInstance>;
  stringVariables: TriumphStringVariables;
  activityCompletions: Record<string, number>;
  questCompletions: Record<string, boolean>;
  checklists: Record<string, Record<string, boolean>>;
  registerActivityHashes: (hashes: readonly string[]) => void;
  registerQuestTargets: (targets: readonly QuestCompletionTarget[]) => void;
  requestChecklists: () => void;
};

const ProfileProgressContext = createContext<ProfileProgressContextValue | null>(
  null,
);

export { ProfileProgressContext };

function useProfileProgressContext(): ProfileProgressContextValue {
  const value = useContext(ProfileProgressContext);
  if (!value) {
    throw new Error("ProfileProgressProvider is missing");
  }
  return value;
}

type ProfileProgressProviderProps = {
  children: ReactNode;
  signedIn: boolean;
  membershipId: string | null;
};

export function ProfileProgressProvider({
  children,
  signedIn,
  membershipId,
}: ProfileProgressProviderProps) {
  const [snapshot, setSnapshot] = useState<ProfileCacheSnapshot | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const activityHashRegistryRef = useRef(new Set<string>());
  const questTargetRegistryRef = useRef(new Map<string, QuestCompletionTarget>());
  const checklistsRequestedRef = useRef(false);
  const activityFetchTimerRef = useRef<number | null>(null);
  const questFetchTimerRef = useRef<number | null>(null);
  const activityFetchInFlightRef = useRef(false);
  const questFetchInFlightRef = useRef(false);

  const patchSnapshot = useCallback(
    (patch: Partial<
      Omit<ProfileCacheSnapshot, "version" | "membershipId" | "syncedAt">
    >) => {
      if (!membershipId) return;
      setSnapshot((current) => {
        const base =
          current ?? emptyProfileCacheSnapshot(membershipId);
        const next = mergeProfileCache(base, patch);
        writeProfileCache(next);
        return next;
      });
    },
    [membershipId],
  );

  useEffect(() => {
    if (!signedIn || !membershipId) {
      setSnapshot(null);
      setInventoryError(null);
      activityHashRegistryRef.current.clear();
      questTargetRegistryRef.current.clear();
      checklistsRequestedRef.current = false;
      return;
    }

    const cached = readProfileCache(membershipId);
    setSnapshot(cached ?? emptyProfileCacheSnapshot(membershipId));
    setInventoryError(null);
  }, [membershipId, signedIn]);

  useEffect(() => {
    if (!signedIn || !membershipId) return;

    let cancelled = false;

    fetch("/api/owned-items", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          itemHashes: string[];
          error: string | null;
        };
        if (cancelled) return;
        setInventoryError(payload.error);
        if (!payload.error) {
          patchSnapshot({ ownedItemHashes: payload.itemHashes });
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setInventoryError(
          error instanceof Error ? error.message : "Failed to load inventory",
        );
      });

    fetch("/api/triumphs/profile", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          recordInstances?: Record<string, RecordInstance>;
          stringVariables?: TriumphStringVariables;
          error?: string | null;
        };
        if (cancelled || payload.error) return;
        patchSnapshot({
          recordInstances: payload.recordInstances ?? {},
          stringVariables:
            payload.stringVariables ?? EMPTY_TRIUMPH_STRING_VARIABLES,
        });
      })
      .catch(() => {
        // Keep cached triumph data when refresh fails.
      });

    return () => {
      cancelled = true;
    };
  }, [membershipId, patchSnapshot, signedIn]);

  const flushActivityCompletions = useCallback(() => {
    if (!signedIn || !membershipId || activityFetchInFlightRef.current) return;

    const hashes = [...activityHashRegistryRef.current];
    if (!hashes.length) return;

    activityFetchInFlightRef.current = true;
    const params = new URLSearchParams({ hashes: hashes.join(",") });

    fetch(`/api/profile/activity-completions?${params}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          completions?: Record<string, number>;
        };
        patchSnapshot({ activityCompletions: payload.completions ?? {} });
      })
      .catch(() => {
        // Keep cached activity completions when refresh fails.
      })
      .finally(() => {
        activityFetchInFlightRef.current = false;
        if (activityHashRegistryRef.current.size > hashes.length) {
          flushActivityCompletions();
        }
      });
  }, [membershipId, patchSnapshot, signedIn]);

  const scheduleActivityCompletions = useCallback(() => {
    if (activityFetchTimerRef.current != null) {
      window.clearTimeout(activityFetchTimerRef.current);
    }
    activityFetchTimerRef.current = window.setTimeout(() => {
      activityFetchTimerRef.current = null;
      flushActivityCompletions();
    }, 0);
  }, [flushActivityCompletions]);

  const flushQuestCompletions = useCallback(() => {
    if (!signedIn || !membershipId || questFetchInFlightRef.current) return;

    const targets = [...questTargetRegistryRef.current.values()];
    if (!targets.length) return;

    questFetchInFlightRef.current = true;
    const params = new URLSearchParams({
      targets: serializeQuestCompletionTargets(targets),
    });

    fetch(`/api/profile/quest-completions?${params}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          completed?: Record<string, boolean>;
        };
        patchSnapshot({ questCompletions: payload.completed ?? {} });
      })
      .catch(() => {
        // Keep cached quest completions when refresh fails.
      })
      .finally(() => {
        questFetchInFlightRef.current = false;
        if (questTargetRegistryRef.current.size > targets.length) {
          flushQuestCompletions();
        }
      });
  }, [membershipId, patchSnapshot, signedIn]);

  const scheduleQuestCompletions = useCallback(() => {
    if (questFetchTimerRef.current != null) {
      window.clearTimeout(questFetchTimerRef.current);
    }
    questFetchTimerRef.current = window.setTimeout(() => {
      questFetchTimerRef.current = null;
      flushQuestCompletions();
    }, 0);
  }, [flushQuestCompletions]);

  const registerActivityHashes = useCallback(
    (hashes: readonly string[]) => {
      if (!signedIn) return;
      for (const hash of hashes) {
        if (hash) activityHashRegistryRef.current.add(hash);
      }
      scheduleActivityCompletions();
    },
    [scheduleActivityCompletions, signedIn],
  );

  const registerQuestTargets = useCallback(
    (targets: readonly QuestCompletionTarget[]) => {
      if (!signedIn) return;
      for (const target of targets) {
        if (!target.questHash) continue;
        questTargetRegistryRef.current.set(target.questHash, target);
      }
      scheduleQuestCompletions();
    },
    [scheduleQuestCompletions, signedIn],
  );

  const requestChecklists = useCallback(() => {
    if (!signedIn || !membershipId || checklistsRequestedRef.current) return;
    checklistsRequestedRef.current = true;

    fetch("/api/profile/checklists", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          checklists?: Record<string, Record<string, boolean>>;
        };
        patchSnapshot({ checklists: payload.checklists ?? {} });
      })
      .catch(() => {
        checklistsRequestedRef.current = false;
      });
  }, [membershipId, patchSnapshot, signedIn]);

  const ownedItemHashes = useMemo(
    () => new Set(snapshot?.ownedItemHashes ?? []),
    [snapshot?.ownedItemHashes],
  );

  const value = useMemo<ProfileProgressContextValue>(
    () => ({
      membershipId,
      syncedAt: snapshot?.syncedAt ?? null,
      ownedItemHashes,
      inventoryError,
      recordInstances: snapshot?.recordInstances ?? {},
      stringVariables: snapshot?.stringVariables ?? EMPTY_TRIUMPH_STRING_VARIABLES,
      activityCompletions: snapshot?.activityCompletions ?? {},
      questCompletions: snapshot?.questCompletions ?? {},
      checklists: snapshot?.checklists ?? {},
      registerActivityHashes,
      registerQuestTargets,
      requestChecklists,
    }),
    [
      membershipId,
      snapshot?.syncedAt,
      snapshot?.recordInstances,
      snapshot?.stringVariables,
      snapshot?.activityCompletions,
      snapshot?.questCompletions,
      snapshot?.checklists,
      ownedItemHashes,
      inventoryError,
      registerActivityHashes,
      registerQuestTargets,
      requestChecklists,
    ],
  );

  return (
    <ProfileProgressContext.Provider value={value}>
      {children}
    </ProfileProgressContext.Provider>
  );
}

export function useProfileInventory() {
  const { ownedItemHashes, inventoryError, membershipId } =
    useProfileProgressContext();
  return {
    ownedItemHashes,
    inventoryError,
    showOwnership: Boolean(membershipId) && !inventoryError,
    signedIn: Boolean(membershipId),
  };
}

export function useProfileProgress() {
  const context = useProfileProgressContext();
  return {
    ...context,
    signedIn: Boolean(context.membershipId),
  };
}

export function useProfileRecordInstances(): Record<string, RecordInstance> {
  return useProfileProgressContext().recordInstances;
}

export function useProfileActivityCompletions(
  activityHashes: readonly string[],
): Record<string, number> {
  const { activityCompletions, registerActivityHashes } =
    useProfileProgressContext();

  useEffect(() => {
    registerActivityHashes(activityHashes);
  }, [activityHashes, registerActivityHashes]);

  return activityCompletions;
}

export function useProfileQuestCompletions(
  targets: readonly QuestCompletionTarget[],
): Record<string, boolean> {
  const { questCompletions, registerQuestTargets } =
    useProfileProgressContext();

  useEffect(() => {
    registerQuestTargets(targets);
  }, [registerQuestTargets, targets]);

  return questCompletions;
}

export function useProfileStringVariables(): TriumphStringVariables {
  return useProfileProgressContext().stringVariables;
}

export function useProfileChecklists(
  enabled = true,
): Record<string, Record<string, boolean>> {
  const { checklists, requestChecklists } = useProfileProgressContext();

  useEffect(() => {
    if (enabled) requestChecklists();
  }, [enabled, requestChecklists]);

  return checklists;
}
