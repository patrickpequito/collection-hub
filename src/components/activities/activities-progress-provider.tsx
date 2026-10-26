"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ActivityLootProgress } from "@/lib/activities/loot-progress";
import { readSnapshot, writeSnapshot } from "@/lib/local-snapshot";
import { useSession } from "@/lib/use-session";

type ActivitiesProgressState = {
  progress: Record<string, ActivityLootProgress> | null;
};

const ActivitiesProgressContext = createContext<ActivitiesProgressState>({
  progress: null,
});

/** Signed-in loot progress for every activity card on the page. */
export function ActivitiesProgressProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const [state, setState] = useState<ActivitiesProgressState & { membershipId: string | null }>({
    progress: null,
    membershipId: null,
  });

  useEffect(() => {
    if (!session.signedIn) return;
    let cancelled = false;
    // Last saved progress first (instant bars), then the fresh numbers from Bungie.
    const cacheKey = session.membershipId ? `activities-progress:${session.membershipId}` : null;
    const cached = cacheKey ? readSnapshot<Record<string, ActivityLootProgress>>(cacheKey) : null;
    if (cached) {
      void Promise.resolve().then(() => {
        if (!cancelled) {
          setState((current) =>
            current.membershipId === session.membershipId && current.progress
              ? current
              : { progress: cached, membershipId: session.membershipId },
          );
        }
      });
    }
    fetch("/api/activities/progress", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { progress: Record<string, ActivityLootProgress> | null }) => {
        if (cancelled || !payload.progress) return;
        if (cacheKey) writeSnapshot(cacheKey, payload.progress);
        setState({ progress: payload.progress, membershipId: session.membershipId });
      })
      .catch(() => {
        // Cards simply show no progress bar.
      });
    return () => {
      cancelled = true;
    };
  }, [session.signedIn, session.membershipId]);

  const current =
    session.signedIn && state.membershipId === session.membershipId ? state : null;

  return (
    <ActivitiesProgressContext.Provider
      value={{ progress: current?.progress ?? null }}
    >
      {children}
    </ActivitiesProgressContext.Provider>
  );
}

export function useActivitiesProgress(): ActivitiesProgressState {
  return useContext(ActivitiesProgressContext);
}
