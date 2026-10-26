import { isRecordRedeemed, isProfileRecordComplete } from "@/lib/triumphs/record-progress";
import type { SealSummary } from "@/lib/triumphs/hub";
import type { RecordInstance, TitleCompletionTier, TriumphProgress } from "@/types/triumph";

type Instances = Record<string, RecordInstance>;

function countRedeemed(hashes: string[], instances: Instances): number {
  return hashes.filter((hash) => isRecordRedeemed(instances[hash]?.state)).length;
}

/** Seal progress from Bungie record state (same rule as the in-game seal). */
export function sealProgress(seal: SealSummary, instances: Instances) {
  const earned =
    seal.completionRecordHash !== null && isRecordRedeemed(instances[seal.completionRecordHash]?.state);
  const base: TriumphProgress = {
    completed: earned ? seal.baseHashes.length : countRedeemed(seal.baseHashes, instances),
    total: seal.baseHashes.length,
  };
  const gilding: TriumphProgress = {
    completed: countRedeemed(seal.gildingHashes, instances),
    total: seal.gildingHashes.length,
  };
  const gildRecord = seal.gildingTrackingRecordHash ? instances[seal.gildingTrackingRecordHash] : undefined;
  const gildedNow = isRecordRedeemed(gildRecord?.state);
  const baseComplete = earned || (base.total > 0 && base.completed === base.total);
  const tier: TitleCompletionTier = !baseComplete ? "none" : gildedNow ? "gilded" : "base";
  const gildCount = gildRecord?.completedCount ?? (gildedNow ? 1 : 0);
  return { base, gilding, tier, gildCount, gildable: seal.gildingHashes.length > 0 };
}

/** Triumph category progress for the left column (record state based). */
export function groupProgress(recordHashes: string[], instances: Instances): TriumphProgress {
  return {
    completed: recordHashes.filter((hash) => isProfileRecordComplete(instances[hash])).length,
    total: recordHashes.length,
  };
}
