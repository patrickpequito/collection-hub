"use client";

import { TriumphTile } from "@/components/triumph-tile";
import type {
  RecordInstance,
  TriumphRecord,
  TriumphStringVariables,
} from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

type TriumphRecordListProps = {
  records: TriumphRecord[];
  recordInstances: Map<string, RecordInstance>;
  showProgress: boolean;
  strictCompletion?: boolean;
  stringVariables?: TriumphStringVariables;
  /** Two columns from md up (full-width lists); one column next to a side panel. */
  columns?: 1 | 2;
};

/** Triumphs as in-game tiles, the same as the Triumphs pages. */
export function TriumphRecordList({
  records,
  recordInstances,
  showProgress,
  strictCompletion = false,
  stringVariables = EMPTY_TRIUMPH_STRING_VARIABLES,
  columns = 1,
}: TriumphRecordListProps) {
  return (
    <div className={`grid gap-2.5 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
      {records.map((record) => (
        <TriumphTile
          key={record.recordHash}
          record={record}
          instance={recordInstances.get(record.recordHash)}
          showProgress={showProgress}
          strictCompletion={strictCompletion}
          stringVariables={stringVariables}
        />
      ))}
    </div>
  );
}
