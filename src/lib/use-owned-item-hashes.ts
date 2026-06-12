"use client";

import { useEffect, useState } from "react";

type OwnedItemsState = {
  itemHashes: string[];
  loading: boolean;
  error: string | null;
};

export function useOwnedItemHashes(enabled: boolean): OwnedItemsState {
  const [itemHashes, setItemHashes] = useState<string[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setItemHashes([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/owned-items", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          itemHashes: string[];
          error: string | null;
        };
        if (cancelled) return;
        setItemHashes(payload.itemHashes);
        setError(payload.error);
      })
      .catch((fetchError) => {
        if (cancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load inventory",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { itemHashes, loading, error };
}
