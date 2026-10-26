"use client";

import { BoxHeading, SectionHeading } from "@/components/detail-page-parts";
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
  ExpansionRotatingBossActivity,
  ExpansionWellspringBoss,
} from "@/lib/expansions/resolve-expansion-loot";
import type { RecordInstance } from "@/types/triumph";

type ExpansionCampaignMissionsPanelProps = {
  missions: ExpansionCampaignMission[];
  legendaryRecordHash: string;
  quests?: ExpansionCampaignQuest[];
  difficultyHunts?: ExpansionDifficultyHunt[];
  difficultyHuntsTitle?: string;
  rotatingBossActivity?: ExpansionRotatingBossActivity | null;
  wellspringNormalRecordHash?: string;
  wellspringMasterRecordHash?: string;
  wellspringBosses?: ExpansionWellspringBoss[];
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

function rotatingBossComplete(
  boss: { completionItemHash?: string; completionItemHashes?: string[] },
  ownedItemHashes: Set<string>,
): boolean {
  const hashes = boss.completionItemHashes?.length
    ? boss.completionItemHashes
    : boss.completionItemHash
      ? [boss.completionItemHash]
      : [];
  return hashes.some((hash) => ownedItemHashes.has(hash));
}

export function ExpansionCampaignMissionsPanel({
  missions,
  legendaryRecordHash,
  quests = [],
  difficultyHunts = [],
  difficultyHuntsTitle = "Difficulty activities",
  rotatingBossActivity = null,
  wellspringNormalRecordHash = "",
  wellspringMasterRecordHash = "",
  wellspringBosses = [],
}: ExpansionCampaignMissionsPanelProps) {
  const signedIn = useSignedIn();
  const { ownedItemHashes } = useOwnership();
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

  const hasRotatingBosses = Boolean(rotatingBossActivity?.bosses.length);
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
    difficultyHunts.length === 0 &&
    !hasRotatingBosses &&
    wellspringBosses.length === 0
  ) {
    return null;
  }

  const huntTierComplete = (tier: ReturnType<typeof getHuntDifficultyTiers>[number]) =>
    anyHashCompleted(tier.activityHashes, activityCompletions) ||
    (tier.higherRecordHash ? recordComplete(tier.higherRecordHash, instances, signedIn) === true : false);

  const questComplete = (quest: ExpansionCampaignQuest) =>
    isCampaignQuestComplete(quest, instances, completedQuestHashes, ownedItemHashes);

  const normalWellspring = instances[wellspringNormalRecordHash];
  const masterWellspring = instances[wellspringMasterRecordHash];

  // "done / total" when signed in, otherwise just the total.
  const countNote = (done: number, total: number) => (signedIn ? `${done} / ${total}` : total);

  const blockClass = "space-y-3 border border-hairline bg-panel/85 p-3 sm:p-4";

  return (
    <section className="min-w-0">
      <SectionHeading title="Campaign & Activities" />
      <div className="grid items-start gap-3 lg:grid-cols-3">
      {missions.length > 0 ? (
        <div className={blockClass}>
          <BoxHeading
            title="Missions"
            note={countNote(missionRows.filter((row) => row.normal === true).length, missionRows.length)}
          />
          <ul className="divide-y divide-zinc-800">
            {missionRows.map(({ mission, normal, legend }) => (
              <li key={mission.name} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-sm font-medium text-zinc-100">{mission.name}</span>
                <div className="flex flex-wrap gap-3">
                  <CompletionMark complete={normal} label="Normal" />
                  {showLegendColumn ? <CompletionMark complete={legend} label="Legend" /> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {quests.length > 0 ? (
        <div className={blockClass}>
          <BoxHeading title="Expansion quests" note={countNote(quests.filter(questComplete).length, quests.length)} />
          <ul className="divide-y divide-zinc-800">
            {quests.map((quest) => {
              const iconUrl = quest.iconPath ? bungieIconUrl(quest.iconPath) : null;
              return (
                <li key={getCampaignQuestKey(quest)} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 border border-zinc-800 bg-zinc-900 object-cover"
                        unoptimized
                      />
                    ) : null}
                    <span className="text-sm font-medium text-zinc-100">{quest.name}</span>
                  </div>
                  <CompletionMark complete={signedIn ? questComplete(quest) : null} label="Complete" />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {difficultyHunts.length > 0 ? (
        <div className={blockClass}>
          <BoxHeading
            title={difficultyHuntsTitle}
            note={countNote(
              difficultyHunts.filter((hunt) => getHuntDifficultyTiers(hunt).every(huntTierComplete)).length,
              difficultyHunts.length,
            )}
          />
          <ul>
            {difficultyHunts.map((hunt) => (
              <li key={hunt.name} className="flex flex-col gap-1.5 border-b border-white/[0.08] py-2.5 last:border-0">
                <span className="text-sm font-medium text-zinc-100">{hunt.name}</span>
                <div className="flex flex-wrap gap-3">
                  {getHuntDifficultyTiers(hunt).map((tier) => (
                    <CompletionMark
                      key={tier.label}
                      complete={signedIn ? huntTierComplete(tier) : null}
                      label={tier.label}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rotatingBossActivity && rotatingBossActivity.bosses.length > 0 ? (
        <div className={blockClass}>
          <BoxHeading
            title={rotatingBossActivity.title}
            note={countNote(
              rotatingBossActivity.bosses.filter((boss) => rotatingBossComplete(boss, ownedItemHashes)).length,
              rotatingBossActivity.bosses.length,
            )}
          />
          <ul>
            {rotatingBossActivity.bosses.map((boss) => (
              <li
                key={boss.name}
                className="flex items-center justify-between gap-2 border-b border-white/[0.08] py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-zinc-100">{boss.name}</span>
                  {boss.rewardNote ? (
                    <span className="mt-0.5 block text-xs text-zinc-500">Drops {boss.rewardNote}</span>
                  ) : null}
                </div>
                <CompletionMark complete={signedIn ? rotatingBossComplete(boss, ownedItemHashes) : null} label="Cleared" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {wellspringBosses.length > 0 ? (
        <div className={blockClass}>
          <BoxHeading title="The Wellspring" note={wellspringBosses.length} />
          <ul>
            {wellspringBosses.map((boss) => (
              <li key={boss.name} className="flex flex-col gap-1.5 border-b border-white/[0.08] py-2.5 last:border-0">
                <span className="text-sm font-medium text-zinc-100">{boss.name}</span>
                <div className="flex flex-wrap gap-3">
                  <CompletionMark
                    complete={signedIn ? objectiveComplete(normalWellspring, boss.normalObjectiveHash) : null}
                    label="Normal"
                  />
                  <CompletionMark
                    complete={signedIn ? objectiveComplete(masterWellspring, boss.masterObjectiveHash) : null}
                    label="Master"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      </div>

      {!signedIn ? (
        <p className="mt-2 text-xs text-zinc-500">Sign in to see campaign completion.</p>
      ) : null}
    </section>
  );
}
