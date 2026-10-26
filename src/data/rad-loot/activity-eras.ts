/**
 * Release era for every raid, dungeon and Pantheon page, used to label cards
 * and sort newest → oldest. `order` is the D2 release sequence.
 */
export type ActivityEra = {
  year: number;
  expansion: string;
  order: number;
};

export const ACTIVITY_ERAS: Readonly<Record<string, ActivityEra>> = {
  leviathan: { year: 1, expansion: "Red War", order: 1 },
  "eater-of-worlds": { year: 1, expansion: "Curse of Osiris", order: 2 },
  "spire-of-stars": { year: 1, expansion: "Warmind", order: 3 },
  "last-wish": { year: 2, expansion: "Forsaken", order: 4 },
  "the-shattered-throne": { year: 2, expansion: "Forsaken", order: 5 },
  "scourge-of-the-past": { year: 2, expansion: "Forsaken", order: 6 },
  "crown-of-sorrow": { year: 2, expansion: "Forsaken", order: 7 },
  "garden-of-salvation": { year: 3, expansion: "Shadowkeep", order: 8 },
  "pit-of-heresy": { year: 3, expansion: "Shadowkeep", order: 9 },
  prophecy: { year: 3, expansion: "Shadowkeep", order: 10 },
  "deep-stone-crypt": { year: 4, expansion: "Beyond Light", order: 11 },
  "vault-of-glass": { year: 4, expansion: "Beyond Light", order: 12 },
  "grasp-of-avarice": { year: 4, expansion: "Beyond Light", order: 13 },
  "vow-of-the-disciple": { year: 5, expansion: "The Witch Queen", order: 14 },
  duality: { year: 5, expansion: "The Witch Queen", order: 15 },
  "kings-fall": { year: 5, expansion: "The Witch Queen", order: 16 },
  "spire-of-the-watcher": { year: 5, expansion: "The Witch Queen", order: 17 },
  "root-of-nightmares": { year: 6, expansion: "Lightfall", order: 18 },
  "ghosts-of-the-deep": { year: 6, expansion: "Lightfall", order: 19 },
  "crotas-end": { year: 6, expansion: "Lightfall", order: 20 },
  "warlords-ruin": { year: 6, expansion: "Lightfall", order: 21 },
  "salvations-edge": { year: 7, expansion: "The Final Shape", order: 22 },
  "vespers-host": { year: 7, expansion: "The Final Shape", order: 23 },
  "sundered-doctrine": { year: 7, expansion: "The Final Shape", order: 24 },
  "the-desert-perpetual": { year: 8, expansion: "The Edge of Fate", order: 25 },
  equilibrium: { year: 8, expansion: "Renegades", order: 26 },
  "the-pantheon": { year: 8, expansion: "Renegades", order: 27 },
};

export function activityEraLabel(slug: string): string | null {
  const era = ACTIVITY_ERAS[slug];
  return era ? `Year ${era.year} · ${era.expansion}` : null;
}

/** Newest first, by release order. */
export function sortNewestFirst<T extends { slug: string }>(entries: readonly T[]): T[] {
  return [...entries].sort(
    (a, b) => (ACTIVITY_ERAS[b.slug]?.order ?? 0) - (ACTIVITY_ERAS[a.slug]?.order ?? 0),
  );
}
