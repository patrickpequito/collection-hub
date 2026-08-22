"use client";

import { useContext, useEffect, useState } from "react";
import { ProfileProgressContext } from "@/components/profile-progress-provider";

type OwnedItemsState = {
  itemHashes: string[];
  loading: boolean;
  error: string | null;
};

export function useOwnedItemHashes(enabled: boolean): OwnedItemsState {
  const profile = useContext(ProfileProgressContext);
  const [fallbackState, setFallbackState] = useState<OwnedItemsState>({
    itemHashes: [],
    loading: enabled,
    error: null,
  });

  useEffect(() => {
    if (profile || !enabled) return;

    let cancelled = false;
    setFallbackState({ itemHashes: [], loading: true, error: null });

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
      return { itemHashes: [], loading: false, error: null };
    }

    return {
      itemHashes: [...profile.ownedItemHashes],
      loading: false,
      error: profile.inventoryError,
    };
  }

  if (!enabled) {
    return { itemHashes: [], loading: false, error: null };
  }

  return fallbackState;
}
