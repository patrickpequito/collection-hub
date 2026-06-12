"use client";

import { useEffect, useState } from "react";
import type { TriumphScores } from "@/lib/destiny-records";

type HomeTriumphScoresProps = {
  signedIn: boolean;
};

function formatScore(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString();
}

export function HomeTriumphScores({ signedIn }: HomeTriumphScoresProps) {
  const [scores, setScores] = useState<TriumphScores | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signedIn) {
      setScores(null);
      setError(null);
      return;
    }

    let cancelled = false;

    fetch("/api/triumphs/scores", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          scores: TriumphScores | null;
          error: string | null;
        };
        if (cancelled) return;
        setScores(payload.scores);
        setError(payload.error);
      })
      .catch((fetchError) => {
        if (cancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load triumph scores",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const activeScore = signedIn && scores ? scores.activeScore : null;
  const lifetimeScore = signedIn && scores ? scores.lifetimeScore : null;

  return (
    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:w-auto sm:min-w-[220px] sm:max-w-xs">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Triumph Score
      </p>

      {error ? (
        <p className="mt-2 text-xs text-amber-200/80">{error}</p>
      ) : null}

      <dl className="mt-3 space-y-2.5">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-xs text-zinc-400">Lifetime Triumph Score</dt>
          <dd className="shrink-0 tabular-nums text-sm font-semibold text-zinc-100">
            {formatScore(lifetimeScore)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-xs text-zinc-400">Active Triumph Score</dt>
          <dd className="shrink-0 tabular-nums text-sm font-semibold text-zinc-100">
            {formatScore(activeScore)}
          </dd>
        </div>
      </dl>

      {!signedIn ? (
        <p className="mt-3 text-[11px] text-zinc-500">
          Sign in to load your scores.
        </p>
      ) : null}
    </div>
  );
}
