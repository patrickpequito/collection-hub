import type { BungieUserSession } from "@/lib/bungie";
import { getBungieApiKey } from "@/lib/env";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import {
  isProfileRecordComplete,
} from "@/lib/triumphs/record-progress";
import type { RecordInstance } from "@/types/triumph";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type ObjectiveProgress = {
  objectiveHash?: number;
  progress?: number;
  completionValue?: number;
  complete?: boolean;
};

type QuestStatus = {
  questHash?: number;
  stepHash?: number;
  completed?: boolean;
  redeemed?: boolean;
  stepObjectives?: ObjectiveProgress[];
};

type InventoryItem = {
  itemHash?: number;
  itemInstanceId?: string;
};

type ApiRecordInstance = {
  state: number;
  objectives?: ObjectiveProgress[];
};

type CharacterProgression = {
  quests?: QuestStatus[];
  uninstancedItemObjectives?: Record<string, ObjectiveProgress[]>;
};

type CharacterUninstancedItemComponents = {
  objectives?: {
    data?: Record<string, { objectives?: ObjectiveProgress[] }>;
  };
};

type ProfileQuestProgressResponse = {
  profileRecords?: {
    data?: { records?: Record<string, ApiRecordInstance> };
  };
  characterRecords?: {
    data?: Record<string, { records?: Record<string, ApiRecordInstance> }>;
  };
  profileProgression?: {
    data?: {
      uninstancedItemObjectives?: Record<string, ObjectiveProgress[]>;
    };
  };
  profileInventory?: {
    data?: { items?: InventoryItem[] };
  };
  characterProgressions?: {
    data?: Record<string, CharacterProgression>;
  };
  characterInventories?: {
    data?: Record<string, { items?: InventoryItem[] }>;
  };
  characterEquipment?: {
    data?: Record<string, { items?: InventoryItem[] }>;
  };
  characterUninstancedItemComponents?: {
    data?: Record<string, CharacterUninstancedItemComponents>;
  };
  itemComponents?: {
    objectives?: {
      data?: Record<string, { objectives?: ObjectiveProgress[] }>;
    };
  };
};

export type QuestCompletionTarget = {
  /** Canonical quest-line id returned in the completed map. */
  questHash: string;
  /** Final quest step — checked via inventory objectives when still held. */
  completionStepHash: string;
  /** All quest step hashes that may appear as questHash/stepHash in profile data. */
  stepHashes?: string[];
  recordHash?: string;
  recordObjectiveHash?: string;
  fallbackRecordHashes?: string[];
  completionItemHash?: string;
  completionObjectiveHash?: string;
  stepObjectiveHashes?: string[];
};

async function bungieGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${BUNGIE_ORIGIN}${path}`, {
    headers: {
      "X-API-Key": getBungieApiKey(),
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as BungieResponse<T>;
  if (payload.ErrorCode !== 1) {
    throw new Error(payload.Message || "Bungie API error");
  }

  return payload.Response;
}

function isObjectiveProgressComplete(objective: ObjectiveProgress): boolean {
  if (objective.complete) return true;
  const completionValue = objective.completionValue ?? 1;
  return (objective.progress ?? 0) >= completionValue;
}

function areObjectivesComplete(
  objectives: ObjectiveProgress[] | undefined,
): boolean {
  return (
    objectives != null &&
    objectives.length > 0 &&
    objectives.every(isObjectiveProgressComplete)
  );
}

function buildStepLookup(
  targets: QuestCompletionTarget[],
): Map<string, string> {
  const stepToQuest = new Map<string, string>();

  for (const target of targets) {
    stepToQuest.set(target.questHash, target.questHash);
    stepToQuest.set(target.completionStepHash, target.questHash);
    for (const stepHash of target.stepHashes ?? []) {
      stepToQuest.set(stepHash, target.questHash);
    }
  }

  return stepToQuest;
}

function markCompletedQuestFromKeys(
  completed: Record<string, boolean>,
  stepToQuest: Map<string, string>,
  keys: string[],
): void {
  for (const key of keys) {
    if (!key) continue;
    const canonical = stepToQuest.get(key);
    if (canonical) completed[canonical] = true;
  }
}

function mergeRecordInstances(
  target: Map<string, RecordInstance>,
  records: Record<string, ApiRecordInstance> | undefined,
): void {
  for (const [recordHash, record] of Object.entries(records ?? {})) {
    const existing = target.get(recordHash);
    const objectives = (record.objectives ?? []).map((objective) => ({
      objectiveHash: String(objective.objectiveHash),
      progress: objective.progress ?? 0,
      completionValue: objective.completionValue ?? 1,
      complete: Boolean(objective.complete),
    }));

    if (!existing) {
      target.set(recordHash, { state: record.state, objectives });
      continue;
    }

    target.set(recordHash, {
      state: existing.state | record.state,
      objectives: existing.objectives.length > 0 ? existing.objectives : objectives,
    });
  }
}

function readRecordInstances(
  profile: ProfileQuestProgressResponse,
): Map<string, RecordInstance> {
  const instances = new Map<string, RecordInstance>();
  mergeRecordInstances(instances, profile.profileRecords?.data?.records);

  for (const charRecords of Object.values(profile.characterRecords?.data ?? {})) {
    mergeRecordInstances(instances, charRecords.records);
  }

  return instances;
}

function isQuestRecordComplete(instance: RecordInstance | undefined): boolean {
  return isProfileRecordComplete(instance);
}

function isQuestRecordObjectiveComplete(
  instance: RecordInstance | undefined,
  objectiveHash: string,
): boolean {
  if (!instance) return false;
  const objective = instance.objectives?.find(
    (entry) => entry.objectiveHash === objectiveHash,
  );
  if (!objective) return false;
  if (objective.complete) return true;
  return objective.progress >= objective.completionValue;
}

function collectAllInventoryItems(
  profile: ProfileQuestProgressResponse,
): InventoryItem[] {
  const items: InventoryItem[] = [];

  for (const item of profile.profileInventory?.data?.items ?? []) {
    items.push(item);
  }

  for (const inventory of Object.values(profile.characterInventories?.data ?? {})) {
    for (const item of inventory.items ?? []) {
      items.push(item);
    }
  }

  for (const equipment of Object.values(profile.characterEquipment?.data ?? {})) {
    for (const item of equipment.items ?? []) {
      items.push(item);
    }
  }

  return items;
}

function scanInventoryQuestSteps(
  profile: ProfileQuestProgressResponse,
  stepToQuest: Map<string, string>,
  completionSteps: Set<string>,
  completed: Record<string, boolean>,
): void {
  const objectiveData = profile.itemComponents?.objectives?.data ?? {};

  for (const item of collectAllInventoryItems(profile)) {
    const itemHash = item.itemHash != null ? String(item.itemHash) : "";
    const instanceId = item.itemInstanceId;
    if (!itemHash || !instanceId) continue;

    const canonical = stepToQuest.get(itemHash);
    if (!canonical) continue;

    const objectives = objectiveData[instanceId]?.objectives;
    if (!areObjectivesComplete(objectives)) continue;

    if (completionSteps.has(itemHash)) {
      completed[canonical] = true;
    }
  }
}

function collectOwnedItemHashes(profile: ProfileQuestProgressResponse): Set<string> {
  const owned = new Set<string>();

  for (const item of collectAllInventoryItems(profile)) {
    if (item.itemHash != null) owned.add(String(item.itemHash));
  }

  return owned;
}

/** All uninstanced objective buckets from profile + every character. */
function collectUninstancedObjectiveEntries(
  profile: ProfileQuestProgressResponse,
): Array<{ itemHash: string | null; objectives: ObjectiveProgress[] }> {
  const entries: Array<{ itemHash: string | null; objectives: ObjectiveProgress[] }> =
    [];

  for (const objectives of Object.values(
    profile.profileProgression?.data?.uninstancedItemObjectives ?? {},
  )) {
    entries.push({ itemHash: null, objectives });
  }

  for (const progression of Object.values(
    profile.characterProgressions?.data ?? {},
  )) {
    for (const [itemHash, objectives] of Object.entries(
      progression.uninstancedItemObjectives ?? {},
    )) {
      entries.push({ itemHash, objectives });
    }

    for (const quest of progression.quests ?? []) {
      if (quest.stepObjectives?.length) {
        entries.push({ itemHash: null, objectives: quest.stepObjectives });
      }
    }
  }

  for (const components of Object.values(
    profile.characterUninstancedItemComponents?.data ?? {},
  )) {
    for (const [itemHash, bucket] of Object.entries(
      components.objectives?.data ?? {},
    )) {
      if (bucket.objectives?.length) {
        entries.push({ itemHash, objectives: bucket.objectives });
      }
    }
  }

  return entries;
}

function scanActiveQuestStatuses(
  profile: ProfileQuestProgressResponse,
  stepToQuest: Map<string, string>,
  completionSteps: Set<string>,
  completionObjectiveToQuest: Map<string, string>,
  completed: Record<string, boolean>,
): void {
  for (const progression of Object.values(
    profile.characterProgressions?.data ?? {},
  )) {
    for (const quest of progression.quests ?? []) {
      const keys = [
        quest.questHash != null ? String(quest.questHash) : "",
        quest.stepHash != null ? String(quest.stepHash) : "",
      ];

      if (quest.completed || quest.redeemed) {
        markCompletedQuestFromKeys(completed, stepToQuest, keys);
        continue;
      }

      const stepHash = quest.stepHash != null ? String(quest.stepHash) : "";
      if (stepHash && completionSteps.has(stepHash)) {
        if (areObjectivesComplete(quest.stepObjectives)) {
          markCompletedQuestFromKeys(completed, stepToQuest, keys);
          continue;
        }
      }

      for (const objective of quest.stepObjectives ?? []) {
        const objectiveHash =
          objective.objectiveHash != null
            ? String(objective.objectiveHash)
            : "";
        const canonical = completionObjectiveToQuest.get(objectiveHash);
        if (!canonical || completed[canonical]) continue;
        if (isObjectiveProgressComplete(objective)) {
          completed[canonical] = true;
        }
      }
    }
  }
}

function scanUninstancedQuestStepBuckets(
  profile: ProfileQuestProgressResponse,
  targets: QuestCompletionTarget[],
  stepToQuest: Map<string, string>,
  completed: Record<string, boolean>,
): void {
  for (const target of targets) {
    if (completed[target.questHash]) continue;

    for (const entry of collectUninstancedObjectiveEntries(profile)) {
      if (!entry.itemHash || !stepToQuest.has(entry.itemHash)) continue;
      if (stepToQuest.get(entry.itemHash) !== target.questHash) continue;

      if (
        entry.itemHash === target.completionStepHash &&
        areObjectivesComplete(entry.objectives)
      ) {
        completed[target.questHash] = true;
        break;
      }

      if (target.completionObjectiveHash) {
        const objective = entry.objectives.find(
          (candidate) =>
            String(candidate.objectiveHash) === target.completionObjectiveHash,
        );
        if (objective && isObjectiveProgressComplete(objective)) {
          completed[target.questHash] = true;
          break;
        }
      }
    }
  }
}

/** Some legacy objectives only appear on profile/character records. */
function scanRecordsForQuestObjectives(
  recordInstances: Map<string, RecordInstance>,
  targets: QuestCompletionTarget[],
  completed: Record<string, boolean>,
): void {
  for (const target of targets) {
    if (completed[target.questHash] || !target.completionObjectiveHash) continue;

    for (const instance of recordInstances.values()) {
      const objective = instance.objectives?.find(
        (entry) => entry.objectiveHash === target.completionObjectiveHash,
      );
      if (!objective) continue;
      if (
        Boolean(objective.complete) ||
        objective.progress >= objective.completionValue
      ) {
        completed[target.questHash] = true;
        break;
      }
    }
  }
}

/** Completed quests often leave the final objective in uninstancedItemObjectives. */
function scanUninstancedCompletionObjectives(
  profile: ProfileQuestProgressResponse,
  targets: QuestCompletionTarget[],
  completed: Record<string, boolean>,
): void {
  const objectiveToQuest = new Map<string, string>();
  for (const target of targets) {
    if (target.completionObjectiveHash) {
      objectiveToQuest.set(target.completionObjectiveHash, target.questHash);
    }
  }
  if (objectiveToQuest.size === 0) return;

  for (const entry of collectUninstancedObjectiveEntries(profile)) {
    for (const objective of entry.objectives) {
      const objectiveHash =
        objective.objectiveHash != null
          ? String(objective.objectiveHash)
          : "";
      const questHash = objectiveToQuest.get(objectiveHash);
      if (!questHash || completed[questHash]) continue;
      if (isObjectiveProgressComplete(objective)) {
        completed[questHash] = true;
      }
    }
  }
}

/** Instanced quest items may still carry completed objectives in the vault. */
function scanInstancedCompletionObjectives(
  profile: ProfileQuestProgressResponse,
  stepToQuest: Map<string, string>,
  targets: QuestCompletionTarget[],
  completed: Record<string, boolean>,
): void {
  const completionObjectiveToQuest = new Map<string, string>();
  for (const target of targets) {
    if (target.completionObjectiveHash) {
      completionObjectiveToQuest.set(
        target.completionObjectiveHash,
        target.questHash,
      );
    }
  }

  const objectiveData = profile.itemComponents?.objectives?.data ?? {};

  for (const item of collectAllInventoryItems(profile)) {
    const itemHash = item.itemHash != null ? String(item.itemHash) : "";
    const instanceId = item.itemInstanceId;
    if (!itemHash || !instanceId || !stepToQuest.has(itemHash)) continue;

    for (const objective of objectiveData[instanceId]?.objectives ?? []) {
      const objectiveHash =
        objective.objectiveHash != null
          ? String(objective.objectiveHash)
          : "";
      const questHash = completionObjectiveToQuest.get(objectiveHash);
      if (!questHash || completed[questHash]) continue;
      if (isObjectiveProgressComplete(objective)) {
        completed[questHash] = true;
      }
    }
  }
}

/** Completed quest lines often retain step objectives in uninstanced progress. */
function scanUninstancedQuestLineObjectives(
  profile: ProfileQuestProgressResponse,
  targets: QuestCompletionTarget[],
  completed: Record<string, boolean>,
): void {
  const entries = collectUninstancedObjectiveEntries(profile);

  for (const target of targets) {
    if (completed[target.questHash]) continue;

    const found = new Set<string>();

    for (const entry of entries) {
      for (const objective of entry.objectives) {
        const objectiveHash =
          objective.objectiveHash != null
            ? String(objective.objectiveHash)
            : "";
        if (!isObjectiveProgressComplete(objective)) continue;
        if (target.stepObjectiveHashes?.includes(objectiveHash)) {
          found.add(objectiveHash);
        }
      }
    }

    if (
      target.completionObjectiveHash &&
      found.has(target.completionObjectiveHash)
    ) {
      completed[target.questHash] = true;
      continue;
    }

    if (
      target.stepObjectiveHashes?.length &&
      found.size === target.stepObjectiveHashes.length
    ) {
      completed[target.questHash] = true;
    }
  }
}

function applyRecordAndItemCompletion(
  targets: QuestCompletionTarget[],
  completed: Record<string, boolean>,
  recordInstances: Map<string, RecordInstance>,
  ownedItemHashes: Set<string>,
): void {
  for (const target of targets) {
    if (completed[target.questHash]) continue;

    if (target.recordHash && target.recordObjectiveHash) {
      if (
        isQuestRecordObjectiveComplete(
          recordInstances.get(target.recordHash),
          target.recordObjectiveHash,
        )
      ) {
        completed[target.questHash] = true;
        continue;
      }
    } else if (
      target.recordHash &&
      isQuestRecordComplete(recordInstances.get(target.recordHash))
    ) {
      completed[target.questHash] = true;
      continue;
    }

    if (
      target.fallbackRecordHashes?.length &&
      target.fallbackRecordHashes.every((hash) =>
        isQuestRecordComplete(recordInstances.get(hash)),
      )
    ) {
      completed[target.questHash] = true;
      continue;
    }

    if (
      target.completionItemHash &&
      ownedItemHashes.has(target.completionItemHash)
    ) {
      completed[target.questHash] = true;
    }
  }
}

/** Returns quest-line completion keyed by canonical questHash. */
export async function fetchCompletedQuestHashes(
  session: BungieUserSession,
  targets: QuestCompletionTarget[],
): Promise<Record<string, boolean>> {
  if (targets.length === 0) return {};

  const membership = await resolveDestinyMembership(session);
  if (!membership) return {};

  const profile = await bungieGet<ProfileQuestProgressResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=102,104,200,201,202,301,900`,
    session.accessToken,
  );

  const stepToQuest = buildStepLookup(targets);
  const completionSteps = new Set(
    targets.map((target) => target.completionStepHash),
  );
  const completionObjectiveToQuest = new Map(
    targets
      .filter((target) => target.completionObjectiveHash)
      .map((target) => [target.completionObjectiveHash!, target.questHash]),
  );
  const completed: Record<string, boolean> = {};

  scanActiveQuestStatuses(
    profile,
    stepToQuest,
    completionSteps,
    completionObjectiveToQuest,
    completed,
  );

  scanUninstancedQuestStepBuckets(profile, targets, stepToQuest, completed);

  scanInventoryQuestSteps(profile, stepToQuest, completionSteps, completed);
  scanInstancedCompletionObjectives(profile, stepToQuest, targets, completed);
  scanUninstancedCompletionObjectives(profile, targets, completed);
  scanUninstancedQuestLineObjectives(profile, targets, completed);

  const recordInstances = readRecordInstances(profile);
  scanRecordsForQuestObjectives(recordInstances, targets, completed);
  const ownedItemHashes = collectOwnedItemHashes(profile);
  applyRecordAndItemCompletion(
    targets,
    completed,
    recordInstances,
    ownedItemHashes,
  );

  return completed;
}

export function parseQuestCompletionTargets(
  raw: string,
): QuestCompletionTarget[] {
  const targets: QuestCompletionTarget[] = [];

  for (const entry of raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 64)) {
    const [
      questPart,
      recordPart,
      fallbackPart,
      completionItemHash,
      completionObjectiveHash,
      stepObjectivePart,
    ] = entry.split("~");
    const [questHash, completionStepHash, ...extraSteps] =
      questPart.split(":");
    if (!questHash || !completionStepHash) continue;

    const [recordHash, recordObjectiveHash] = (recordPart ?? "").split("|");

    targets.push({
      questHash,
      completionStepHash,
      ...(extraSteps.length > 0 ? { stepHashes: extraSteps } : {}),
      ...(recordHash ? { recordHash } : {}),
      ...(recordObjectiveHash ? { recordObjectiveHash } : {}),
      ...(fallbackPart
        ? { fallbackRecordHashes: fallbackPart.split("|").filter(Boolean) }
        : {}),
      ...(completionItemHash ? { completionItemHash } : {}),
      ...(completionObjectiveHash ? { completionObjectiveHash } : {}),
      ...(stepObjectivePart
        ? {
            stepObjectiveHashes: stepObjectivePart
              .split("|")
              .filter(Boolean),
          }
        : {}),
    });
  }

  return targets;
}

export function serializeQuestCompletionTargets(
  targets: QuestCompletionTarget[],
): string {
  return targets
    .map((target) => {
      const parts = [target.questHash, target.completionStepHash];
      if (target.stepHashes?.length) parts.push(...target.stepHashes);
      const questPart = parts.join(":");

      const hasMetadata = Boolean(
        target.recordHash ||
          target.recordObjectiveHash ||
          target.fallbackRecordHashes?.length ||
          target.completionItemHash ||
          target.completionObjectiveHash ||
          target.stepObjectiveHashes?.length,
      );
      if (!hasMetadata) return questPart;

      const recordPart = target.recordObjectiveHash
        ? `${target.recordHash ?? ""}|${target.recordObjectiveHash}`
        : (target.recordHash ?? "");

      return [
        questPart,
        recordPart,
        target.fallbackRecordHashes?.join("|") ?? "",
        target.completionItemHash ?? "",
        target.completionObjectiveHash ?? "",
        target.stepObjectiveHashes?.join("|") ?? "",
      ].join("~");
    })
    .join(",");
}
