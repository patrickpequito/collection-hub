"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useSession } from "@/lib/use-session";

/** Max pinned titles (Home shows three rows); pinning a fourth drops the oldest. */
export const MAX_PINNED_TITLES = 3;

type PinState = {
  membershipId: string | null;
  /** Oldest first. */
  pins: string[];
  /** cloud = Upstash via /api/pins; local = this browser only (no database configured). */
  storage: "cloud" | "local" | null;
  error: string | null;
};

const EMPTY: PinState = { membershipId: null, pins: [], storage: null, error: null };
let state: PinState = EMPTY;
const listeners = new Set<() => void>();
let loadingFor: string | null = null;

function setState(next: PinState) {
  state = next;
  listeners.forEach((listener) => listener());
}

const localKey = (membershipId: string) => `d2-collector:pinned-titles:${membershipId}`;

function readLocal(membershipId: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(localKey(membershipId)) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((slug): slug is string => typeof slug === "string") : [];
  } catch {
    return [];
  }
}

function writeLocal(membershipId: string, pins: string[]) {
  try {
    localStorage.setItem(localKey(membershipId), JSON.stringify(pins));
  } catch {
    // Private mode / storage full: pins stay for this visit only.
  }
}

async function load(membershipId: string) {
  if (loadingFor === membershipId) return;
  loadingFor = membershipId;
  try {
    const response = await fetch("/api/pins", { cache: "no-store" });
    const payload = (await response.json()) as { pins: string[]; storage: string; error: string | null };
    if (payload.storage === "local") {
      setState({ membershipId, pins: readLocal(membershipId), storage: "local", error: null });
    } else {
      setState({ membershipId, pins: payload.pins ?? [], storage: "cloud", error: payload.error });
    }
  } catch (error) {
    setState({
      membershipId,
      pins: readLocal(membershipId),
      storage: "local",
      error: error instanceof Error ? error.message : "Failed to load pinned titles",
    });
  } finally {
    loadingFor = null;
  }
}

async function save(next: string[]) {
  const previous = state;
  if (!previous.membershipId) return;
  setState({ ...previous, pins: next, error: null });
  if (previous.storage !== "cloud") {
    writeLocal(previous.membershipId, next);
    return;
  }
  try {
    const response = await fetch("/api/pins", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pins: next }),
    });
    const payload = (await response.json()) as { pins?: string[]; error: string | null };
    if (!response.ok || payload.error) throw new Error(payload.error ?? "Failed to save");
    setState({ ...state, pins: payload.pins ?? next });
  } catch (error) {
    setState({ ...previous, error: error instanceof Error ? error.message : "Failed to save pinned titles" });
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Shared pinned-title state for the seal page, the Triumphs hub and Home. */
export function usePinnedTitles() {
  const session = useSession();
  const membershipId = session.signedIn ? session.membershipId : null;
  const current = useSyncExternalStore(subscribe, () => state, () => EMPTY);

  useEffect(() => {
    if (membershipId && state.membershipId !== membershipId) void load(membershipId);
  }, [membershipId]);

  const ready = Boolean(membershipId) && current.membershipId === membershipId;
  const pins = useMemo(() => (ready ? current.pins : []), [current.pins, ready]);

  const togglePin = useCallback(
    (slug: string) => {
      if (!ready) return;
      const next = pins.includes(slug)
        ? pins.filter((entry) => entry !== slug)
        : [...pins, slug].slice(-MAX_PINNED_TITLES);
      void save(next);
    },
    [pins, ready],
  );

  return {
    pins,
    ready,
    storage: ready ? current.storage : null,
    error: ready ? current.error : null,
    isPinned: (slug: string) => pins.includes(slug),
    togglePin,
  };
}
