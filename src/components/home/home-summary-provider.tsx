"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { GuardianCharacter, GuardianSummary } from "@/lib/home/guardian-summary";
import {
  readSelectedCharacterId,
  writeSelectedCharacterId,
} from "@/lib/selected-character";
import { readSnapshot, writeSnapshot } from "@/lib/local-snapshot";
import { useSession } from "@/lib/use-session";

type HomeSummaryState = {
  signedIn: boolean;
  /** Bungie.net name from the session, available before the summary loads. */
  displayName: string | null;
  /** Session check finished (signed in or not). */
  ready: boolean;
  summary: GuardianSummary | null;
  loading: boolean;
  error: string | null;
  /** Character driving the card and per-class progress (last played by default). */
  character: GuardianCharacter | null;
  selectCharacter: (characterId: string) => void;
};



const HomeSummaryContext = createContext<HomeSummaryState>({
  signedIn: false,
  displayName: null,
  ready: false,
  summary: null,
  loading: false,
  error: null,
  character: null,
  selectCharacter: () => {},
});

/** Loads the signed-in home summary once and shares it with every home block. */
export function HomeSummaryProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const [result, setResult] = useState<{
    summary: GuardianSummary | null;
    error: string | null;
    membershipId: string | null;
  }>({ summary: null, error: null, membershipId: null });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!session.signedIn) return;
    let cancelled = false;
    // Show the last saved summary right away; the fetch below refreshes it.
    const cacheKey = session.membershipId ? `home-summary:${session.membershipId}` : null;
    const cached = cacheKey ? readSnapshot<GuardianSummary>(cacheKey) : null;
    if (cached) {
      void Promise.resolve().then(() => {
        if (cancelled) return;
        setSelectedId(readSelectedCharacterId());
        setResult((current) =>
          current.membershipId === session.membershipId && current.summary
            ? current
            : { summary: cached, error: null, membershipId: session.membershipId },
        );
      });
    }
    fetch("/api/home/summary", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { summary: GuardianSummary | null; error: string | null }) => {
        if (!cancelled) {
          setSelectedId(readSelectedCharacterId());
          if (payload.summary && cacheKey) writeSnapshot(cacheKey, payload.summary);
          // Keep the saved copy on screen if Bungie fails this time.
          setResult((current) => ({
            summary: payload.summary ?? (current.membershipId === session.membershipId ? current.summary : null),
            error: payload.summary ? null : payload.error,
            membershipId: session.membershipId,
          }));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setResult({
            summary: null,
            error: error instanceof Error ? error.message : "Failed to load",
            membershipId: session.membershipId,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session.signedIn, session.membershipId]);

  const current =
    session.signedIn && result.membershipId === session.membershipId ? result : null;
  const characters = current?.summary?.characters ?? [];
  const character =
    characters.find((entry) => entry.characterId === selectedId) ?? characters[0] ?? null;

  const selectCharacter = (characterId: string) => {
    setSelectedId(characterId);
    writeSelectedCharacterId(characterId);
  };

  return (
    <HomeSummaryContext.Provider
      value={{
        signedIn: session.signedIn,
        displayName: session.displayName,
        ready: session.ready,
        summary: current?.summary ?? null,
        loading: session.signedIn && !current,
        error: current?.error ?? null,
        character,
        selectCharacter,
      }}
    >
      {children}
    </HomeSummaryContext.Provider>
  );
}

export function useHomeSummary(): HomeSummaryState {
  return useContext(HomeSummaryContext);
}
