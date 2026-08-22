"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  useProfileRecordInstances,
  useProfileStringVariables,
} from "@/components/profile-progress-provider";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { TriumphGroupView } from "@/components/triumph-group-view";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { useSignedIn } from "@/lib/use-signed-in";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";
import {
  countTitleProgress,
  getTitleCompletionTier,
  splitTitleRecords,
} from "@/lib/triumphs/record-progress";
import type {
  TitleEntry,
  TriumphGroup,
} from "@/types/triumph";

type ExpansionTriumphsPanelProps = {
  title: TitleEntry | null;
  triumphGroup: TriumphGroup | null;
  triumphsGroupTitle: string;
};

function CollapsibleBlock({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left sm:px-4"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? <div className="border-t border-zinc-800 p-3 sm:p-4">{children}</div> : null}
    </section>
  );
}

export function ExpansionTriumphsPanel({
  title,
  triumphGroup,
  triumphsGroupTitle,
}: ExpansionTriumphsPanelProps) {
  const signedIn = useSignedIn();
  const hydratedInstances = useProfileRecordInstances();
  const hydratedVariables = useProfileStringVariables();

  const instanceMap = useMemo(
    () => new Map(Object.entries(signedIn ? hydratedInstances : {})),
    [hydratedInstances, signedIn],
  );

  const titleProgress = useMemo(() => {
    if (!title) {
      return {
        base: { completed: 0, total: 0 },
        all: { completed: 0, total: 0 },
      };
    }
    return countTitleProgress(title, instanceMap);
  }, [instanceMap, title]);

  const titleTier = useMemo(() => {
    if (!title || !signedIn) return "none" as const;
    return getTitleCompletionTier(title, instanceMap);
  }, [instanceMap, signedIn, title]);

  const gildingRecords = title ? splitTitleRecords(title.records).gildingRecords : [];
  const iconPath = title
    ? resolveTriumphIcon(title.iconPath, title.records)
    : "";

  if (!title && !triumphGroup) return null;

  return (
    <div className="space-y-6">
      {title ? (
        <CollapsibleBlock
          title={
            title.guardianTitle
              ? `Title // ${title.guardianTitle}`
              : "Title"
          }
          defaultOpen
        >
          <div className="grid min-w-0 gap-8 lg:grid-cols-2">
            <TriumphsListSection
              heading="Title triumphs"
              records={title.records}
              recordInstances={signedIn ? hydratedInstances : undefined}
              stringVariables={signedIn ? hydratedVariables : undefined}
            />
            <TitleDetailPanel
              name={title.name}
              guardianTitle={title.guardianTitle}
              description={title.description}
              iconPath={iconPath}
              baseProgress={titleProgress.base}
              overallProgress={titleProgress.all}
              hasGilding={gildingRecords.length > 0}
              titleTier={titleTier}
            />
          </div>
        </CollapsibleBlock>
      ) : null}

      {triumphGroup ? (
        <CollapsibleBlock title={triumphsGroupTitle} defaultOpen>
          <TriumphGroupView
            group={triumphGroup}
            recordInstances={signedIn ? hydratedInstances : undefined}
            stringVariables={signedIn ? hydratedVariables : undefined}
          />
        </CollapsibleBlock>
      ) : null}
    </div>
  );
}
