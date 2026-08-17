"use client";

import { useEffect, useMemo, useState } from "react";
import { CompletionMark } from "@/components/expansions/completion-mark";
import { useSignedIn } from "@/lib/use-signed-in";
import {
  isProfileRecordComplete,
} from "@/lib/triumphs/record-progress";
import type { ExpansionCampaignMission } from "@/lib/expansions/resolve-expansion-loot";
import type { RecordInstance } from "@/types/triumph";

type ExpansionCampaignMissionsPanelProps = {
  missions: ExpansionCampaignMission[];
  legendaryRecordHash: string;
};

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
  // Redeemed / objectives-met parent records often omit per-objective rows.
  if (isProfileRecordComplete(instance)) return true;
  return null;
}

export function ExpansionCampaignMissionsPanel({
  missions,
  legendaryRecordHash,
}: ExpansionCampaignMissionsPanelProps) {
  const signedIn = useSignedIn();
  const [instances, setInstances] = useState<Record<string, RecordInstance>>(
    {},
  );

  useEffect(() => {
    if (!signedIn || missions.length === 0) return;
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
  }, [missions.length, signedIn]);

  const rows = useMemo(() => {
    const legendInstance = instances[legendaryRecordHash];
    return missions.map((mission) => {
      const legend = signedIn
        ? objectiveComplete(legendInstance, mission.legendObjectiveHash)
        : null;

      let normal: boolean | null = null;
      if (signedIn) {
        if (mission.normalRecordHash != null) {
          normal = isProfileRecordComplete(
            instances[mission.normalRecordHash],
          );
        }
        // Legend clear always implies Normal for that mission. Also covers
        // Investigation / Mirror, which have no dedicated Normal triumph.
        if (legend === true) normal = true;
        else if (mission.normalRecordHash == null) normal = legend;
      }

      return { mission, normal, legend };
    });
  }, [instances, legendaryRecordHash, missions, signedIn]);

  if (missions.length === 0) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <h2 className="border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        Campaign
      </h2>
      <p className="mt-3 text-sm text-zinc-400">
        Story missions with Normal and Legend completion. Normal is inferred
        from Legend when a mission has no dedicated Normal triumph
        (Investigation, Mirror).
      </p>
      <ul className="mt-4 divide-y divide-zinc-800">
        {rows.map(({ mission, normal, legend }) => (
          <li
            key={mission.name}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium text-zinc-100">
              {mission.name}
            </span>
            <div className="flex flex-wrap gap-3">
              <CompletionMark complete={normal} label="Normal" />
              <CompletionMark complete={legend} label="Legend" />
            </div>
          </li>
        ))}
      </ul>
      {!signedIn ? (
        <p className="mt-2 text-xs text-zinc-500">
          Sign in to see campaign completion.
        </p>
      ) : null}
    </section>
  );
}
