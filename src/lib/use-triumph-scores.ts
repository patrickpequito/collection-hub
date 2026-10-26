"use client";

import { useEffect, useState } from "react";
import type { TriumphScores } from "@/lib/destiny-records";
import { useSignedIn } from "@/lib/use-signed-in";

/** Active / lifetime triumph score for the signed-in player (null while loading or signed out). */
export function useTriumphScores(): TriumphScores | null {
  const signedIn = useSignedIn();
  const [scores, setScores] = useState<TriumphScores | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetch("/api/triumphs/scores", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ scores: TriumphScores | null }>)
      .then((payload) => {
        if (!cancelled) setScores(payload.scores);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  return signedIn ? scores : null;
}
