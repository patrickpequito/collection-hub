"use client";

import { useMemo, useState } from "react";
import {
  useProfileRecordInstances,
  useProfileStringVariables,
} from "@/components/profile-progress-provider";
import { TriumphRecordList } from "@/components/triumph-record-list";
import { useSignedIn } from "@/lib/use-signed-in";
import { isTriumphRecordDisplayComplete } from "@/lib/triumphs/record-progress";
import type {
  RecordInstance,
  TriumphRecord,
  TriumphStringVariables,
} from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

/** Square check + label, same as the seal page's "Hide completed". */
function CheckToggle({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="group flex items-center gap-2.5 font-display text-sm uppercase tracking-[0.12em] text-[#c7cad0] transition hover:text-bone"
    >
      <span
        aria-hidden
        className={`size-4 border transition ${
          checked ? "border-owned bg-owned bg-clip-content p-[3px]" : "border-white/45 bg-[#1d2026] group-hover:border-bone/70"
        }`}
      />
      {label}
    </button>
  );
}

type TriumphsListSectionProps = {
  records: TriumphRecord[];
  recordInstances?: Record<string, RecordInstance>;
  /** When omitted, progress loads client-side if the user is signed in. */
  showProgress?: boolean;
  signInMessage?: string;
  stringVariables?: TriumphStringVariables;
  /** Small label above the list; null when the page shows a SectionHeading instead. */
  heading?: string | null;
  /** Records that count toward the title; enables the "Title only" filter. */
  titleRecordHashes?: string[];
  /** Tile columns: 2 for full-width lists, 1 next to a side panel. */
  columns?: 1 | 2;
};

export function TriumphsListSection({
  records,
  recordInstances: recordInstancesProp,
  showProgress: showProgressProp,
  signInMessage = "Sign in to see triumph progress.",
  stringVariables: stringVariablesProp,
  heading = "Triumphs",
  titleRecordHashes,
  columns = 1,
}: TriumphsListSectionProps) {
  const signedIn = useSignedIn();
  const [hideCompleted, setHideCompleted] = useState(false);
  const [titleOnly, setTitleOnly] = useState(false);
  const profileInstances = useProfileRecordInstances();
  const profileVariables = useProfileStringVariables();

  const recordInstances = useMemo(
    () => recordInstancesProp ?? (signedIn ? profileInstances : {}),
    [recordInstancesProp, signedIn, profileInstances],
  );
  const stringVariables =
    stringVariablesProp ??
    (signedIn ? profileVariables : EMPTY_TRIUMPH_STRING_VARIABLES);
  const showProgress = showProgressProp ?? signedIn;

  const instances = useMemo(
    () => new Map(Object.entries(recordInstances)),
    [recordInstances],
  );

  const titleHashes = useMemo(
    () => (titleRecordHashes ? new Set(titleRecordHashes) : null),
    [titleRecordHashes],
  );
  const showTitleToggle =
    titleHashes !== null && records.some((record) => !titleHashes.has(record.recordHash));

  const visibleRecords = useMemo(() => {
    const scoped =
      titleOnly && titleHashes
        ? records.filter((record) => titleHashes.has(record.recordHash))
        : records;
    if (!hideCompleted || !showProgress) return scoped;

    return scoped.filter(
      (record) =>
        !isTriumphRecordDisplayComplete(
          record,
          instances.get(record.recordHash),
          { strictCompletion: true, showProgress: true },
        ),
    );
  }, [hideCompleted, instances, records, showProgress, titleHashes, titleOnly]);

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-3 ${heading ? "justify-between" : "justify-end"}`}>
        {heading ? <h3 className="ui-label">{heading}</h3> : null}

        {showProgress || showTitleToggle ? (
          <div className="flex flex-wrap justify-end gap-x-5 gap-y-2">
            {showTitleToggle ? (
              <CheckToggle label="Title only" checked={titleOnly} onToggle={() => setTitleOnly((value) => !value)} />
            ) : null}
            {showProgress ? (
              <CheckToggle
                label="Hide completed"
                checked={hideCompleted}
                onToggle={() => setHideCompleted((value) => !value)}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {!signedIn && signInMessage ? (
        <p className="text-xs text-amber-200/80">{signInMessage}</p>
      ) : null}

      {hideCompleted && showProgress && visibleRecords.length === 0 ? (
        <p className="text-sm text-zinc-500">All triumphs completed.</p>
      ) : null}

      <TriumphRecordList
        records={visibleRecords}
        recordInstances={instances}
        showProgress={Boolean(showProgress)}
        strictCompletion
        stringVariables={stringVariables}
        columns={columns}
      />
    </div>
  );
}
