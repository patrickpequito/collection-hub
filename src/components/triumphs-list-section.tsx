"use client";

import { useEffect, useMemo, useState } from "react";
import { TriumphRecordList } from "@/components/triumph-record-list";
import { useSignedIn } from "@/lib/use-signed-in";
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
  recordInstances?: Record<string, RecordInstance>;
  /** When omitted, progress loads client-side if the user is signed in. */
  showProgress?: boolean;
  signInMessage?: string;
  stringVariables?: TriumphStringVariables;
  heading?: string;
};

export function TriumphsListSection({
  records,
  recordInstances: recordInstancesProp,
  showProgress: showProgressProp,
  signInMessage = "Sign in to see triumph progress.",
  stringVariables: stringVariablesProp,
  heading = "Triumphs",
}: TriumphsListSectionProps) {
  const signedIn = useSignedIn();
  const [hideCompleted, setHideCompleted] = useState(false);
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
          {heading}
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

      {hydrateError && signedIn ? (
        <p className="text-xs text-amber-200/80">
          Triumph progress unavailable: {hydrateError}
        </p>
      ) : !signedIn && signInMessage ? (
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
        variant="title"
        stringVariables={stringVariables}
      />
    </div>
  );
}
