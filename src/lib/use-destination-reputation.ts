"use client";

import { useEffect, useState } from "react";
import type { ReputationLevel } from "@/lib/destiny-reputation";
import { useSignedIn } from "@/lib/use-signed-in";

/** Destination vendor ranks by destination slug (empty while loading or signed out). */
export function useDestinationReputation(): Record<string, ReputationLevel> | null {
  const signedIn = useSignedIn();
  const [ranks, setRanks] = useState<Record<string, ReputationLevel> | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetch("/api/destinations/reputation", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ ranks: Record<string, ReputationLevel> }>)
      .then((payload) => {
        if (!cancelled) setRanks(payload.ranks ?? {});
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  return signedIn ? ranks : null;
}
