"use client";

import { useState, type ReactNode } from "react";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { TriumphGroupView } from "@/components/triumph-group-view";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import type {
  TitleCompletionTier,
  TriumphGroup,
  TriumphProgress,
  TriumphRecord,
} from "@/types/triumph";

type ExpansionTriumphsPanelProps = {
  titleName: string;
  guardianTitle: string | null;
  titleDescription: string;
  titleIconPath: string;
  baseProgress: TriumphProgress;
  overallProgress: TriumphProgress;
  hasGilding: boolean;
  titleTier: TitleCompletionTier;
  titleRecords: TriumphRecord[];
  triumphGroup: TriumphGroup | null;
  triumphsGroupTitle: string;
  showTitleSeal: boolean;
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
  titleName,
  guardianTitle,
  titleDescription,
  titleIconPath,
  baseProgress,
  overallProgress,
  hasGilding,
  titleTier,
  titleRecords,
  triumphGroup,
  triumphsGroupTitle,
  showTitleSeal,
}: ExpansionTriumphsPanelProps) {
  if (!showTitleSeal && !triumphGroup) return null;

  return (
    <div className="space-y-6">
      {showTitleSeal ? (
        <CollapsibleBlock
          title={guardianTitle ? `Title // ${guardianTitle}` : "Title"}
          defaultOpen
        >
          <div className="grid min-w-0 gap-8 lg:grid-cols-2">
            <TriumphsListSection
              heading="Title triumphs"
              records={titleRecords}
            />
            <TitleDetailPanel
              name={titleName}
              guardianTitle={guardianTitle}
              description={titleDescription}
              iconPath={titleIconPath}
              baseProgress={baseProgress}
              overallProgress={overallProgress}
              hasGilding={hasGilding}
              titleTier={titleTier}
            />
          </div>
        </CollapsibleBlock>
      ) : null}

      {triumphGroup ? (
        <CollapsibleBlock title={triumphsGroupTitle} defaultOpen>
          <TriumphGroupView group={triumphGroup} />
        </CollapsibleBlock>
      ) : null}
    </div>
  );
}
