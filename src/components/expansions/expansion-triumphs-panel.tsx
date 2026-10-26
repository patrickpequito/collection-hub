"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  useProfileRecordInstances,
  useProfileStringVariables,
} from "@/components/profile-progress-provider";
import { SectionHeading } from "@/components/detail-page-parts";
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
  /** Tile columns next to the title panel (2 on narrower pages that want a denser list). */
  titleColumns?: 1 | 2;
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
    <section className="min-w-0">
      <SectionHeading
        title={title}
        note={
          <button
            type="button"
            className="transition hover:text-bone"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? "Hide" : "Show"}
          </button>
        }
      />
      {open ? <div className="min-w-0 overflow-hidden border border-hairline bg-panel/85 p-3 sm:p-4">{children}</div> : null}
    </section>
  );
}

export function ExpansionTriumphsPanel({
  title,
  triumphGroup,
  triumphsGroupTitle,
  titleColumns = 1,
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
        <section className="min-w-0">
        <SectionHeading
          title={title.guardianTitle ? `Triumphs · ${title.guardianTitle}` : "Triumphs"}
          note={signedIn ? `${titleProgress.base.completed} / ${titleProgress.base.total}` : `${titleProgress.base.total} triumphs`}
          noteGold={signedIn && titleProgress.base.total > 0 && titleProgress.base.completed >= titleProgress.base.total}
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
          <div className="ui-panel p-5 lg:sticky lg:top-20">
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
          <TriumphsListSection
            heading={null}
            columns={titleColumns}
            records={title.records}
            titleRecordHashes={
              gildingRecords.length > 0
                ? splitTitleRecords(title.records).baseRecords.map((record) => record.recordHash)
                : undefined
            }
            recordInstances={signedIn ? hydratedInstances : undefined}
            stringVariables={signedIn ? hydratedVariables : undefined}
          />
        </div>
        </section>
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
