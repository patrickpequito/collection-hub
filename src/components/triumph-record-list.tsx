import { TriumphRecordRow } from "@/components/triumph-record-row";
import type { RecordInstance, TriumphRecord } from "@/types/triumph";

type TriumphRecordListProps = {
  records: TriumphRecord[];
  recordInstances: Map<string, RecordInstance>;
  showProgress: boolean;
  strictCompletion?: boolean;
  variant?: "group" | "title";
};

export function TriumphRecordList({
  records,
  recordInstances,
  showProgress,
  strictCompletion = false,
  variant = "group",
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
        />
      ))}
    </div>
  );
}
