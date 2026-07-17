"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { PressableButton } from "@/components/pressable-button";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { useSignedIn } from "@/lib/use-signed-in";
import {
  collectLeafSections,
  countSectionProgress,
} from "@/lib/triumphs/sections";
import {
  countTriumphProgress,
  progressPercent,
} from "@/lib/triumphs/record-progress";
import type {
  RecordInstance,
  TriumphGroup,
  TriumphProgress,
  TriumphSection,
  TriumphStringVariables,
} from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

type TriumphGroupViewProps = {
  group: TriumphGroup;
  /** When omitted, progress loads client-side if the user is signed in. */
  progress?: TriumphProgress;
  recordInstances?: Record<string, RecordInstance>;
  showProgress?: boolean;
  signInMessage?: string;
  stringVariables?: TriumphStringVariables;
};

const COMPLETE_SECTION_BORDER = "border-[#c9a227]/60";
const COMPLETE_SUBGROUP_BORDER = "border-[#c9a227]/40";
const COMPLETE_SUBGROUP_BG = "bg-[#c9a227]/10";
const COMPLETE_SUBGROUP_BG_SELECTED = "bg-[#c9a227]/15";
const COMPLETE_SUBGROUP_BG_HOVER = "hover:bg-[#c9a227]/15";

function isSectionComplete(
  sectionProgress: TriumphProgress,
  showProgress: boolean,
): boolean {
  return (
    showProgress &&
    sectionProgress.total > 0 &&
    sectionProgress.completed === sectionProgress.total
  );
}

function getLeavesForTopSection(section: TriumphSection) {
  return collectLeafSections([section]);
}

function SectionIconTab({
  section,
  selected,
  onSelect,
  recordInstances,
  showProgress,
}: {
  section: TriumphSection;
  selected: boolean;
  onSelect: (presentationNodeHash: string) => void;
  recordInstances: Map<string, RecordInstance>;
  showProgress: boolean;
}) {
  const iconUrl = bungieIconUrl(section.iconPath);
  const sectionProgress = countSectionProgress(section, recordInstances);
  const isComplete = isSectionComplete(sectionProgress, showProgress);

  return (
    <PressableButton
      type="button"
      onClick={() => onSelect(section.presentationNodeHash)}
      title={section.name}
      aria-label={section.name}
      aria-pressed={selected}
      className={`flex h-16 w-full min-w-0 items-center justify-center border ${
        isComplete
          ? `${COMPLETE_SECTION_BORDER} ${
              selected
                ? COMPLETE_SUBGROUP_BG_SELECTED
                : `${COMPLETE_SUBGROUP_BG} ${COMPLETE_SUBGROUP_BG_HOVER}`
            }`
          : selected
            ? "border-zinc-500 bg-zinc-800/90"
            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
      }`}
    >
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt=""
          width={40}
          height={40}
          className="object-contain"
          unoptimized
        />
      ) : (
        <span className="px-1 text-center text-[10px] leading-tight text-zinc-400">
          {section.name}
        </span>
      )}
    </PressableButton>
  );
}

function LeafSectionNav({
  sections,
  selectedHash,
  onSelect,
  recordInstances,
  showProgress,
}: {
  sections: TriumphSection[];
  selectedHash: string;
  onSelect: (presentationNodeHash: string) => void;
  recordInstances: Map<string, RecordInstance>;
  showProgress: boolean;
}) {
  return (
    <nav className="mt-4 space-y-1">
      {sections.map((section) => {
        const sectionProgress = countSectionProgress(section, recordInstances);
        const isSelected = selectedHash === section.presentationNodeHash;
        const isComplete = isSectionComplete(sectionProgress, showProgress);

        return (
          <PressableButton
            key={section.presentationNodeHash}
            type="button"
            onClick={() => onSelect(section.presentationNodeHash)}
            className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left ${
              isComplete
                ? `${COMPLETE_SUBGROUP_BORDER} ${
                    isSelected
                      ? `${COMPLETE_SUBGROUP_BG_SELECTED} text-zinc-100`
                      : `${COMPLETE_SUBGROUP_BG} text-zinc-200 ${COMPLETE_SUBGROUP_BG_HOVER}`
                  }`
                : isSelected
                  ? "border-zinc-600 bg-zinc-800/80 text-zinc-100"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/70"
            }`}
          >
            <span className="min-w-0 truncate text-sm">{section.name}</span>
            <span className="shrink-0 tabular-nums text-xs text-zinc-400">
              {showProgress
                ? `${sectionProgress.completed} / ${sectionProgress.total}`
                : sectionProgress.total}
            </span>
          </PressableButton>
        );
      })}
    </nav>
  );
}

function GroupProgressBar({
  progress,
  showProgress,
}: {
  progress: TriumphProgress;
  showProgress: boolean;
}) {
  const progressPercentValue = progressPercent(progress);

  return (
    <div className="mt-6 w-full">
      <div className="flex items-center justify-between gap-3 text-sm text-zinc-300">
        <span>Progress</span>
        <span className="tabular-nums">
          {showProgress
            ? `${progress.completed} / ${progress.total}`
            : progress.total}
        </span>
      </div>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-600"
          style={{
            width: showProgress ? `${progressPercentValue}%` : "0%",
          }}
        />
      </div>
    </div>
  );
}

export function TriumphGroupView({
  group,
  progress: progressProp,
  recordInstances: recordInstancesProp,
  showProgress: showProgressProp,
  signInMessage = "Sign in to see triumph progress.",
  stringVariables: stringVariablesProp,
}: TriumphGroupViewProps) {
  const signedIn = useSignedIn();
  const [hydratedInstances, setHydratedInstances] = useState<
    Record<string, RecordInstance>
  >({});
  const [hydratedVariables, setHydratedVariables] =
    useState<TriumphStringVariables>(EMPTY_TRIUMPH_STRING_VARIABLES);
  const [hydrateError, setHydrateError] = useState<string | null>(null);

  useEffect(() => {
    if (recordInstancesProp) return;
    if (!signedIn) return;

    let cancelled = false;
    fetch("/api/triumphs/profile", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          recordInstances: Record<string, RecordInstance>;
          stringVariables: TriumphStringVariables;
          error: string | null;
        };
        if (cancelled) return;
        setHydratedInstances(payload.recordInstances ?? {});
        setHydratedVariables(
          payload.stringVariables ?? EMPTY_TRIUMPH_STRING_VARIABLES,
        );
        setHydrateError(payload.error);
      })
      .catch((error) => {
        if (cancelled) return;
        setHydrateError(
          error instanceof Error
            ? error.message
            : "Failed to load triumph progress",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [recordInstancesProp, signedIn]);

  const recordInstances = useMemo(
    () => recordInstancesProp ?? (signedIn ? hydratedInstances : {}),
    [recordInstancesProp, signedIn, hydratedInstances],
  );
  const stringVariables =
    stringVariablesProp ??
    (signedIn ? hydratedVariables : EMPTY_TRIUMPH_STRING_VARIABLES);
  const showProgress =
    showProgressProp ?? (signedIn && !hydrateError);
  const instances = useMemo(
    () => new Map(Object.entries(recordInstances)),
    [recordInstances],
  );
  const progress =
    progressProp ?? countTriumphProgress(group.records, instances);
  const ownsHydration = recordInstancesProp === undefined;
  const topSections = group.sections ?? [];
  const showTopTabs = topSections.length > 1;

  const [selectedTopHash, setSelectedTopHash] = useState(
    () => topSections[0]?.presentationNodeHash ?? "",
  );

  const selectedTopSection =
    topSections.find(
      (section) => section.presentationNodeHash === selectedTopHash,
    ) ?? topSections[0];

  const leafSections = useMemo(
    () =>
      selectedTopSection ? getLeavesForTopSection(selectedTopSection) : [],
    [selectedTopSection],
  );

  const [selectedLeafHash, setSelectedLeafHash] = useState(
    () => leafSections[0]?.presentationNodeHash ?? "",
  );

  const activeLeafHash = leafSections.some(
    (section) => section.presentationNodeHash === selectedLeafHash,
  )
    ? selectedLeafHash
    : (leafSections[0]?.presentationNodeHash ?? "");

  const selectedLeaf =
    leafSections.find(
      (section) => section.presentationNodeHash === activeLeafHash,
    ) ?? leafSections[0];

  const handleTopSelect = (presentationNodeHash: string) => {
    setSelectedTopHash(presentationNodeHash);
    const topSection = topSections.find(
      (section) => section.presentationNodeHash === presentationNodeHash,
    );
    const leaves = topSection ? getLeavesForTopSection(topSection) : [];
    setSelectedLeafHash(leaves[0]?.presentationNodeHash ?? "");
  };

  const heading = selectedTopSection
    ? `${group.name} // ${selectedTopSection.name}`
    : group.name;

  const listRecordInstances = ownsHydration
    ? recordInstances
    : recordInstancesProp;
  const listShowProgress = ownsHydration
    ? Boolean(showProgress)
    : showProgressProp;
  const listStringVariables = ownsHydration
    ? stringVariables
    : stringVariablesProp;

  if (!topSections.length) {
    return (
      <div className="space-y-6">
        {hydrateError && signedIn ? (
          <p className="text-xs text-amber-200/80">
            Progress unavailable: {hydrateError}
          </p>
        ) : null}
        <GroupProgressBar
          progress={progress}
          showProgress={Boolean(showProgress)}
        />
        <TriumphsListSection
          records={group.records}
          recordInstances={listRecordInstances}
          showProgress={listShowProgress}
          stringVariables={listStringVariables}
          signInMessage={signInMessage}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        {hydrateError && signedIn ? (
          <p className="mb-4 text-xs text-amber-200/80">
            Progress unavailable: {hydrateError}
          </p>
        ) : null}
        {showTopTabs ? (
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${topSections.length}, minmax(0, 1fr))`,
            }}
          >
            {topSections.map((section) => (
              <SectionIconTab
                key={section.presentationNodeHash}
                section={section}
                selected={
                  selectedTopSection?.presentationNodeHash ===
                  section.presentationNodeHash
                }
                onSelect={handleTopSelect}
                recordInstances={instances}
                showProgress={Boolean(showProgress)}
              />
            ))}
          </div>
        ) : null}

        <LeafSectionNav
          sections={leafSections}
          selectedHash={activeLeafHash}
          onSelect={setSelectedLeafHash}
          recordInstances={instances}
          showProgress={Boolean(showProgress)}
        />

        <GroupProgressBar
          progress={progress}
          showProgress={Boolean(showProgress)}
        />
      </div>

      <div className="lg:col-span-2">
        <TriumphsListSection
          heading={heading}
          records={selectedLeaf?.records ?? []}
          recordInstances={listRecordInstances}
          showProgress={listShowProgress}
          stringVariables={listStringVariables}
          signInMessage={signInMessage}
        />
      </div>
    </div>
  );
}
