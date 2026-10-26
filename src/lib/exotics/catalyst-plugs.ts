import { loadCatalystCatalog } from "@/lib/catalysts/load";
import type { BungieUserSession } from "@/lib/bungie";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import { getBungieApiKey } from "@/lib/env";

const BUNGIE_ORIGIN = "https://www.bungie.net";
/** Inventories (so item components come back), sockets, plug objectives, plug sets. */
const COMPONENTS = [102, 201, 205, 305, 309, 310];

type ObjectiveProgress = {
  objectiveHash: number;
  progress?: number;
  completionValue?: number;
  complete?: boolean;
};

type ItemPlug = {
  plugItemHash?: number;
  canInsert?: boolean;
  enabled?: boolean;
  plugObjectives?: ObjectiveProgress[];
};

type ProfileResponse = {
  profilePlugSets?: { data?: { plugs?: Record<string, ItemPlug[]> } };
  characterPlugSets?: { data?: Record<string, { plugs?: Record<string, ItemPlug[]> }> };
  itemComponents?: {
    sockets?: { data?: Record<string, { sockets?: { plugHash?: number }[] }> };
    plugObjectives?: {
      data?: Record<string, { objectivesPerPlug?: Record<string, ObjectiveProgress[]> }>;
    };
  };
};

export type CatalystPlugState = {
  /**
   * Evidence the catalyst has dropped: it can be slotted, it's slotted, or it
   * carries objective progress. Options that are listed but locked ("Not
   * found yet" in game) stay false.
   */
  found: boolean;
  /** Ready to slot in (objectives done). */
  canInsert: boolean;
  /** Slotted into a weapon copy. */
  inserted: boolean;
  objectives: { objectiveHash: string; progress: number; completionValue: number; complete: boolean }[];
};

/**
 * Live catalyst state per catalyst plug hash. The kill counter lives on the
 * plug (plug sets / item plug objectives), not on the catalyst triumph.
 */
export async function fetchCatalystPlugStates(
  session: BungieUserSession,
): Promise<Record<string, CatalystPlugState>> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return {};

  const response = await fetch(
    `${BUNGIE_ORIGIN}/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=${COMPONENTS.join(",")}`,
    {
      headers: { "X-API-Key": getBungieApiKey(), Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as { Response?: ProfileResponse; ErrorCode?: number; Message?: string };
  if (!response.ok || payload.ErrorCode !== 1 || !payload.Response) {
    throw new Error(payload.Message || `HTTP ${response.status}`);
  }
  const profile = payload.Response;

  const catalog = await loadCatalystCatalog();
  const catalystHashes = new Set(catalog.items.flatMap((item) => item.alternateItemHashes));
  const states: Record<string, CatalystPlugState> = {};
  const stateFor = (hash: string) =>
    (states[hash] ??= { found: false, canInsert: false, inserted: false, objectives: [] });

  const mergeObjectives = (state: CatalystPlugState, objectives: ObjectiveProgress[] | undefined) => {
    for (const objective of objectives ?? []) {
      const objectiveHash = String(objective.objectiveHash);
      const progress = objective.progress ?? 0;
      const completionValue = objective.completionValue ?? 1;
      const existing = state.objectives.find((entry) => entry.objectiveHash === objectiveHash);
      if (!existing) {
        state.objectives.push({ objectiveHash, progress, completionValue, complete: Boolean(objective.complete) });
      } else if (progress > existing.progress) {
        existing.progress = progress;
        existing.complete = existing.complete || Boolean(objective.complete);
      }
    }
  };

  // Plug sets list every catalyst option of a weapon, found or not: only
  // canInsert or objective progress proves it has dropped.
  const considerPlug = (plug: ItemPlug) => {
    const hash = plug.plugItemHash ? String(plug.plugItemHash) : null;
    if (!hash || !catalystHashes.has(hash)) return;
    const state = stateFor(hash);
    if (plug.canInsert) {
      state.canInsert = true;
      state.found = true;
    }
    if (plug.plugObjectives?.length) {
      state.found = true;
      mergeObjectives(state, plug.plugObjectives);
    }
  };

  for (const plugs of Object.values(profile.profilePlugSets?.data?.plugs ?? {})) plugs.forEach(considerPlug);
  for (const character of Object.values(profile.characterPlugSets?.data ?? {})) {
    for (const plugs of Object.values(character.plugs ?? {})) plugs.forEach(considerPlug);
  }

  for (const item of Object.values(profile.itemComponents?.plugObjectives?.data ?? {})) {
    for (const [hash, objectives] of Object.entries(item.objectivesPerPlug ?? {})) {
      if (!catalystHashes.has(hash)) continue;
      // Weapon copies list objectives for every option; only real progress counts.
      if (!objectives.some((objective) => (objective.progress ?? 0) > 0 || objective.complete)) continue;
      const state = stateFor(hash);
      state.found = true;
      mergeObjectives(state, objectives);
    }
  }

  for (const item of Object.values(profile.itemComponents?.sockets?.data ?? {})) {
    for (const socket of item.sockets ?? []) {
      const hash = socket.plugHash ? String(socket.plugHash) : null;
      if (hash && catalystHashes.has(hash)) {
        const state = stateFor(hash);
        state.found = true;
        state.inserted = true;
      }
    }
  }

  return states;
}
