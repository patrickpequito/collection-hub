"use client";

import { useProfileRecordInstances, useProfileStringVariables } from "@/components/profile-progress-provider";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { useSignedIn } from "@/lib/use-signed-in";
import type { TriumphRecord } from "@/types/triumph";

/** Triumph lists side by side for playlists without a title (e.g. Vanguard Ops). */
export function PlaylistTriumphColumns({
  columns,
}: {
  columns: { heading: string; records: TriumphRecord[] }[];
}) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const variables = useProfileStringVariables();
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start">
      {columns.map((column) => (
        <TriumphsListSection
          key={column.heading}
          heading={column.heading}
          records={column.records}
          recordInstances={signedIn ? instances : undefined}
          stringVariables={signedIn ? variables : undefined}
        />
      ))}
    </div>
  );
}
