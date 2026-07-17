export type ItemHashIndex = {
  hashToName: Record<string, string>;
  nameToHashes: Record<string, string[]>;
  collectibleByItemHash: Record<string, string>;
  itemsByCollectibleHash: Record<string, string[]>;
};

let indexPromise: Promise<ItemHashIndex> | null = null;

async function loadItemHashIndex(): Promise<ItemHashIndex> {
  if (!indexPromise) {
    indexPromise = import("../../data/item-hash-index.json").then(
      (mod) => mod.default as ItemHashIndex,
    );
  }
  return indexPromise;
}

const NOT_ACQUIRED = 1;

function relateHash(hash: string, expanded: Set<string>, index: ItemHashIndex) {
  expanded.add(hash);

  const name = index.hashToName[hash];
  if (name) {
    for (const alias of index.nameToHashes[name] ?? []) {
      expanded.add(alias);
    }
  }

  const collectible = index.collectibleByItemHash[hash];
  if (collectible) {
    for (const alias of index.itemsByCollectibleHash[collectible] ?? []) {
      expanded.add(alias);
    }
  }
}

export async function expandAcquiredItemHashes(input: {
  inventoryHashes: Iterable<string>;
  collectibles: Record<string, { state: number }>;
  /** Unlocked plugs (e.g. catalysts) from profile/character plug sets and item sockets. */
  plugHashes?: Iterable<string>;
}): Promise<Set<string>> {
  const index = await loadItemHashIndex();
  const expanded = new Set<string>();

  for (const hash of input.inventoryHashes) {
    relateHash(hash, expanded, index);
  }

  for (const hash of input.plugHashes ?? []) {
    relateHash(hash, expanded, index);
  }

  for (const [collectibleHash, entry] of Object.entries(input.collectibles)) {
    if ((entry.state & NOT_ACQUIRED) !== 0) continue;
    for (const itemHash of index.itemsByCollectibleHash[collectibleHash] ?? []) {
      relateHash(itemHash, expanded, index);
    }
  }

  return expanded;
}
