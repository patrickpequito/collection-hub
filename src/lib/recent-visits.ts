"use client";

import { useMemo, useSyncExternalStore } from "react";

/** Recently viewed pages for the home "Jump back in" block (this browser only). */
export type RecentVisit = {
  href: string;
  title: string;
  kind: string;
  imageUrl?: string;
  at: number;
};

const STORAGE_KEY = "d2-collector:recent-visits:v1";
const MAX_VISITS = 8;
const CHANGE_EVENT = "d2-collector:recent-visits-change";

/** Section label from the URL; index pages return null (not worth listing). */
export function recentVisitKind(pathname: string): string | null {
  const rules: [RegExp, string][] = [
    [/^\/seasons\/[^/]+/, "Season"],
    [/^\/expansions\/[^/]+/, "Expansion"],
    [/^\/activities\/(vanguard-ops|crucible|gambit|iron-banner|trials-of-osiris|sparrow-racing-league)$/, "Playlist"],
    [/^\/activities\/destinations\/[^/]+/, "Destination"],
    [/^\/activities\/monument-of-triumph$/, "Update"],
    [/^\/activities\/(?!destinations$)[^/]+$/, "Raid & dungeon"],
    [/^\/weapons\/[^/]+/, "Weapon"],
    [/^\/armor\/[^/]+/, "Armor"],
    [/^\/triumphs\/title\/[^/]+/, "Title"],
    [/^\/triumphs\/group\/[^/]+/, "Triumphs"],
    [/^\/(exotics|sets|shaders)$/, "Catalog"],
  ];
  return rules.find(([pattern]) => pattern.test(pathname))?.[1] ?? null;
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function recordRecentVisit(visit: Omit<RecentVisit, "at">): void {
  try {
    const current = parseVisits(readRaw()).filter((entry) => entry.href !== visit.href);
    const next = [{ ...visit, at: Date.now() }, ...current].slice(0, MAX_VISITS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage unavailable (private mode) — the block simply stays empty.
  }
}

function parseVisits(raw: string | null): RecentVisit[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RecentVisit[];
    return Array.isArray(parsed) ? parsed.filter((entry) => entry?.href) : [];
  } catch {
    return [];
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useRecentVisits(): RecentVisit[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => parseVisits(raw), [raw]);
}
