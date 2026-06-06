"use client";

import { TriumphRecordRow } from "@/components/triumph-record-row";
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
  variant?: "group" | "title";
  stringVariables?: TriumphStringVariables;
};

export function TriumphRecordList({
  records,
  recordInstances,
  showProgress,
  strictCompletion = false,
  variant = "group",
  stringVariables = EMPTY_TRIUMPH_STRING_VARIABLES,
}: TriumphRecordListProps) {
  if (variant === "title") {
    return (
      <div className="space-y-2">
        {records.map((record) => (
          <TriumphRecordRow
            key={record.recordHash}
            record={record}
            instance={recordInstances.get(record.recordHash)}
            showProgress={showProgress}
            strictCompletion={strictCompletion}
            variant="title"
            stringVariables={stringVariables}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-1 py-1">
      {records.map((record) => (
        <TriumphRecordRow
          key={record.recordHash}
          record={record}
          instance={recordInstances.get(record.recordHash)}
          showProgress={showProgress}
          strictCompletion={strictCompletion}
          variant="group"
          stringVariables={stringVariables}
        />
      ))}
    </div>
  );
}
