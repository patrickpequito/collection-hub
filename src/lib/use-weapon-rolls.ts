"use client";

import { useEffect, useState } from "react";
import type { WeaponRollInstance } from "@/types/weapon-rolls";

type WeaponRollsState = {
  rolls: WeaponRollInstance[];
  loading: boolean;
  error: string | null;
};

export function useWeaponRolls(slug: string, enabled: boolean): WeaponRollsState {
  const [rolls, setRolls] = useState<WeaponRollInstance[]>([]);
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

    fetch(`/api/weapons/${encodeURIComponent(slug)}/rolls`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          rolls: WeaponRollInstance[];
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
            : "Failed to load weapon rolls",
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
