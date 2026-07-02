"use client";

import { useEffect, useState } from "react";
import type { ArmorRollInstance } from "@/types/armor-rolls";

type ArmorRollsState = {
  rolls: ArmorRollInstance[];
  loading: boolean;
  error: string | null;
};

export function useArmorRolls(slug: string, enabled: boolean): ArmorRollsState {
  const [rolls, setRolls] = useState<ArmorRollInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setRolls([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/armor/${encodeURIComponent(slug)}/rolls`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          rolls: ArmorRollInstance[];
          error: string | null;
        };
        if (cancelled) return;
        setRolls(payload.rolls);
        setError(payload.error);
      })
      .catch((fetchError) => {
        if (cancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load armor rolls",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, enabled]);

  return { rolls, loading, error };
}
