"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { ProfileProgressContext } from "@/components/profile-progress-provider";

type OwnedItemsState = {
  itemHashes: string[];
  loading: boolean;
  error: string | null;
};

/** Shared empty list so "nothing owned" keeps the same identity between renders. */
const NO_HASHES: string[] = [];

export function useOwnedItemHashes(enabled: boolean): OwnedItemsState {
  const profile = useContext(ProfileProgressContext);
  // Stable array: a new one on every render made searches that depend on it run in a loop.
  const ownedSet = profile?.ownedItemHashes;
  const profileHashes = useMemo(() => (ownedSet ? [...ownedSet] : NO_HASHES), [ownedSet]);
  const [fallbackState, setFallbackState] = useState<OwnedItemsState>({
    itemHashes: [],
    loading: enabled,
    error: null,
  });

  useEffect(() => {
    if (profile || !enabled) return;

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setFallbackState({ itemHashes: NO_HASHES, loading: true, error: null });
    });

    fetch("/api/owned-items", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          itemHashes: string[];
          error: string | null;
        };
        if (cancelled) return;
        setFallbackState({
          itemHashes: payload.itemHashes,
          loading: false,
          error: payload.error,
        });
      })
      .catch((fetchError) => {
        if (cancelled) return;
        setFallbackState({
          itemHashes: [],
          loading: false,
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load inventory",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, profile]);

  if (profile) {
    if (!enabled) {
      return { itemHashes: NO_HASHES, loading: false, error: null };
    }

    return {
      itemHashes: profileHashes,
      loading: false,
      error: profile.inventoryError,
    };
  }

  if (!enabled) {
    return { itemHashes: NO_HASHES, loading: false, error: null };
  }

  return fallbackState;
}
