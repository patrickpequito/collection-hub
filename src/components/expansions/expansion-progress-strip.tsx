"use client";

import { useEffect, useMemo, useState } from "react";
import { useOwnership } from "@/components/client-ownership";
import { useSignedIn } from "@/lib/use-signed-in";
import {
  isProfileRecordComplete,
} from "@/lib/triumphs/record-progress";
import type { ExpansionCampaignMission } from "@/lib/expansions/resolve-expansion-loot";
import type { RecordInstance, TriumphRecord } from "@/types/triumph";

type ExpansionProgressStripProps = {
  collectionTotal: number;
  /** Each entry is the set of hashes that count as one collection item. */
  collectionOwnershipGroups: string[][];
  titleRecords: TriumphRecord[];
  campaignMissions: ExpansionCampaignMission[];
  campaignLegendaryRecordHash: string;
  lootTotal: number;
  lootOwnershipGroups: string[][];
};

function countOwnedGroups(
  groups: string[][],
  ownedItemHashes: Set<string>,
): number {
  let count = 0;
  for (const group of groups) {
    if (group.some((hash) => ownedItemHashes.has(hash))) count += 1;
  }
  return count;
}

function countCompleteRecords(
  records: TriumphRecord[],
  instances: Record<string, RecordInstance>,
): number {
  return records.filter((record) =>
    isProfileRecordComplete(instances[record.recordHash]),
  ).length;
}

function objectiveComplete(
  instance: RecordInstance | undefined,
  objectiveHash: string,
): boolean | null {
  if (!instance) return null;
  const objective = instance.objectives?.find(
    (entry) => entry.objectiveHash === objectiveHash,
  );
  if (objective) {
    return (
      Boolean(objective.complete) ||
      objective.progress >= objective.completionValue
    );
  }
  if (isProfileRecordComplete(instance)) return true;
  return null;
}

function StatCard({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  /** 0–1 when known; null shows an empty track. */
  progress: number | null;
}) {
  const widthPercent =
    progress == null ? 0 : Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-zinc-900/40 ${
        progress != null && progress >= 1
          ? "border-[#c9a227]/50"
          : "border-zinc-800"
      }`}
    >
      <div className="px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-100">
          {value}
        </p>
      </div>
      <div
        className="h-1 w-full bg-zinc-800"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress == null ? undefined : Math.round(widthPercent)}
      >
        <div
          className="h-full bg-[#c9a227] transition-[width] duration-300 ease-out"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}

export function ExpansionProgressStrip({
  collectionTotal,
  collectionOwnershipGroups,
  titleRecords,
  campaignMissions,
  campaignLegendaryRecordHash,
  lootTotal,
  lootOwnershipGroups,
}: ExpansionProgressStripProps) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const [instances, setInstances] = useState<Record<string, RecordInstance>>(
    {},
  );

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetch("/api/triumphs/profile", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          recordInstances?: Record<string, RecordInstance>;
        };
        if (!cancelled) setInstances(payload.recordInstances ?? {});
      })
      .catch(() => {
        if (!cancelled) setInstances({});
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const collectionOwned = useMemo(
    () =>
      showOwnership
        ? countOwnedGroups(collectionOwnershipGroups, ownedItemHashes)
        : null,
    [collectionOwnershipGroups, ownedItemHashes, showOwnership],
  );

  const lootOwned = useMemo(
    () =>
      showOwnership
        ? countOwnedGroups(lootOwnershipGroups, ownedItemHashes)
        : null,
    [lootOwnershipGroups, ownedItemHashes, showOwnership],
  );

  const titleDone = signedIn
    ? countCompleteRecords(titleRecords, instances)
    : null;

  const campaignCounts = useMemo(() => {
    if (!signedIn) return null;
    const legendInstance = instances[campaignLegendaryRecordHash];
    let normal = 0;
    let legend = 0;
    for (const mission of campaignMissions) {
      const legendDone = objectiveComplete(
        legendInstance,
        mission.legendObjectiveHash,
      );
      let normalDone: boolean | null = null;
      if (mission.normalRecordHash != null) {
        normalDone = isProfileRecordComplete(
          instances[mission.normalRecordHash],
        );
      }
      if (legendDone === true) normalDone = true;
      else if (mission.normalRecordHash == null) normalDone = legendDone;

      if (normalDone === true) normal += 1;
      if (legendDone === true) legend += 1;
    }
    return { normal, legend };
  }, [
    campaignLegendaryRecordHash,
    campaignMissions,
    instances,
    signedIn,
  ]);

  const missionCount = campaignMissions.length;
  const campaignValue =
    campaignCounts == null
      ? `— / ${missionCount} · — / ${missionCount}`
      : `${campaignCounts.normal}/${missionCount} N · ${campaignCounts.legend}/${missionCount} L`;

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Collection"
        value={
          collectionOwned === null
            ? `— / ${collectionTotal}`
            : `${collectionOwned}/${collectionTotal}`
        }
        progress={
          collectionOwned == null || collectionTotal === 0
            ? null
            : collectionOwned / collectionTotal
        }
      />
      <StatCard
        label="Title"
        value={
          titleDone === null
            ? `— / ${titleRecords.length}`
            : `${titleDone}/${titleRecords.length}`
        }
        progress={
          titleDone == null || titleRecords.length === 0
            ? null
            : titleDone / titleRecords.length
        }
      />
      <StatCard
        label="Campaign"
        value={campaignValue}
        progress={
          campaignCounts == null || missionCount === 0
            ? null
            : (campaignCounts.normal + campaignCounts.legend) /
              (missionCount * 2)
        }
      />
      <StatCard
        label="Loot owned"
        value={
          lootOwned === null ? `— / ${lootTotal}` : `${lootOwned}/${lootTotal}`
        }
        progress={
          lootOwned == null || lootTotal === 0 ? null : lootOwned / lootTotal
        }
      />
    </section>
  );
}
