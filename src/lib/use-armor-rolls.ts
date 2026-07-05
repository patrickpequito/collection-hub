"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyRollLocationUpdates,
  rollMatchesDestination,
  sleep,
  type RollLocationUpdate,
} from "@/lib/roll-location-update";
import type { ArmorRollInstance } from "@/types/armor-rolls";
import type { ProfileCharacter } from "@/types/destiny-characters";

type RefetchOptions = {
  silent?: boolean;
  locationUpdate?: RollLocationUpdate;
};

type ArmorRollsState = {
  rolls: ArmorRollInstance[];
  characters: ProfileCharacter[];
  loading: boolean;
  error: string | null;
  refetch: (options?: RefetchOptions) => Promise<void>;
};

const REFETCH_RETRY_ATTEMPTS = 4;
const REFETCH_RETRY_DELAY_MS = 400;

async function fetchArmorRolls(slug: string) {
  const response = await fetch(`/api/armor/${encodeURIComponent(slug)}/rolls`, {
    cache: "no-store",
  });
  return (await response.json()) as {
    rolls: ArmorRollInstance[];
    characters: ProfileCharacter[];
    error: string | null;
  };
}

export function useArmorRolls(slug: string, enabled: boolean): ArmorRollsState {
  const [rolls, setRolls] = useState<ArmorRollInstance[]>([]);
  const [characters, setCharacters] = useState<ProfileCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState({
    id: 0,
    silent: false,
    locationUpdate: null as RollLocationUpdate | null,
  });
  const refetchResolveRef = useRef<(() => void) | null>(null);
  const charactersRef = useRef(characters);
  charactersRef.current = characters;

  const refetch = useCallback((options?: RefetchOptions) => {
    return new Promise<void>((resolve) => {
      refetchResolveRef.current = resolve;
      setRefreshNonce((current) => ({
        id: current.id + 1,
        silent: options?.silent ?? false,
        locationUpdate: options?.locationUpdate ?? null,
      }));
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setRolls([]);
      setCharacters([]);
      setLoading(false);
      setError(null);
      refetchResolveRef.current?.();
      refetchResolveRef.current = null;
      return;
    }

    let cancelled = false;
    const { silent, locationUpdate } = refreshNonce;

    if (locationUpdate) {
      setRolls((current) =>
        applyRollLocationUpdates(
          current,
          locationUpdate,
          charactersRef.current,
        ),
      );
    }

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    (async () => {
      try {
        let payload = await fetchArmorRolls(slug);
        if (cancelled) return;

        if (locationUpdate) {
          for (let attempt = 0; attempt < REFETCH_RETRY_ATTEMPTS; attempt++) {
            const updatedRoll = payload.rolls.find(
              (roll) => roll.itemInstanceId === locationUpdate.itemInstanceId,
            );
            if (
              updatedRoll &&
              rollMatchesDestination(
                updatedRoll,
                locationUpdate.destination,
                payload.characters ?? [],
              )
            ) {
              break;
            }

            if (attempt < REFETCH_RETRY_ATTEMPTS - 1) {
              await sleep(REFETCH_RETRY_DELAY_MS);
              if (cancelled) return;
              payload = await fetchArmorRolls(slug);
              if (cancelled) return;
            } else {
              payload = {
                ...payload,
                rolls: applyRollLocationUpdates(
                  payload.rolls,
                  locationUpdate,
                  payload.characters ?? [],
                ),
              };
            }
          }
        }

        setRolls(payload.rolls);
        setCharacters(payload.characters ?? []);
        setError(payload.error);
      } catch (fetchError) {
        if (cancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load armor rolls",
        );
      } finally {
        if (cancelled) return;
        if (!silent) setLoading(false);
        refetchResolveRef.current?.();
        refetchResolveRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, enabled, refreshNonce]);

  return { rolls, characters, loading, error, refetch };
}
