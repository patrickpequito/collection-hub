import pathfinderData from "../../../data/pale-heart-pathfinder.json";

/**
 * Pale Heart Pathfinder: 25 weekly boards under one presentation node. Only
 * the active one is visible in profile presentation nodes (state 0, the rest
 * are Invisible), the same for every player — read from a public profile.
 */

export type PathfinderNode = { hash: string; name: string; description: string };

export type PathfinderBoard = {
  nodeHash: string;
  rewardHash: string;
  /** Top (2 objectives) to bottom (6): a path runs from the bottom row to the reward. */
  rows: PathfinderNode[][];
  /** Weekly "claim multiple path completion rewards" record (progress = paths claimed). */
  pathsClaimedRecordHash: string;
};

const DATA = pathfinderData as {
  rootNodeHash: string;
  pathsClaimedRecordHash: string;
  boards: Record<string, { rewardHash: string; rows: PathfinderNode[][] }>;
};

/** Public profile used for weekly lookups (same as the Wellspring probe). */
const PROBE_PROFILE = "/Platform/Destiny2/3/Profile/4611686018473121985/?components=700";

export async function loadPathfinderBoard(): Promise<PathfinderBoard | null> {
  const apiKey = process.env.BUNGIE_API_KEY?.trim();
  if (!apiKey) return null;
  try {
    const response = await fetch(`https://www.bungie.net${PROBE_PROFILE}`, {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      Response?: { profilePresentationNodes?: { data?: { nodes?: Record<string, { state: number }> } } };
    };
    const nodes = payload.Response?.profilePresentationNodes?.data?.nodes ?? {};
    // Presentation node state bit 1 = Invisible.
    const active = Object.keys(DATA.boards).find((hash) => nodes[hash] && (nodes[hash].state & 1) === 0);
    if (!active) return null;
    const board = DATA.boards[active];
    return { nodeHash: active, rewardHash: board.rewardHash, rows: board.rows, pathsClaimedRecordHash: DATA.pathsClaimedRecordHash };
  } catch {
    return null;
  }
}

const OVERTHROW_REGION: Record<string, string> = {
  "Landed Overthrow": "The Landing",
  "Bloomed Overthrow": "The Blooming",
  "Impassive Overthrow": "The Impasse",
};

/** The two Overthrow regions next to the reward (every board's top row). */
export function pathfinderOverthrowRegions(board: PathfinderBoard): string[] {
  return board.rows[0].map((node) => OVERTHROW_REGION[node.name]).filter((region): region is string => Boolean(region));
}
