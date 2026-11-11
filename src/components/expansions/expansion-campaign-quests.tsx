"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SectionHeading } from "@/components/detail-page-parts";
import { useOwnership } from "@/components/client-ownership";
import {
  useProfileActivityCompletions,
  useProfileQuestProgress,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import { Notch } from "@/components/expansions/completion-mark";
import {
  DestinationActivitiesBanner,
  type DestinationActivitiesBannerProps,
} from "@/components/expansions/destination-activities-banner";
import {
  collectQuestCompletionTargets,
  getCampaignQuestKey,
  isCampaignQuestComplete,
} from "@/lib/expansions/expansion-progress";
import type {
  ExpansionCampaignMission,
  ExpansionCampaignQuest,
  ExpansionQuestStep,
} from "@/lib/expansions/resolve-expansion-loot";
import type { ActiveQuestStep } from "@/lib/destiny-quest-progress";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { useSignedIn } from "@/lib/use-signed-in";
import { isProfileRecordComplete, isRecordRedeemed } from "@/lib/triumphs/record-progress";
import type { RecordInstance } from "@/types/triumph";

/**
 * Expansion page · Campaign & Quests: campaign missions beside the destination's
 * Activities banner, then a quest log (list + the selected quest's steps).
 */

type Props = {
  expansionTitle: string;
  missions: ExpansionCampaignMission[];
  legendaryRecordHash: string;
  quests: ExpansionCampaignQuest[];
  destination: DestinationActivitiesBannerProps | null;
};

type StepState = "done" | "current" | "todo" | "unknown";

type QuestView = {
  quest: ExpansionCampaignQuest;
  key: string;
  steps: ExpansionQuestStep[];
  states: StepState[];
  done: number;
  complete: boolean;
  current: number;
  active: ActiveQuestStep | null;
};

type LogEntry =
  | { kind: "quest"; id: string; view: QuestView }
  | { kind: "group"; id: string; name: string; views: QuestView[] };

const CATEGORY_ORDER = ["campaign", "expansion", "exotic"] as const;

function objectiveComplete(instance: RecordInstance | undefined, objectiveHash: string): boolean {
  const objective = instance?.objectives?.find((entry) => entry.objectiveHash === objectiveHash);
  return Boolean(objective && (objective.complete || objective.progress >= objective.completionValue));
}

function recordStepDone(step: ExpansionQuestStep, instances: Record<string, RecordInstance>): boolean {
  if (!step.recordHash) return false;
  const instance = instances[step.recordHash];
  if (step.objectiveHash) return objectiveComplete(instance, step.objectiveHash);
  if (!instance) return false;
  return isRecordRedeemed(instance.state) || isProfileRecordComplete(instance);
}

function missionState(
  mission: ExpansionCampaignMission,
  legendInstance: RecordInstance | undefined,
  instances: Record<string, RecordInstance>,
  activityCompletions: Record<string, number>,
): { normal: boolean; legend: boolean } {
  const legend = mission.legendObjectiveHash ? objectiveComplete(legendInstance, mission.legendObjectiveHash) : false;
  let normal = legend;
  if (mission.normalRecordHash != null && isProfileRecordComplete(instances[mission.normalRecordHash])) normal = true;
  if (mission.activityHashes?.some((hash) => (activityCompletions[hash] ?? 0) > 0)) normal = true;
  return { normal, legend };
}

function Count({ done, total, signedIn }: { done: number; total: number; signedIn: boolean }) {
  return (
    <span className={`ui-label shrink-0 whitespace-nowrap ${signedIn && done === total ? "text-owned!" : ""}`}>
      {signedIn ? `${done} / ${total}` : total}
    </span>
  );
}

function QuestIcon({ quest, size = 36 }: { quest: ExpansionCampaignQuest; size?: number }) {
  const exotic = quest.category === "exotic";
  const className = `shrink-0 border object-cover ${exotic ? "border-[#ceae33]/60" : "border-white/[0.14]"} bg-zinc-900`;
  if (!quest.iconPath) return <span className={className} style={{ width: size, height: size }} />;
  return (
    <Image
      src={bungieIconUrl(quest.iconPath)}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
      unoptimized
    />
  );
}

function StepNotches({ states }: { states: StepState[] }) {
  return (
    <span className="flex flex-wrap justify-end gap-[3px]">
      {states.map((state, index) => (
        <Notch key={index} small complete={state === "unknown" ? null : state === "done"} />
      ))}
    </span>
  );
}

function questStatus(view: QuestView, signedIn: boolean): string {
  const total = view.steps.length;
  if (view.quest.category === "exotic" && view.quest.reward && (!signedIn || !view.complete)) {
    if (signedIn && view.current >= 0) return `Step ${view.current + 1} of ${total}`;
    return `Reward · ${view.quest.reward}`;
  }
  if (!signedIn) return total === 1 ? "1 step" : `${total} steps`;
  if (view.complete) return "Complete";
  if (view.current >= 0) return `Step ${view.current + 1} of ${total}`;
  return view.done > 0 ? `${view.done} of ${total}` : "Not started";
}

function LogRow({
  selected,
  onSelect,
  icon,
  name,
  status,
  count,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  name: string;
  status: string;
  count: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 border-t border-white/[0.07] px-3 py-2.5 text-left transition ${
        selected ? "bg-white/[0.05] shadow-[inset_2px_0_0_var(--color-bone)]" : "hover:bg-white/[0.03]"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-bone">{name}</span>
        <span className="block text-xs text-zinc-400">{status}</span>
      </span>
      {count}
    </button>
  );
}

function ObjectiveBar({ label, progress, total }: { label: string; progress: number; total: number }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#c7cad0]">
      <span>{label}</span>
      <span className="block h-1 w-[140px] bg-white/[0.12]">
        <span className="block h-1 bg-owned" style={{ width: `${total ? Math.min(100, (progress / total) * 100) : 0}%` }} />
      </span>
      <span>{`${Math.min(progress, total)} / ${total}`}</span>
    </div>
  );
}

function StepList({ view }: { view: QuestView }) {
  const listRef = useRef<HTMLOListElement>(null);
  const currentRef = useRef<HTMLLIElement>(null);
  const currentIndex = view.current;

  // Long quest lines: open on the current step (scrolls the list, not the page).
  useEffect(() => {
    const list = listRef.current;
    const current = currentRef.current;
    if (list && current) list.scrollTop = Math.max(0, current.offsetTop - list.offsetTop - 60);
    else if (list) list.scrollTop = 0;
  }, [view.key, currentIndex]);

  return (
    <ol ref={listRef} className="relative lg:max-h-[560px] lg:overflow-y-auto">
      {view.steps.map((step, index) => {
        const state = view.states[index];
        const isCurrent = state === "current";
        const progress = isCurrent ? (view.active?.objectives ?? []) : [];
        return (
          <li
            key={`${step.hash ?? step.recordHash}-${index}`}
            ref={isCurrent ? currentRef : undefined}
            className={`grid grid-cols-[28px_1fr_auto] items-start gap-3 border-t border-white/[0.07] py-2.5 ${
              isCurrent ? "bg-owned/[0.06]" : ""
            }`}
          >
            <span className={`pt-px pl-1 font-display text-[13px] ${isCurrent ? "text-owned" : "text-zinc-400"}`}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div
                className={`text-[13.5px] leading-snug ${
                  state === "done" ? "text-zinc-400" : state === "todo" ? "text-zinc-500" : "text-bone"
                }`}
              >
                {step.description}
                {isCurrent ? (
                  <span className="ml-2 inline-block border border-owned/50 px-1.5 font-display text-[10px] uppercase tracking-[0.16em] text-owned">
                    Current
                  </span>
                ) : null}
              </div>
              {progress
                .filter((objective) => objective.completionValue > 1 || !objective.complete)
                .map((objective) => {
                  const meta = step.objectives.find((entry) => entry.hash === objective.objectiveHash);
                  return (
                    <ObjectiveBar
                      key={objective.objectiveHash}
                      label={meta?.label ?? "Progress"}
                      progress={objective.progress}
                      total={objective.completionValue}
                    />
                  );
                })}
            </div>
            <span className="pt-[5px] pr-1">
              <Notch complete={state === "unknown" ? null : state === "done"} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function DetailHeader({
  quest,
  label,
  name,
  status,
  aside,
}: {
  quest: ExpansionCampaignQuest;
  label: string;
  name: string;
  status: string;
  aside: ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <div className="flex items-center gap-3.5">
        <QuestIcon quest={quest} size={40} />
        <div className="min-w-0 flex-1">
          <div className="ui-label text-xs!">{label}</div>
          <h3 className="font-display text-xl leading-tight font-semibold uppercase tracking-[0.06em] text-bone">{name}</h3>
        </div>
        <div className="hidden max-w-[45%] sm:block">{aside}</div>
      </div>
      <div className="mt-1.5 text-xs text-zinc-400">{status}</div>
    </div>
  );
}

export function ExpansionCampaignQuests({ expansionTitle, missions, legendaryRecordHash, quests, destination }: Props) {
  const signedIn = useSignedIn();
  const { ownedItemHashes } = useOwnership();
  const instances = useProfileRecordInstances();
  const missionActivityHashes = useMemo(() => missions.flatMap((mission) => mission.activityHashes ?? []), [missions]);
  const activityCompletions = useProfileActivityCompletions(missionActivityHashes);
  const targets = useMemo(() => collectQuestCompletionTargets(quests), [quests]);
  const { completed, active } = useProfileQuestProgress(targets);

  const missionRows = useMemo(() => {
    const legendInstance = instances[legendaryRecordHash];
    return missions.map((mission) => ({
      mission,
      ...(signedIn
        ? missionState(mission, legendInstance, instances, activityCompletions)
        : { normal: null, legend: null }),
    }));
  }, [activityCompletions, instances, legendaryRecordHash, missions, signedIn]);
  const showLegend = missions.some((mission) => Boolean(mission.legendObjectiveHash));

  const views = useMemo<QuestView[]>(
    () =>
      quests.map((quest) => {
        const key = getCampaignQuestKey(quest);
        const steps = quest.steps?.length ? quest.steps : [{ description: quest.name, objectives: [] }];
        // The campaign quest line is the missions: all of them done means it was finished.
        const missionsCleared =
          quest.category === "campaign" &&
          missionRows.length > 0 &&
          missionRows.every((row) => row.normal === true);
        const complete =
          signedIn && (missionsCleared || isCampaignQuestComplete(quest, instances, completed, ownedItemHashes));
        const held = signedIn && !complete ? (active[quest.questHash ?? key] ?? null) : null;
        const current = held ? steps.findIndex((step) => step.hash === held.stepHash) : -1;
        const states: StepState[] = steps.map((step, index) => {
          if (!signedIn) return "unknown";
          if (complete) return "done";
          if (step.recordHash) return recordStepDone(step, instances) ? "done" : "todo";
          if (current >= 0) return index < current ? "done" : index === current ? "current" : "todo";
          return "todo";
        });
        return {
          quest,
          key,
          steps,
          states,
          done: states.filter((state) => state === "done").length,
          complete,
          current,
          active: current >= 0 ? held : null,
        };
      }),
    [active, completed, instances, missionRows, ownedItemHashes, quests, signedIn],
  );

  const sections = useMemo(() => {
    const label: Record<(typeof CATEGORY_ORDER)[number], string> = {
      campaign: "Campaign",
      expansion: `${expansionTitle} Quests`,
      exotic: "Exotic quests",
    };
    return CATEGORY_ORDER.map((category) => {
      const entries: LogEntry[] = [];
      for (const view of views) {
        if ((view.quest.category ?? "expansion") !== category) continue;
        const group = view.quest.group;
        if (!group) {
          entries.push({ kind: "quest", id: view.key, view });
          continue;
        }
        const existing = entries.find((entry) => entry.kind === "group" && entry.name === group);
        if (existing && existing.kind === "group") existing.views.push(view);
        else entries.push({ kind: "group", id: `group:${group}`, name: group, views: [view] });
      }
      return { category, label: label[category], entries };
    }).filter((section) => section.entries.length > 0);
  }, [expansionTitle, views]);

  const entries = useMemo(() => sections.flatMap((section) => section.entries), [sections]);
  const defaultId = useMemo(() => {
    const inProgress = entries.find((entry) =>
      entry.kind === "quest" ? entry.view.current >= 0 : entry.views.some((view) => view.current >= 0),
    );
    const open = entries.find((entry) =>
      entry.kind === "quest" ? !entry.view.complete : entry.views.some((view) => !view.complete),
    );
    return (inProgress ?? open ?? entries[0])?.id ?? null;
  }, [entries]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selected = entries.find((entry) => entry.id === (pickedId ?? defaultId)) ?? null;

  if (!missions.length && !quests.length) return null;

  const missionsDone = missionRows.filter((row) => row.normal === true).length;
  const questsDone = views.filter((view) => view.complete).length;
  const note = signedIn
    ? missions.length
      ? `Campaign ${missionsDone} / ${missions.length} · Quests ${questsDone} / ${quests.length}`
      : `Quests ${questsDone} / ${quests.length}`
    : missions.length
      ? `Campaign ${missions.length} · Quests ${quests.length}`
      : `Quests ${quests.length}`;

  const sectionLabel = (view: QuestView) =>
    sections.find((section) => section.category === (view.quest.category ?? "expansion"))?.label ?? "";

  return (
    <section className="min-w-0">
      <SectionHeading title={missions.length ? "Campaign & Quests" : "Quests"} note={note} />

      {missions.length ? (
        <div className="grid items-stretch gap-3 lg:grid-cols-3">
          <div className="ui-panel px-4 py-3.5 sm:px-[18px]">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-base font-semibold uppercase tracking-[0.08em] text-bone">Campaign missions</h3>
              <Count done={missionsDone} total={missions.length} signedIn={signedIn} />
            </div>
            <div
              className="mt-1 grid items-center"
              style={{ gridTemplateColumns: showLegend ? "minmax(0,1fr) 76px 76px" : "minmax(0,1fr) 76px" }}
            >
              <span />
              <span className="pb-1.5 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Normal</span>
              {showLegend ? (
                <span className="pb-1.5 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Legend</span>
              ) : null}
              {missionRows.map(({ mission, normal, legend }) => (
                <div key={mission.name} className="contents">
                  <span className="min-w-0 border-t border-white/[0.07] py-2.5 pr-2 text-sm text-zinc-100">{mission.name}</span>
                  <span className="flex justify-center self-stretch border-t border-white/[0.07] py-2.5">
                    <Notch complete={normal} />
                  </span>
                  {showLegend ? (
                    <span className="flex justify-center self-stretch border-t border-white/[0.07] py-2.5">
                      <Notch complete={legend} />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          {destination ? (
            <div className="lg:col-span-2">
              <DestinationActivitiesBanner {...destination} />
            </div>
          ) : null}
        </div>
      ) : destination ? (
        <DestinationActivitiesBanner {...destination} wide />
      ) : null}

      {entries.length ? (
        <div
          className={`ui-panel grid lg:grid-cols-[calc((100%-10px)/3-1px)_1fr] ${missions.length || destination ? "mt-3" : ""}`}
        >
          <div className="pb-2 lg:border-r lg:border-white/10">
            {sections.map((section) => (
              <div key={section.category}>
                <div className="ui-label px-3 pt-3.5 pb-1.5 text-xs!">{section.label}</div>
                {section.entries.map((entry) => {
                  if (entry.kind === "group") {
                    const done = entry.views.filter((view) => view.complete).length;
                    return (
                      <LogRow
                        key={entry.id}
                        selected={selected?.id === entry.id}
                        onSelect={() => setPickedId(entry.id)}
                        icon={<QuestIcon quest={entry.views[0].quest} />}
                        name={entry.name}
                        status={`${entry.views.length} quests`}
                        count={<Count done={done} total={entry.views.length} signedIn={signedIn} />}
                      />
                    );
                  }
                  const { view } = entry;
                  return (
                    <LogRow
                      key={entry.id}
                      selected={selected?.id === entry.id}
                      onSelect={() => setPickedId(entry.id)}
                      icon={<QuestIcon quest={view.quest} />}
                      name={view.quest.name}
                      status={questStatus(view, signedIn)}
                      count={<Count done={view.done} total={view.steps.length} signedIn={signedIn} />}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {selected ? (
            <div className="min-w-0 border-t border-white/10 px-4 py-4 sm:px-[22px] sm:py-[18px] lg:border-t-0">
              {selected.kind === "quest" ? (
                <>
                  <DetailHeader
                    quest={selected.view.quest}
                    label={sectionLabel(selected.view)}
                    name={selected.view.quest.name}
                    status={[
                      questStatus(selected.view, signedIn),
                      selected.view.quest.reward && !questStatus(selected.view, signedIn).startsWith("Reward")
                        ? `Reward · ${selected.view.quest.reward}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    aside={<StepNotches states={selected.view.states} />}
                  />
                  <StepList view={selected.view} />
                </>
              ) : (
                <>
                  <DetailHeader
                    quest={selected.views[0].quest}
                    label={sectionLabel(selected.views[0])}
                    name={selected.name}
                    status={`${selected.views.length} quests`}
                    aside={
                      <StepNotches
                        states={selected.views.map((view) => (!signedIn ? "unknown" : view.complete ? "done" : "todo"))}
                      />
                    }
                  />
                  <ul>
                    {selected.views.map((view) => (
                      <li key={view.key} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/[0.07] py-2.5">
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-bone">{view.quest.name}</span>
                          <span className="block text-xs text-zinc-400">{questStatus(view, signedIn)}</span>
                        </span>
                        <StepNotches states={view.states} />
                        <Count done={view.done} total={view.steps.length} signedIn={signedIn} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
