"use client";

import { useMemo, useState } from "react";
import { TriumphRecordList } from "@/components/triumph-record-list";
import { isTriumphRecordDisplayComplete } from "@/lib/triumphs/record-progress";
import type {
  RecordInstance,
  TriumphRecord,
  TriumphStringVariables,
} from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

const TOGGLE_BUTTON_CLASS =
  "shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-300";

type TriumphsListSectionProps = {
  records: TriumphRecord[];
  recordInstances: Record<string, RecordInstance>;
  showProgress: boolean;
  signInMessage?: string;
  stringVariables?: TriumphStringVariables;
};

export function TriumphsListSection({
  records,
  recordInstances,
  showProgress,
  signInMessage,
  stringVariables = EMPTY_TRIUMPH_STRING_VARIABLES,
}: TriumphsListSectionProps) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const instances = useMemo(
    () => new Map(Object.entries(recordInstances)),
    [recordInstances],
  );

  const visibleRecords = useMemo(() => {
    if (!hideCompleted || !showProgress) return records;

    return records.filter(
      (record) =>
        !isTriumphRecordDisplayComplete(
          record,
          instances.get(record.recordHash),
          { strictCompletion: true, showProgress: true },
        ),
    );
  }, [hideCompleted, instances, records, showProgress]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Triumphs
        </h2>

        {showProgress ? (
          <button
            type="button"
            className={TOGGLE_BUTTON_CLASS}
            aria-pressed={hideCompleted}
            onClick={() => setHideCompleted((value) => !value)}
          >
            {hideCompleted ? "Show completed" : "Hide completed"}
          </button>
        ) : null}
      </div>

      {signInMessage ? (
        <p className="text-xs text-amber-200/80">{signInMessage}</p>
      ) : null}

      {hideCompleted && showProgress && visibleRecords.length === 0 ? (
        <p className="text-sm text-zinc-500">All triumphs completed.</p>
      ) : null}

      <TriumphRecordList
        records={visibleRecords}
        recordInstances={instances}
        showProgress={showProgress}
        strictCompletion
        variant="title"
        stringVariables={stringVariables}
      />
    </div>
  );
}
