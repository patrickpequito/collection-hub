"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
import {
  useProfileActivityCompletions,
  useProfileQuestCompletions,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import { CompletionMark } from "@/components/expansions/completion-mark";
import {
  getCampaignQuestKey,
  isCampaignQuestComplete,
  collectQuestCompletionTargets,
  collectDifficultyHuntActivityHashes,
  getHuntDifficultyTiers,
} from "@/lib/expansions/expansion-progress";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { useSignedIn } from "@/lib/use-signed-in";
import {
  isProfileRecordComplete,
  isRecordRedeemed,
} from "@/lib/triumphs/record-progress";
import type {
  ExpansionCampaignMission,
  ExpansionCampaignQuest,
  ExpansionDifficultyHunt,
} from "@/lib/expansions/resolve-expansion-loot";
import type { RecordInstance } from "@/types/triumph";

type ExpansionCampaignMissionsPanelProps = {
  missions: ExpansionCampaignMission[];
  legendaryRecordHash: string;
  quests?: ExpansionCampaignQuest[];
  difficultyHunts?: ExpansionDifficultyHunt[];
  difficultyHuntsTitle?: string;
};

function objectiveComplete(
  instance: RecordInstance | undefined,
  objectiveHash: string,
): boolean | null {
  if (!objectiveHash) return null;
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

function recordComplete(
  recordHash: string,
  instances: Record<string, RecordInstance>,
  signedIn: boolean,
): boolean | null {
  if (!signedIn) return null;
  const instance = instances[recordHash];
  if (!instance) return false;
  if (isRecordRedeemed(instance.state)) return true;
  return isProfileRecordComplete(instance);
}

function anyHashCompleted(
  hashes: string[],
  completions: Record<string, number>,
): boolean {
  return hashes.some((hash) => (completions[hash] ?? 0) > 0);
}

export function ExpansionCampaignMissionsPanel({
  missions,
  legendaryRecordHash,
  quests = [],
  difficultyHunts = [],
  difficultyHuntsTitle = "Difficulty activities",
}: ExpansionCampaignMissionsPanelProps) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const instances = useProfileRecordInstances();
  const huntActivityHashes = useMemo(
    () => collectDifficultyHuntActivityHashes(difficultyHunts),
    [difficultyHunts],
  );
  const campaignQuestTargets = useMemo(
    () => collectQuestCompletionTargets(quests),
    [quests],
  );
  const activityCompletions = useProfileActivityCompletions(huntActivityHashes);
  const completedQuestHashes = useProfileQuestCompletions(campaignQuestTargets);

  const usesQuestsAndHunts = quests.length > 0 || difficultyHunts.length > 0;
  const showLegendColumn = missions.some((mission) =>
    Boolean(mission.legendObjectiveHash),
  );

  const missionRows = useMemo(() => {
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
        if (legend === true) normal = true;
        else if (mission.normalRecordHash == null) normal = legend;
      }

      return { mission, normal, legend };
    });
  }, [instances, legendaryRecordHash, missions, signedIn]);

  if (
    missions.length === 0 &&
    quests.length === 0 &&
    difficultyHunts.length === 0
  ) {
    return null;
  }

  const sectionTitle = usesQuestsAndHunts
    ? difficultyHunts.length > 0
      ? `Campaign & ${difficultyHuntsTitle}`
      : "Campaign"
    : "Campaign";

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <h2 className="border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        {sectionTitle}
      </h2>

      {usesQuestsAndHunts ? (
        <p className="mt-3 text-sm text-zinc-400">
          Expansion quests
          {difficultyHunts.length > 0
            ? ` and ${difficultyHuntsTitle}. Hunt difficulties use playlist clears${
                difficultyHuntsTitle === "Nightmare Hunts" ||
                difficultyHuntsTitle === "Empire Hunts"
                  ? " (Advanced / Expert / Master)."
                  : " (Adept / Hero / Legend / Master)."
              }`
            : "."}
        </p>
      ) : (
        <p className="mt-3 text-sm text-zinc-400">
          {showLegendColumn
            ? "Story missions with Normal and Legend completion. Normal is inferred from Legend when a mission has no dedicated Normal triumph (Investigation, Mirror)."
            : "Story mission completion (Normal). This expansion has no Legend campaign."}
        </p>
      )}

      {quests.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Expansion quests
          </h3>
          <ul className="mt-2 divide-y divide-zinc-800">
            {quests.map((quest) => {
              const iconUrl = quest.iconPath
                ? bungieIconUrl(quest.iconPath)
                : null;
              const complete = signedIn
                ? isCampaignQuestComplete(
                    quest,
                    instances,
                    completedQuestHashes,
                    showOwnership ? ownedItemHashes : undefined,
                  )
                : null;

              return (
                <li
                  key={getCampaignQuestKey(quest)}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-sm border border-zinc-800 bg-zinc-900 object-cover"
                        unoptimized
                      />
                    ) : null}
                    <span className="text-sm font-medium text-zinc-100">
                      {quest.name}
                    </span>
                  </div>
                  <CompletionMark complete={complete} label="Complete" />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {difficultyHunts.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {difficultyHuntsTitle}
          </h3>
          <ul className="mt-2 space-y-2">
            {difficultyHunts.map((hunt) => {
              const tiers = getHuntDifficultyTiers(hunt);

              return (
                <li
                  key={hunt.name}
                  className="rounded-lg border border-zinc-800 px-3 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      {hunt.name}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {tiers.map((tier) => {
                        const complete = signedIn
                          ? anyHashCompleted(
                              tier.activityHashes,
                              activityCompletions,
                            ) ||
                            (tier.higherRecordHash
                              ? recordComplete(
                                  tier.higherRecordHash,
                                  instances,
                                  signedIn,
                                ) === true
                              : false)
                          : null;

                        return (
                          <CompletionMark
                            key={tier.label}
                            complete={complete}
                            label={tier.label}
                          />
                        );
                      })}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {missions.length > 0 ? (
        <ul
          className={`divide-y divide-zinc-800 ${usesQuestsAndHunts ? "mt-4 border-t border-zinc-800" : "mt-4"}`}
        >
          {missionRows.map(({ mission, normal, legend }) => (
            <li
              key={mission.name}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-zinc-100">
                {mission.name}
              </span>
              <div className="flex flex-wrap gap-3">
                <CompletionMark complete={normal} label="Normal" />
                {showLegendColumn ? (
                  <CompletionMark complete={legend} label="Legend" />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!signedIn ? (
        <p className="mt-2 text-xs text-zinc-500">
          Sign in to see campaign completion.
        </p>
      ) : null}
    </section>
  );
}
