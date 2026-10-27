/**
 * Expansion an item comes from, read from its "Source:" text. Most expansion loot carries
 * another season label (Monument of Triumph reissue, or the launch episode's watermark),
 * so search uses this to find e.g. every Pale Heart / Salvation's Edge item for
 * "The Final Shape". Mirrors EXPANSION_SOURCE_PATTERNS in scripts/all-loot-mappings.mjs
 * (first match wins), plus the Neomuna sources for Lightfall.
 */
const EXPANSION_SOURCE_PATTERNS: [RegExp, string][] = [
  [/salvation'?s edge/i, "The Final Shape"],
  [/pale heart|exploring the pale heart/i, "The Final Shape"],
  [/wild card exotic/i, "The Final Shape"],
  [/dual destiny/i, "The Final Shape"],
  [/the final shape/i, "The Final Shape"],
  [/"vow of the disciple"/i, "The Witch Queen"],
  [/witch queen|throne world|wellspring/i, "The Witch Queen"],
  [/"root of nightmares"/i, "Lightfall"],
  [/lightfall|heist battlegrounds|neomuna|terminal overload|vex incursion|"the final strand"/i, "Lightfall"],
  [/"deep stone crypt"/i, "Beyond Light"],
  [/"garden of salvation"/i, "Shadowkeep"],
  [/"pit of heresy"/i, "Shadowkeep"],
  [/"last wish"/i, "Forsaken"],
  [
    /exploring the moon|shadowkeep|\bmoon\b.*(?:dungeon|raid|pit|activity)|garden of salvation|pit of heresy|nightmare hunt|nightmare\b/i,
    "Shadowkeep",
  ],
  [/deep stone crypt|\beuropa\b|\bbeyond light\b/i, "Beyond Light"],
  [/forsaken|\blast wish|\bdreaming city|\btangled shore|\breef\b/i, "Forsaken"],
  [/the edge of fate activities|edge of fate campaign/i, "The Edge of Fate"],
  [/edge of fate|desert perpetual|equilibrium|vesper'?s host|sundered doctrine|pantheon/i, "The Edge of Fate"],
  [/renegades|fireteam ops/i, "Renegades"],
  [/kepler|exploring kepler/i, "Renegades"],
  [/warmind|\bescalation protocol|\bspire of stars|\bmars\b/i, "Warmind"],
  [
    /curse of osiris|\beater of worlds|lost prophecies|\bbrother vance|rank-up packages on mercury|activities.*\bon mercury\b/i,
    "Curse of Osiris",
  ],
  [/red war|\bedz\b|\bhomecoming|\bleviathan raid|\bcalistoga|\btitan\b|\bio\b|\bn Nessus|\beuropean/i, "Red War"],
  [/destiny 2\b|\bnew light\b|\bintroductory\b/i, "Red War"],
];

const cache = new Map<string, string | null>();

export function expansionFromSource(source: string | null | undefined): string | null {
  if (!source) return null;
  const cached = cache.get(source);
  if (cached !== undefined) return cached;
  const label = EXPANSION_SOURCE_PATTERNS.find(([pattern]) => pattern.test(source))?.[1] ?? null;
  cache.set(source, label);
  return label;
}
