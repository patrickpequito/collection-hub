"use client";

/** Character chosen on the home card; shared by every per-class progress view. */
const CHARACTER_KEY = "d2-collector:home-character:v1";

export function readSelectedCharacterId(): string | null {
  try {
    return localStorage.getItem(CHARACTER_KEY);
  } catch {
    return null;
  }
}

export function writeSelectedCharacterId(characterId: string): void {
  try {
    localStorage.setItem(CHARACTER_KEY, characterId);
  } catch {
    // Not persisted (private mode) — selection still applies this visit.
  }
}
